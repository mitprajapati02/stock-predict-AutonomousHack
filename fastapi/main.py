from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
from typing import Optional
from datetime import datetime
from ml_model import predict_sales_pipeline

app = FastAPI(
    title="Stock Prediction API",
    description="AI-Powered Sales Forecasting for Smart Inventory Management",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_month_string(month_str):
    """
    Convert month string like 'March 2026' to year and month number
    Returns: (year, month) tuple
    """
    try:
        # Parse "March 2026" format
        date_obj = datetime.strptime(month_str, "%B %Y")
        return date_obj.year, date_obj.month
    except:
        raise ValueError(f"Invalid month format: {month_str}. Expected format: 'March 2026'")


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Stock Prediction API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/predict-stock (POST)",
            "health": "/health (GET)"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "stock-prediction"}


@app.post("/api/predict-stock")
async def predict_stock(
    file: UploadFile = File(..., description="CSV file with sales data"),
    predictionType: str = Form(..., description="'all' or 'specific'"),
    month: str = Form(..., description="Target month (e.g., 'March 2026')"),
    productId: Optional[str] = Form(None, description="Product ID (required if predictionType='specific')")
):
    """
    Main prediction endpoint matching frontend requirements
    
    Input from frontend:
    - file: CSV with sales data
    - predictionType: "all" or "specific"
    - month: "March 2026" format
    - productId: Optional, required if predictionType is "specific"
    
    Output to frontend:
    {
      "predictions": [
        {
          "productId": "P101",
          "lastMonthSales": 120,
          "predictedSales": 144,
          "growthPercentage": 20
        }
      ],
      "insight": "AI-generated insight message"
    }
    """
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="File must be a CSV file"
        )
    
    # Validate prediction type
    if predictionType not in ["all", "specific"]:
        raise HTTPException(
            status_code=400,
            detail="predictionType must be 'all' or 'specific'"
        )
    
    # Validate productId if specific prediction
    if predictionType == "specific" and not productId:
        raise HTTPException(
            status_code=400,
            detail="productId is required when predictionType is 'specific'"
        )
    
    try:
        # Parse month string to year and month number
        target_year, target_month = parse_month_string(month)
        
        # Read uploaded CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        print(f"📊 Processing: {file.filename}")
        print(f"📅 Target: {month} (Year: {target_year}, Month: {target_month})")
        print(f"🎯 Type: {predictionType}")
        if productId:
            print(f"🔍 Product ID: {productId}")
        
        # Run the prediction pipeline
        stock_report, metrics = predict_sales_pipeline(df, target_year, target_month)
        
        # Filter by productId if specific prediction
        if predictionType == "specific":
            stock_report = stock_report[stock_report["product_id"].astype(str) == str(productId)]
            
            if stock_report.empty:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product ID '{productId}' not found in the dataset"
                )
        
        # Transform to frontend format
        predictions = []
        for _, row in stock_report.iterrows():
            predictions.append({
                "productId": str(row["product_id"]),
                "productCategory": row["product_category"],
                "lastMonthSales": round(row["previous_month_sales"], 2),
                "predictedSales": round(row["predicted_sales"], 2),
                "growthPercentage": round(row["stock_change_pct"], 2) if pd.notna(row["stock_change_pct"]) else 0,
                "stockStatus": row["stock_status"]
            })
        
        # Generate AI insight
        high_stock_count = len([p for p in predictions if p["stockStatus"] == "HIGH STOCK REQUIRED"])
        avg_growth = sum(p["growthPercentage"] for p in predictions) / len(predictions) if predictions else 0
        
        if avg_growth > 50:
            insight = f"📈 Strong demand surge detected! Average growth of {avg_growth:.1f}%. Consider increasing stock by 30-50% for {high_stock_count} high-demand products."
        elif avg_growth > 20:
            insight = f"📊 Moderate growth expected ({avg_growth:.1f}% increase). Keep {high_stock_count} products well-stocked to meet demand."
        elif avg_growth > 0:
            insight = f"✅ Steady demand pattern. Maintain current inventory levels with slight increase for {high_stock_count} products."
        else:
            insight = f"⚠️ Sales decline detected ({avg_growth:.1f}%). Review inventory and consider promotions."
        
        # Prepare response
        response = {
            "status": "success",
            "predictions": predictions,
            "insight": insight,
            "metadata": {
                "targetMonth": month,
                "targetYear": target_year,
                "targetMonthNumber": target_month,
                "totalProducts": len(predictions),
                "highStockRequired": high_stock_count,
                "averageGrowth": round(avg_growth, 2),
                "modelMetrics": metrics
            }
        }
        
        return JSONResponse(content=response)
        
    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=f"Data validation error: {str(ve)}"
        )
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/api/validate-dataset")
async def validate_dataset(file: UploadFile = File(...)):
    """
    Validate if dataset has required columns
    """
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="File must be a CSV file"
        )
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        required_columns = [
            "product_category",
            "product_id",
            "transaction_qty",
            "transaction_date"
        ]
        
        available_columns = df.columns.tolist()
        missing_columns = [col for col in required_columns if col not in available_columns]
        has_required = len(missing_columns) == 0
        
        # Sample preview
        sample_data = df.head(3).to_dict(orient="records") if not df.empty else []
        
        return {
            "status": "valid" if has_required else "invalid",
            "available_columns": available_columns,
            "required_columns": required_columns,
            "missing_columns": missing_columns,
            "dataset_shape": {
                "rows": len(df),
                "columns": len(df.columns)
            },
            "sample_data": sample_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating dataset: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)