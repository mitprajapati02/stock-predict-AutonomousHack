import React, { useState } from 'react';

const StockPredictionApp = () => {
  const [predictionType, setPredictionType] = useState('all');
  const [productId, setProductId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [predictions, setPredictions] = useState(null);

  const salesData = [
    { productId: "P101", month: "Jan", sales: 100 },
    { productId: "P101", month: "Feb", sales: 120 },
    { productId: "P102", month: "Jan", sales: 60 },
    { productId: "P102", month: "Feb", sales: 70 },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file); // ✅ FILE OBJECT
    }
  };


  const handlePredict = () => {
    let results = [];

    if (predictionType === 'all') {
      const productIds = [...new Set(salesData.map(item => item.productId))];

      results = productIds.map(pid => {
        const productSales = salesData.filter(item => item.productId === pid);
        const avgSales = productSales.reduce((sum, item) => sum + item.sales, 0) / productSales.length;
        const predictedSales = Math.round(avgSales * 1.2);

        return {
          productId: pid,
          currentAvg: Math.round(avgSales),
          predicted: predictedSales,
          increase: '+20%'
        };
      });
    } else {
      if (!productId) {
        alert('Please enter a Product ID');
        return;
      }

      const productSales = salesData.filter(item => item.productId === productId);

      if (productSales.length === 0) {
        alert('Product ID not found in data');
        return;
      }

      const avgSales = productSales.reduce((sum, item) => sum + item.sales, 0) / productSales.length;
      const predictedSales = Math.round(avgSales * 1.2);

      results = [{
        productId: productId,
        currentAvg: Math.round(avgSales),
        predicted: predictedSales,
        increase: '+20%'
      }];
    }

    setPredictions(results);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      alert("Please upload a sales report file");
      return;
    }

    if (predictionType === "single" && !productId) {
      alert("Please enter Product ID");
      return;
    }

    try {
      // FormData for file upload
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("predictionType", predictionType);
      formData.append("month", selectedMonth);
      formData.append("productId", productId || "");

      /*
      ==========================
      API REQUEST (Frontend → Backend)
      ==========================
  
      POST /api/predict-stock
      Headers: multipart/form-data
  
      Payload:
      - file: CSV sales report
      - predictionType: "all" | "single"
      - month: "March 2026"
      - productId: "P101" (optional)
      */

      // 🔁 Replace with real API later
      const response = await fetch("http://127.0.0.1:8000/api/debug", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // const data = {
      //   predictions: [
      //     {
      //       productId: productId || "P101",
      //       lastMonthSales: 120,
      //       predictedSales: 144,
      //       growthPercentage: 20
      //     }
      //   ],
      //   insight: "Demand is increasing. Keep 20% extra stock."
      // };

      setPredictions(data.predictions);
      // setAiInsight(data.insight);

    } catch (error) {
      console.error("Prediction failed", error);
      alert("Something went wrong while predicting");
    }
  };


  const styles = {
    container: {
      minHeight: '100vh',
      // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
      // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '30px',
      color: 'black',
      textAlign: 'center'
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
      opacity: '0.9'
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
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
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
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      marginTop: '10px'
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
      background: '#10b981',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Stock Prediction Dashboard</h1>
          <p style={styles.subtitle}>AI-Powered Sales Forecasting for Smart Inventory Management</p>
        </div>

        <div style={styles.content}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Upload Sales Data</h2>
            <div style={styles.uploadArea}>
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <button
                  style={styles.uploadButton}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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

              <p style={styles.note}>Note : csv should contain columns for Product ID, Date, and Sales Quantity</p>
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
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
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
                  placeholder="e.g., P101"
                  style={styles.input}
                  value={productId}
                  onChange={(e) => setProductId(console.log(e.target.value))}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Target Month</label>
              <select
                style={styles.select}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(console.log(e.target.value))}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              >
                <option>March 2026</option>
                <option>April 2026</option>
                <option>May 2026</option>
                <option>June 2026</option>
                <option>July 2026</option>
              </select>
            </div>
          </div>

          <button
            style={styles.predictButton}
            onClick={handleSubmit}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            Generate Prediction for {selectedMonth}
          </button>

          {predictions && (
            <div style={styles.resultsContainer}>
              <h3 style={styles.resultsTitle}>
                Prediction Results for {selectedMonth}
              </h3>
              {predictions.map((pred, idx) => (
                <div key={idx} style={styles.resultCard}>
                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Product ID</div>
                    <div style={styles.resultValue}>{pred.productId}</div>
                  </div>
                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Current Avg</div>
                    <div style={styles.resultValue}>{pred.currentAvg}</div>
                  </div>
                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Predicted Sales</div>
                    <div style={styles.resultValue}>{pred.predicted}</div>
                  </div>
                  <div style={styles.resultItem}>
                    <div style={styles.resultLabel}>Growth</div>
                    <div style={styles.resultValue}>
                      <span style={styles.badge}>{pred.increase}</span>
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