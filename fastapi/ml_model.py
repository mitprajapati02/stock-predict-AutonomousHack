import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def extract_and_clean_data(df):
    """
    Extract required columns and clean the data
    """
    required_columns = [
        "product_category",
        "product_id",
        "transaction_qty",
        "transaction_date"
    ]
    
    # Check if all required columns exist
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    # Extract only required columns
    df = df[required_columns].copy()
    
    # Parse transaction_date
    df["transaction_date"] = pd.to_datetime(
        df["transaction_date"],
        format="mixed",
        dayfirst=True,
        errors="coerce"
    )
    
    # Drop rows where date could not be parsed
    df = df.dropna(subset=["transaction_date"])
    
    if df.empty:
        raise ValueError("No valid data after cleaning dates")
    
    return df


def map_product_ids(df):
    """
    Map product IDs to sequential integers for model training
    Returns mappings for both directions
    """
    product_ids = df["product_id"].unique()

    # Create forward mapping: original_id -> sequential_id
    product_id_map = {
        pid: idx for idx, pid in enumerate(product_ids)
    }

    # Create reverse mapping: sequential_id -> original_id
    reverse_product_id_map = {
        idx: pid for pid, idx in product_id_map.items()
    }

    # Add mapped column
    df["product_id_mapped"] = df["product_id"].map(product_id_map)

    return df, product_id_map, reverse_product_id_map


def aggregate_monthly_sales(df):
    """
    Aggregate sales data by month for each product
    """
    df["year"] = df["transaction_date"].dt.year
    df["month"] = df["transaction_date"].dt.month

    monthly_sales = (
        df.groupby(["product_id", "product_category", "year", "month"])
          ["transaction_qty"]
          .sum()
          .reset_index()
          .sort_values(["product_id", "year", "month"])
    )

    return monthly_sales


def create_time_features(df):
    """
    Create lag features for time series prediction
    """
    df["lag_1"] = df.groupby("product_id")["transaction_qty"].shift(1)
    df["lag_3_avg"] = (
        df.groupby("product_id")["transaction_qty"]
          .shift(1)
          .rolling(3)
          .mean()
    )

    df = df.dropna().reset_index(drop=True)
    return df


def apply_month_weight(df, target_month):
    """
    Apply seasonal weighting based on target month
    """
    df["month_weight"] = np.where(
        df["month"] == target_month,
        0.8,   # same month last year
        0.2    # other months
    )
    return df


def prepare_training_data(df):
    """
    Prepare features and target for model training
    Uses product_id_mapped instead of product_id
    """
    X = df[
        [
            "product_id_mapped",
            "month",
            "year",
            "lag_1",
            "lag_3_avg",
            "month_weight"
        ]
    ]
    y = df["transaction_qty"]

    return X, y


def train_model(X, y):
    """
    Train Random Forest model and return metrics
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    rmse = mean_squared_error(y_test, preds) ** 0.5
    r2 = r2_score(y_test, preds)

    metrics = {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 2)
    }

    return model, metrics


def predict_next_month(model, df, target_year, target_month, reverse_product_id_map):
    """
    Generate predictions for the target month
    Uses product_id_mapped for prediction and converts back to original IDs
    """
    latest = (
        df.sort_values(["product_id_mapped", "year", "month"])
          .groupby("product_id_mapped")
          .tail(1)
          .copy()
    )

    latest["previous_month_sales"] = latest["lag_1"]

    latest["month"] = target_month
    latest["year"] = target_year

    features = latest[
        [
            "product_id_mapped",
            "month",
            "year",
            "lag_1",
            "lag_3_avg",
            "month_weight"
        ]
    ]

    latest["predicted_sales"] = model.predict(features)

    # Convert back to original product_id
    latest["product_id"] = latest["product_id_mapped"].map(reverse_product_id_map)

    return latest


def generate_stock_report(df, threshold_multiplier=1.2):
    """
    Generate stock status report based on predictions
    """
    avg_sales = df["predicted_sales"].mean()
    threshold = avg_sales * threshold_multiplier

    df["stock_status"] = np.where(
        df["predicted_sales"] >= threshold,
        "HIGH STOCK REQUIRED",
        "NORMAL STOCK"
    )

    # Calculate percentage change
    df["stock_change_pct"] = np.where(
        df["previous_month_sales"] > 0,
        ((df["predicted_sales"] - df["previous_month_sales"])
         / df["previous_month_sales"]) * 100,
        np.nan
    )

    # Round for readability
    df["predicted_sales"] = df["predicted_sales"].round(2)
    df["stock_change_pct"] = df["stock_change_pct"].round(2)

    return df[
        [
            "product_id",
            "product_category",
            "previous_month_sales",
            "predicted_sales",
            "stock_change_pct",
            "stock_status"
        ]
    ]


def predict_sales_pipeline(df, target_year, target_month):
    """
    Main pipeline: Extract columns -> Process -> Train -> Predict
    Now includes product ID mapping functionality
    
    Args:
        df: Raw dataframe from frontend (can have any columns)
        target_year: Year to predict for
        target_month: Month to predict for (1-12)
    
    Returns:
        tuple: (stock_report_df, model_metrics_dict)
    """
    # Step 1: Extract and clean required columns
    cleaned_df = extract_and_clean_data(df)
    
    # Step 2: Aggregate to monthly sales
    monthly_sales = aggregate_monthly_sales(cleaned_df)
    
    # Step 3: Create time-based features
    monthly_sales = create_time_features(monthly_sales)
    
    # Step 4: Map product IDs to sequential integers
    monthly_sales, product_id_map, reverse_product_id_map = map_product_ids(monthly_sales)
    
    # Step 5: Apply seasonal weighting
    monthly_sales = apply_month_weight(monthly_sales, target_month)
    
    # Step 6: Prepare training data (uses product_id_mapped)
    X, y = prepare_training_data(monthly_sales)
    
    # Step 7: Train model
    model, metrics = train_model(X, y)
    
    # Step 8: Generate predictions (converts back to original product_id)
    predictions = predict_next_month(
        model, 
        monthly_sales, 
        target_year, 
        target_month, 
        reverse_product_id_map
    )
    
    # Step 9: Generate stock report
    stock_report = generate_stock_report(predictions)
    
    return stock_report, metrics