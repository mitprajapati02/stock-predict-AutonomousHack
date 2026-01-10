from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Stock Prediction API")

# Allow frontend access (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Stock Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/predict-stock")
async def predict_stock(
    file: UploadFile = File(...),
    predictionType: str = Form(...),
    month: str = Form(...),
    productId: str = Form(None)
):
    df = pd.read_csv(file.file)

    required_columns = {"productId", "transaction_date", "quantity"}
    if not required_columns.issubset(df.columns):
        return {
            "error": "CSV must contain productId, transaction_date, quantity columns"
        }

    predictions = []

    if predictionType == "all":
        product_ids = df["productId"].unique()

        for pid in product_ids:
            product_data = df[df["productId"] == pid]

            avg_sales = float(product_data["quantity"].mean())
            predicted_sales = int(round(avg_sales * 1.2))

            predictions.append({
                "productId": str(pid),                 # ✅ FIX
                "lastMonthSales": int(round(avg_sales)),  # ✅ FIX
                "predictedSales": predicted_sales,        # ✅ FIX
                "growthPercentage": 20
            })

    else:
        if not productId:
            return {"error": "productId is required for single prediction"}

        product_data = df[df["productId"] == productId]

        if product_data.empty:
            return {"error": "Product ID not found"}

        avg_sales = float(product_data["quantity"].mean())
        predicted_sales = int(round(avg_sales * 1.2))

        predictions.append({
            "productId": str(productId),
            "lastMonthSales": int(round(avg_sales)),
            "predictedSales": predicted_sales,
            "growthPercentage": 20
        })

    return {
        "month": str(month),
        "predictions": predictions,
        "insight": "Demand is increasing. Maintain 20% extra stock."
    }


@app.post("/api/predict-stock")
async def predict_stock(
    file: UploadFile = File(...),
    predictionType: str = Form(...),
    month: str = Form(...),
    productId: str = Form(None)
):
    """
    DEBUG MODE:
    - Returns first 20 rows of CSV
    - Returns frontend form data
    """

    # Read CSV
    df = pd.read_csv(file.file)

    # Convert first 20 rows to JSON
    csv_preview = df.head(20).to_dict(orient="records")

    return {
        "message": "Debug response – data received successfully",
        "frontendData": {
            "predictionType": predictionType,
            "month": month,
            "productId": productId
        },
        "csvInfo": {
            "totalRows": len(df),
            "columns": list(df.columns)
        },
        "csvPreview": csv_preview
    }
