import React, { useState } from 'react';

const StockPredictionApp = () => {
  const [predictionType, setPredictionType] = useState('all');
  const [productId, setProductId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      formData.append("file", uploadedFile);
      formData.append("predictionType", predictionType);
      formData.append("month", selectedMonth);
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
      background: '#f5f5f5'
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
      padding: '30px'
    },
    section: {
      marginBottom: '28px'
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
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Stock Prediction Dashboard</h1>
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
                style={styles.select}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option>January 2026</option>
                <option>February 2026</option>
                <option>March 2026</option>
                <option>April 2026</option>
                <option>May 2026</option>
                <option>June 2026</option>
                <option>July 2026</option>
                <option>August 2026</option>
                <option>September 2026</option>
                <option>October 2026</option>
                <option>November 2026</option>
                <option>December 2026</option>
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
            {loading ? '⏳ Processing...' : `🚀 Generate Prediction for ${selectedMonth}`}
          </button>

          {insight && (
            <div style={styles.insightBox}>
              <strong>💡 AI Insight:</strong> {insight}
            </div>
          )}

          {predictions && predictions.length > 0 && (
            <div style={styles.resultsContainer}>
              <h3 style={styles.resultsTitle}>
                📈 Prediction Results for {selectedMonth}
              </h3>
              {predictions.map((pred, idx) => (
                <div key={idx} style={styles.resultCard}>
                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Product ID</div>
                    <div style={styles.resultValue}>{pred.productId}</div>
                    <div style={styles.resultLabel} style={{marginTop: '8px', fontSize: '11px'}}>
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
                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Growth</div>
                    <div style={styles.resultValue}>
                      <span style={{
                        ...styles.badge,
                        ...(pred.growthPercentage >= 0 ? styles.badgePositive : styles.badgeNegative)
                      }}>
                        {pred.growthPercentage >= 0 ? '+' : ''}{pred.growthPercentage}%
                      </span>
                    </div>
                    <div style={{
                      ...styles.stockBadge,
                      ...(pred.stockStatus === 'HIGH STOCK REQUIRED' ? styles.stockHigh : styles.stockNormal)
                    }}>
                      {pred.stockStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockPredictionApp;