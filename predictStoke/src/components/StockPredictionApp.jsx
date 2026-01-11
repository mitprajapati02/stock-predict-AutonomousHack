import React, { useState } from 'react';
import { useEffect } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const StockPredictionApp = () => {
  const [predictionType, setPredictionType] = useState('all');
  const [productId, setProductId] = useState('');

  const [uploadedFile, setUploadedFile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  // reportData = full backend response

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Stock Prediction Report", 14, 15);

    doc.setFontSize(11);
    doc.text(
      `Target Month: ${reportData.targetMonth} (${reportData.targetYear})`,
      14,
      25
    );

    doc.setFontSize(12);
    doc.text("AI Insight:", 14, 35);

    doc.setFontSize(10);
    doc.text(reportData.insight, 14, 42, { maxWidth: 180 });

    doc.setFontSize(12);
    doc.text("Summary", 14, 60);

    autoTable(doc, {
      startY: 65,
      theme: "grid",
      head: [["Metric", "Value"]],
      body: [
        ["Total Products", reportData.totalProducts],
        ["High Stock Required", reportData.metadata.highStockRequired],
        // ["Average Growth (%)", reportData.metadata.averageGrowth.toFixed(2)],
        ["MAE", reportData.metadata.modelMetrics.mae],
        ["RMSE", reportData.metadata.modelMetrics.rmse],
        ["R² Score", reportData.metadata.modelMetrics.r2],
      ],
    });

    doc.addPage();
    doc.setFontSize(14);
    doc.text("Product-wise Predictions", 14, 15);

    const tableData = reportData.predictions.map((p) => [
      p.productId,
      p.productCategory,
      p.lastMonthSales,
      p.predictedSales.toFixed(2),
    ]);

    autoTable(doc, {
      startY: 20,
      theme: "striped",
      head: [
        [
          "Product ID",
          "Category",
          "Last Month Sales",
          "Predicted Sales",
          // "Growth %",
        ],
      ],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`Stock_Prediction_${reportData.targetMonth}.pdf`);
  };



  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years dynamically (current year → next 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // change if you want

  const totalPages = Math.ceil(predictions.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPredictions = predictions.slice(
    startIndex,
    startIndex + itemsPerPage
  );


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!uploadedFile) {
      setError("Please upload a sales report file");
      return;
    }

    if (predictionType === "specific" && !productId) {
      setError("Please enter Product ID");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // FormData for file upload
      const formData = new FormData();
      const combinedMonth = `${selectedMonth} ${selectedYear}`;
      formData.append("file", uploadedFile);
      formData.append("predictionType", predictionType);
      formData.append("month", combinedMonth);
      formData.append("productId", productId || "");

      // API Request
      const response = await fetch("http://127.0.0.1:8000/api/predict-stock", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Prediction failed");
      }

      const data = await response.json();
      console.log("Prediction data:", data);
      setReportData(data); // Store full response for PDF export
      setPredictions(data.predictions);
      setInsight(data.insight);

    } catch (error) {
      console.error("Prediction failed", error);
      setError(error.message || "Something went wrong while predicting");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'rgb(255 117 117)'
    },
    card: {
      maxWidth: '900px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    },
    header: {
      padding: '30px',
      color: 'black',
      textAlign: 'center',
      borderBottom: '1px solid #e0e0e0'
    },
    title: {
      margin: '0',
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '8px'
    },
    subtitle: {
      margin: '0',
      fontSize: '16px',
      opacity: '0.7'
    },
    content: {
      padding: '30px',
      background: 'rgb(228 228 228)'
    },
    section: {
      marginBottom: '28px',

    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#333'
    },
    uploadArea: {
      border: '2px dashed #667eea',
      borderRadius: '12px',
      padding: '30px',
      textAlign: 'center',
      background: '#f8f9ff',
      transition: 'all 0.3s ease'
    },
    uploadButton: {
      background: '#060771',
      color: 'white',
      border: 'none',
      padding: '12px 28px',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    fileInput: {
      display: 'none'
    },
    note: {
      marginTop: '12px',
      fontSize: '13px',
      color: '#666',
      fontStyle: 'italic'
    },
    formGroup: {
      marginBottom: '18px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#444'
    },
    select: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #e0e0e0',
      fontSize: '15px',
      background: 'white',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease',
      outline: 'none'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #e0e0e0',
      fontSize: '15px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      outline: 'none'
    },
    predictButton: {
      width: '100%',
      background: '#FFE08F',
      color: 'black',
      border: 'none',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      marginTop: '10px'
    },
    predictButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    error: {
      background: '#fee',
      color: '#c33',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #fcc'
    },
    insightBox: {
      background: '#e8f4fd',
      border: '1px solid #b3d9f2',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      fontSize: '15px',
      color: '#0c5460'
    },
    resultsContainer: {
      marginTop: '30px',
      padding: '20px',
      background: '#f8f9ff',
      borderRadius: '12px',
      border: '1px solid #e0e0e0'
    },
    resultsTitle: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '20px',
      color: '#333',
      textAlign: 'center'
    },
    resultCard: {
      background: 'white',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px'
    },
    resultItem: {
      textAlign: 'center'
    },
    resultLabel: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '6px',
      textTransform: 'uppercase',
      fontWeight: '600'
    },
    resultValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#333'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600'
    },
    badgePositive: {
      background: '#10b981',
      color: 'white'
    },
    badgeNegative: {
      background: '#ef4444',
      color: 'white'
    },
    stockBadge: {
      fontSize: '11px',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: '600',
      marginTop: '4px',
      display: 'inline-block'
    },
    stockHigh: {
      background: '#fecaca',
      color: '#991b1b'
    },
    stockNormal: {
      background: '#d1fae5',
      color: '#065f46'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '25px',
      gap: '15px'
    },
    pageButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      background: 'white',
      cursor: 'pointer',
      fontWeight: '600'
    },
    pageButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    pageInfo: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#444'
    }

  };
  useEffect(() => {
    setCurrentPage(1);
  }, [predictions]);


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Stock Prediction Dashboard</h1>
          <p style={styles.subtitle}>AI-Powered Sales Forecasting for Smart Inventory Management</p>
        </div>

        <div style={styles.content}>
          {error && (
            <div style={styles.error}>
              ❌ {error}
            </div>
          )}

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Upload Sales Data</h2>
            <div style={styles.uploadArea}>
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <button
                  style={styles.uploadButton}
                  onClick={() => document.getElementById('file-upload').click()}
                  type="button"
                >
                  📁 Choose CSV File
                </button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                style={styles.fileInput}
                onChange={handleFileUpload}
              />
              {uploadedFile && (
                <p style={{ marginTop: '12px', color: '#10b981', fontWeight: '600' }}>
                  ✓ {uploadedFile.name}
                </p>
              )}
              <p style={styles.note}>CSV should contain: product_id, product_category, transaction_qty, transaction_date</p>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Prediction Settings</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Prediction Type</label>
              <select
                style={styles.select}
                value={predictionType}
                onChange={(e) => setPredictionType(e.target.value)}
              >
                <option value="all">Predict for all products</option>
                <option value="specific">Predict for a specific product</option>
              </select>
            </div>

            {predictionType === 'specific' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Product ID</label>
                <input
                  type="text"
                  placeholder="e.g., P101 or 1"
                  style={styles.input}
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Target Month</label>

              <select
                style={{ ...styles.select, marginBottom: '12px' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                style={styles.select}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button
            style={{
              ...styles.predictButton,
              ...(loading ? styles.predictButtonDisabled : {})
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Processing...' : ` Generate Prediction for ${selectedMonth}`}
          </button>

          {insight && (
            <div style={styles.insightBox}>
              <strong>💡 AI Insight:</strong> {insight}
            </div>
          )}
          {reportData && (<button
            onClick={exportToPDF}
            style={{
              background: "#10b981",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "6px",
              fontWeight: "600",
              marginTop: "16px",
              cursor: "pointer",
            }}
          >
            Export as PDF
          </button>)}
          {predictions && predictions.length > 0 && (
            <div style={styles.resultsContainer}>
              <h3 style={styles.resultsTitle}>
                📈 Prediction Results for {selectedMonth}
              </h3>

              {/* Result cards */}
              {currentPredictions.map((pred, idx) => (
                <div key={idx} style={styles.resultCard}>
                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Product ID</div>
                    <div style={styles.resultValue}>{pred.productId}</div>
                    <div
                      style={{
                        ...styles.resultLabel,
                        marginTop: '8px',
                        fontSize: '11px'
                      }}
                    >
                      {pred.productCategory}
                    </div>
                  </div>

                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Last Month</div>
                    <div style={styles.resultValue}>{pred.lastMonthSales}</div>
                  </div>

                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Predicted Sales</div>
                    <div style={styles.resultValue}>{pred.predictedSales}</div>
                  </div>
                </div>
              ))}

              {/* ✅ Pagination (ONLY ONCE) */}
              <div style={styles.pagination}>
                <button
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === 1 && styles.pageButtonDisabled)
                  }}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ◀ Prev
                </button>

                <span style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === totalPages && styles.pageButtonDisabled)
                  }}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StockPredictionApp;