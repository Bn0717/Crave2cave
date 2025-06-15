import React, { useState, useEffect} from 'react';
import { MapPin, Receipt, Users, Truck, CheckCircle, Calculator, Camera, Scan, AlertCircle, X, Check } from 'lucide-react';
import logo from './assets/qrtng.jpg';

const Crave2CaveSystem = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [prebookUsers, setPrebookUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [driverQueue, setDriverQueue] = useState([]);
  const [minOrderReached, setMinOrderReached] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [commitmentPaid, setCommitmentPaid] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showScanPreview, setShowScanPreview] = useState(false);
  const [tabScannerCredits, setTabScannerCredits] = useState(null);
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    items: '',
    totalAmount: 0
  });

const TABSCANNER_API_KEY = 'vcLQCv83gwIDYtccFffZ8Irt97SHYfTkGUHIh5ybXxDmMqRKZL3wDwXi3JNKZWBs'; // Get from TabScanner dashboard
const TABSCANNER_ENDPOINT = 'https://api.tabscanner.com/api/v2/process';

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      color: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '8px',
      margin: 0
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.9)',
      margin: 0
    },
    navigation: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    navButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px'
    },
    navButtonActive: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    navButtonInactive: {
      backgroundColor: 'white',
      color: '#374151',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      marginBottom: '24px'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: 0
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
    },
    progressBar: {
      marginBottom: '16px'
    },
    progressText: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    progressTrack: {
      width: '100%',
      height: '12px',
      backgroundColor: '#e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      transition: 'width 0.3s ease',
      borderRadius: '6px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '12px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '12px',
      fontSize: '14px',
      height: '80px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    buttonGreen: {
      backgroundColor: '#059669',
      color: 'white'
    },
    buttonPurple: {
      backgroundColor: '#7c3aed',
      color: 'white'
    },
    buttonBlue: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    buttonSmall: {
      width: 'auto',
      padding: '8px 16px',
      fontSize: '12px'
    },
    successAlert: {
      textAlign: 'center',
      padding: '16px',
      backgroundColor: '#ecfdf5',
      borderRadius: '8px',
      border: '1px solid #10b981'
    },
    warningAlert: {
      textAlign: 'center',
      padding: '16px',
      backgroundColor: '#fef3c7',
      borderRadius: '8px',
      border: '1px solid #f59e0b',
      marginBottom: '16px'
    },
    qrContainer: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      margin: '16px 0'
    },
    qrImage: {
      width: '200px',
      height: '200px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px'
    },
    scanPreview: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    scanModal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    scanResult: {
      backgroundColor: '#f0f9ff',
      border: '2px solid #0ea5e9',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    feeStructure: {
      marginBottom: '12px'
    },
    feeRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      marginBottom: '8px'
    },
    feeAmount: {
      fontWeight: 'bold',
      color: '#059669'
    },
    note: {
      padding: '12px',
      backgroundColor: '#eff6ff',
      borderRadius: '6px',
      marginTop: '16px'
    },
    noteText: {
      fontSize: '14px',
      color: '#1e40af',
      margin: 0
    },
    userList: {
      marginTop: '16px'
    },
    userItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      marginBottom: '8px'
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    userName: {
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    userId: {
      fontSize: '12px',
      color: '#6b7280'
    },
    timestamp: {
      fontSize: '12px',
      color: '#6b7280'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '8px 0 4px 0'
    },
    statLabel: {
      color: '#6b7280',
      margin: 0
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      borderBottom: '2px solid #e5e7eb',
      textAlign: 'left',
      padding: '12px'
    },
    tableCell: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb'
    },
    statusBadge: {
      padding: '4px 8px',
      backgroundColor: '#dcfce7',
      color: '#166534',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    orderCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      marginBottom: '16px'
    },
    orderGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '12px'
    },
    orderInfo: {
      marginBottom: '8px'
    },
    orderTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    orderText: {
      color: '#6b7280',
      marginBottom: '4px'
    },
    itemsBox: {
      fontSize: '14px',
      color: '#374151',
      backgroundColor: 'white',
      padding: '8px',
      borderRadius: '6px'
    },
    deliveryInfo: {
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid #e5e7eb'
    },
    deliveryText: {
      fontSize: '14px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '4px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px'
    },
    receiptPreview: {
      maxWidth: '100%',
      maxHeight: '300px',
      borderRadius: '8px',
      border: '2px solid #e5e7eb',
      marginBottom: '12px'
    }
  };

  // Delivery fee calculation
  const calculateDeliveryFee = (amount) => {
    if (amount < 50) return 8;
    if (amount >= 50 && amount < 100) return 17;
    if (amount >= 100 && amount < 150) return 25;
    if (amount >= 150 && amount < 200) return 30;
    return 35; // RM200+
  };

  // Progress tracking
  const progressPercentage = Math.min((prebookUsers.length / 5) * 100, 100);

  // Check if student name and ID already exist
  const isStudentExists = (name, id) => {
    return prebookUsers.some(user => 
      user.name.toLowerCase() === name.toLowerCase() || user.studentId === id
    );
  };

  const handlePrebook = () => {
  if (!studentName.trim() || !studentId.trim()) {
    alert('Please enter both your name and student ID');
    return;
  }

  const nameExists = prebookUsers.some(user => 
    user.name.toLowerCase() === studentName.toLowerCase()
  );
  const idExists = prebookUsers.some(user => 
    user.studentId === studentId
  );

  if (nameExists && idExists) {
    alert('This name AND student ID are already registered. Please use different details.');
    return;
  }
  if (nameExists) {
    alert('This name is already registered. Please use a different name.');
    return;
  }
  if (idExists) {
    alert('This student ID is already registered. Please use a different ID.');
    return;
  }

    // Show commitment fee payment
    const newUserId = Date.now();
    const newUser = {
      id: newUserId,
      name: studentName,
      studentId: studentId,
      timestamp: new Date().toLocaleTimeString(),
      hasOrdered: false,
      commitmentPaid: false
    };
    
    setPrebookUsers(prev => [...prev, newUser]);
    setCommitmentPaid(prev => ({ ...prev, [newUserId]: false }));
    setSelectedUserId(newUserId);

    alert(`Please pay the RM10 commitment fee to complete your registration.`);
  };

  const handleCommitmentPayment = (userId) => {
    setCommitmentPaid(prev => ({ ...prev, [userId]: true }));
    
    const updatedUsers = prebookUsers.map(user => 
      user.id === userId ? { ...user, commitmentPaid: true } : user
    );
    setPrebookUsers(updatedUsers);
    
    const paidUsers = updatedUsers.filter(u => u.commitmentPaid);
    if (paidUsers.length >= 1) {
      setMinOrderReached(true);
    }
    
    alert('Commitment fee paid! You are now in the prebook queue.');
  };

  // TabScanner API function
  const scanReceipt = async (file) => {
    setScanLoading(true);
    
    try {
      // Convert file to base64
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', base64String);
      formData.append('documentType', 'receipt');
      formData.append('features', 'lineItems,totals,dates');

      // Make API request
      const response = await fetch(TABSCANNER_ENDPOINT, {
        method: 'POST',
        headers: {
          'apikey': TABSCANNER_API_KEY,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      // Poll for results (TabScanner is async)
      const receiptData = await pollForResults(result.token);
      const processedData = processTabScannerResponse(receiptData);
      
      setScannedData(processedData);
      setShowScanPreview(true);
      
    } catch (error) {
      console.error('TabScanner error:', error);
      alert(`Scan failed: ${error.message || 'Please try a clearer image'}`);
    } finally {
      setScanLoading(false);
    }
  };

  const checkTabScannerCredits = async () => {
    try {
      const response = await fetch('https://api.tabscanner.com/api/v2/credits', {
        headers: { 'apikey': TABSCANNER_API_KEY }
      });
      const data = await response.json();
      setTabScannerCredits(data.creditsRemaining);
    } catch (error) {
      console.error('Credit check failed:', error);
    }
  };

  // Call this in useEffect or before scanning
  useEffect(() => {
    checkTabScannerCredits();
  }, []);

  // Helper function to poll for results
  const pollForResults = async (token, retries = 10, interval = 1000) => {
    const resultEndpoint = `https://api.tabscanner.com/api/v2/result/${token}`;
    
    for (let i = 0; i < retries; i++) {
      const response = await fetch(resultEndpoint, {
        headers: { 'apikey': TABSCANNER_API_KEY }
      });
      
      const data = await response.json();
      
      if (data.status === 'completed') {
        return data;
      } else if (data.status === 'failed') {
        throw new Error('TabScanner processing failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('TabScanner timeout - try again later');
  };

  // Process TabScanner raw response
  const processTabScannerResponse = (data) => {
    return {
      orderNumber: data.receiptNumber || `DOM${Math.floor(Math.random() * 10000)}`,
      totalAmount: parseFloat(data.totalAmount?.amount) || 0,
      items: data.lineItems?.map(item => 
        `${item.quantity || 1}x ${item.description} (RM${item.totalPrice?.amount || 0})`
      ) || ['Could not extract items']
    };
  };


  const handleScanConfirm = () => {
    setOrderDetails({
      orderNumber: scannedData.orderNumber,
      items: scannedData.items.join(', '),
      totalAmount: scannedData.totalAmount
    });
    setShowScanPreview(false);
    setScannedData(null);
  };

  const handleScanReject = () => {
    setShowScanPreview(false);
    setScannedData(null);
    setReceiptFile(null);
    alert('Please upload a clearer receipt image and try scanning again.');
  };

  const handleReceiptUpload = () => {
    if (!receiptFile || !orderDetails.orderNumber || !orderDetails.totalAmount || !selectedUserId) {
      alert('Please upload receipt, select your name, and fill in all order details');
      return;
    }

    const deliveryFee = calculateDeliveryFee(orderDetails.totalAmount);
    const selectedUser = prebookUsers.find(u => u.id === parseInt(selectedUserId));
    
    const newOrder = {
      id: Date.now(),
      userId: parseInt(selectedUserId),
      userName: selectedUser?.name,
      orderNumber: orderDetails.orderNumber,
      items: orderDetails.items,
      totalAmount: orderDetails.totalAmount,
      deliveryFee: deliveryFee,
      status: 'Confirmed',
      timestamp: new Date().toLocaleString()
    };

    setOrders([...orders, newOrder]);
    
    // Update prebook user status
    setPrebookUsers(prev => 
      prev.map(user => 
        user.id === parseInt(selectedUserId) ? { ...user, hasOrdered: true } : user
      )
    );

    // Add to driver queue
    setDriverQueue(prev => [...prev, newOrder]);

    // Reset form - MAKE SURE THESE LINES ARE PRESENT
    setReceiptFile(null);
    setSelectedUserId('');
    setOrderDetails({ 
      orderNumber: '', 
      items: '', 
      totalAmount: 0 
    });
    
    alert(`Order confirmed! Delivery fee: RM${deliveryFee}`);
  };

  const DriverOrderList = () => (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <Truck color="#2563eb" size={24} />
        <h2 style={styles.cardTitle}>Driver Order List</h2>
      </div>
      
      {driverQueue.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No orders in queue</p>
      ) : (
        <div>
          {driverQueue.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderGrid}>
                <div>
                  <h3 style={styles.orderTitle}>Order #{order.orderNumber}</h3>
                  <p style={styles.orderText}>Customer: {order.userName}</p>
                  <p style={styles.orderText}>Amount: RM{order.totalAmount}</p>
                  <p style={styles.orderText}>Delivery Fee: RM{order.deliveryFee}</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: '500', marginBottom: '8px' }}>Items:</h4>
                  <p style={styles.itemsBox}>
                    {order.items}
                  </p>
                </div>
              </div>
              <div style={styles.deliveryInfo}>
                <p style={styles.deliveryText}>
                  <MapPin size={16} />
                  Pickup: Domino's Pizza | Delivery: Remote Area (19km)
                </p>
                <p style={styles.deliveryText}>Time: {order.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

const OrderConfirmation = ({ order, onConfirm, onEdit }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #e5e7eb'
    }}>
      <h2 style={{ marginBottom: '16px' }}>Confirm Your Order</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Order Number:</strong>
        <div>{order.orderNumber}</div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Items:</strong>
        <div style={{ 
          backgroundColor: '#f9fafb',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '8px'
        }}>
          {order.items.split(',').map((item, i) => (
            <div key={i}>• {item.trim()}</div>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <strong>Total Amount:</strong>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          RM{order.totalAmount}
        </div>
      </div>
      
      <div style={styles.buttonGroup}>
        <button
          onClick={onConfirm}
          style={{
            ...styles.button,
            ...styles.buttonGreen
          }}
        >
          Confirm Order
        </button>
        <button
          onClick={onEdit}
          style={{
            ...styles.button,
            backgroundColor: '#6b7280',
            color: 'white'
          }}
        >
          Edit Order
        </button>
      </div>
    </div>
  );
};

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Crave 2 Cave Delivery System</h1>
          <p style={styles.headerSubtitle}>Remote Area Food Delivery Service (19km from town)</p>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <button
            onClick={() => setActiveTab('student')}
            style={{
              ...styles.navButton,
              ...(activeTab === 'student' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Student Portal
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              ...styles.navButton,
              ...(activeTab === 'admin' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            style={{
              ...styles.navButton,
              ...(activeTab === 'driver' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Driver Portal
          </button>
        </div>

        {/* Student Portal */}
        {activeTab === 'student' && (
          <div style={styles.grid}>
            {/* Prebook Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Users color="#059669" size={24} />
              <h2 style={styles.cardTitle}>Step 1: Prebook</h2>
            </div>
            
            {/* Progress Bar */}
            <div style={styles.progressBar}>
              <div style={styles.progressText}>
                <span>Minimum 5 paid users required</span>
                <span>{prebookUsers.filter(u => u.commitmentPaid).length}/5</span>
              </div>
              <div style={styles.progressTrack}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min((prebookUsers.filter(u => u.commitmentPaid).length / 5) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {!minOrderReached ? (
              <div>
                {!selectedUserId ? (  
                  <>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      style={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      style={styles.input}
                    />
                    <button
                      onClick={handlePrebook}
                      style={{
                        ...styles.button,
                        ...styles.buttonGreen
                      }}
                    >
                      Register for Prebook
                    </button>
                  </>
                ) : (
                  // Payment Section - This section locks the upper form
                  <div style={{ 
                    backgroundColor: '#f8fafc',
                    padding: '24px',
                    borderRadius: '12px',
                    marginTop: '16px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <div style={{
                      backgroundColor: '#fff',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Registration Details</h3>
                      <p style={{ margin: '4px 0', color: '#6b7280' }}>
                        <strong>Name:</strong> {prebookUsers.find(u => u.id === selectedUserId)?.name}
                      </p>
                      <p style={{ margin: '4px 0', color: '#6b7280' }}>
                        <strong>Student ID:</strong> {prebookUsers.find(u => u.id === selectedUserId)?.studentId}
                      </p>
                    </div>
                    
                    <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Pay RM10 Commitment Fee</h3>
                    <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                      Please upload proof of payment to complete your registration
                    </p>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      style={styles.input}
                    />
                    
                    {receiptFile && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '8px' }}>Payment Receipt Preview:</h4>
                        <img 
                          src={URL.createObjectURL(receiptFile)} 
                          alt="Payment Preview" 
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '8px',
                            border: '2px solid #e5e7eb',
                            marginBottom: '12px'
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleCommitmentPayment(selectedUserId)}
                        disabled={!receiptFile}
                        style={{
                          ...styles.button,
                          ...styles.buttonBlue,
                          opacity: !receiptFile ? 0.5 : 1,
                          cursor: !receiptFile ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Submit Payment
                      </button>
                      <button
                        onClick={() => {
                          // Allow changing name - remove the user and reset form
                          setPrebookUsers(prev => prev.filter(u => u.id !== selectedUserId));
                          setSelectedUserId('');
                          setReceiptFile(null);
                          // Keep the name and ID in the form for editing
                        }}
                        style={{
                          ...styles.button,
                          backgroundColor: '#6b7280',
                          color: 'white'
                        }}
                      >
                        Change Name/ID
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (                 
              <div style={styles.successAlert}>   
                <CheckCircle color="#059669" size={32} style={{ marginBottom: '8px' }} />
                <p style={{ color: '#065f46', fontWeight: '500', margin: 0 }}>
                  Minimum order reached! You can now place orders.
                </p>
              </div>
            )}

            {/* Prebook List */}
            {prebookUsers.length > 0 && (
              <div style={styles.userList}>
                <h3 style={{ fontWeight: '500', marginBottom: '8px' }}>Prebook Queue:</h3>
                <div>
                  {prebookUsers.map((user) => (
                    <div key={user.id} style={styles.userItem}>
                      <div style={styles.userInfo}>
                        <div style={styles.userName}>
                          <span>{user.name}</span>
                          {user.hasOrdered && <CheckCircle color="#059669" size={16} />}
                          {user.commitmentPaid && !user.hasOrdered && <CheckCircle color="#2563eb" size={16} />}
                        </div>
                        <div style={styles.userId}>ID: {user.studentId}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '4px' }}>
                        <span style={styles.timestamp}>{user.timestamp}</span>
                        {user.commitmentPaid ? (
                          <span style={{ ...styles.statusBadge, backgroundColor: '#dcfce7' }}>
                            Paid
                          </span>
                        ) : (
                          <span style={{ ...styles.statusBadge, backgroundColor: '#fef3c7', color: '#92400e' }}>
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commitment Fee QR Code */}
            {prebookUsers.some(u => !u.commitmentPaid) && (
              <div style={styles.qrContainer}>
                <h4 style={{ margin: '0 0 12px 0' }}>Scan to Pay Commitment Fee (RM10)</h4>
                <img src={logo} alt="QR Code for Payment" style={styles.qrImage} />
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                  After payment, upload receipt above
                </p>
              </div>
            )}
          </div>

            {/* Delivery Fee Calculator */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Calculator color="#2563eb" size={24} />
                <h2 style={styles.cardTitle}>Delivery Fee Structure</h2>
              </div>
              
              <div style={styles.feeStructure}>
                <div style={styles.feeRow}>
                  <span>RM0 - RM49</span>
                  <span style={styles.feeAmount}>RM8</span>
                </div>
                <div style={styles.feeRow}>
                  <span>RM50 - RM99</span>
                  <span style={styles.feeAmount}>RM17</span>
                </div>
                <div style={styles.feeRow}>
                  <span>RM100 - RM149</span>
                  <span style={styles.feeAmount}>RM25</span>
                </div>
                <div style={styles.feeRow}>
                  <span>RM150 - RM199</span>
                  <span style={styles.feeAmount}>RM30</span>
                </div>
                <div style={styles.feeRow}>
                  <span>RM200+</span>
                  <span style={styles.feeAmount}>RM35</span>
                </div>
              </div>
              
              <div style={styles.note}>
                <p style={styles.noteText}>
                  <strong>Note:</strong> Much cheaper than competitors! 
                  Grab charges RM18 flat rate, Mato charges 40% of order value.
                </p>
              </div>
            </div>

            {/* Order Upload Section */}
            {minOrderReached && (
              <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
                <div style={styles.cardHeader}>
                  <Receipt color="#7c3aed" size={24} />
                  <h2 style={styles.cardTitle}>Step 2: Upload Order Receipt</h2>
                </div>
                
                <div style={styles.grid}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Select Your Name:
                    </label>
                    <select 
                      style={styles.select}
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">Choose your name</option>
                      {prebookUsers.filter(u => u.commitmentPaid && !u.hasOrdered).map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.studentId})</option>
                      ))}
                    </select>

                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Upload Receipt:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      style={styles.input}
                    />
                    
                    {receiptFile && (
                      <div>
                        <img 
                          src={URL.createObjectURL(receiptFile)} 
                          alt="Receipt Preview" 
                          style={styles.receiptPreview}
                        />
                        <div style={styles.buttonGroup}>
                          <button
                            onClick={() => scanReceipt(receiptFile)}
                            disabled={scanLoading}
                            style={{
                              ...styles.button,
                              ...styles.buttonBlue,
                              opacity: scanLoading ? 0.6 : 1
                            }}
                          >
                            {scanLoading ? (
                              <>
                                <Camera size={16} style={{ marginRight: '8px' }} />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <Scan size={16} style={{ marginRight: '8px' }} />
                                Scan Receipt
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {orderDetails.orderNumber && orderDetails.items && orderDetails.totalAmount ? (
                  <OrderConfirmation
                    order={orderDetails}
                    onConfirm={handleReceiptUpload}
                    onEdit={() => setOrderDetails({ orderNumber: '', items: '', totalAmount: 0 })}
                  />
                ) : (
                  <button
                    onClick={handleReceiptUpload}
                    style={{
                      ...styles.button,
                      ...styles.buttonPurple
                    }}
                    disabled={!orderDetails.orderNumber || !orderDetails.items || !orderDetails.totalAmount}
                  >
                    Submit Order
                  </button>
                )}
                </div>
              )}
            </div>
          )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <Users color="#2563eb" size={32} style={{ margin: '0 auto' }} />
                <h3 style={styles.statNumber}>{prebookUsers.filter(u => u.commitmentPaid).length}</h3>
                <p style={styles.statLabel}>Paid Prebook Users</p>
              </div>
              <div style={styles.statCard}>
                <Receipt color="#059669" size={32} style={{ margin: '0 auto' }} />
                <h3 style={styles.statNumber}>{orders.length}</h3>
                <p style={styles.statLabel}>Confirmed Orders</p>
              </div>
              <div style={styles.statCard}>
                <Calculator color="#7c3aed" size={32} style={{ margin: '0 auto' }} />
                <h3 style={styles.statNumber}>
                  RM{orders.reduce((sum, order) => sum + order.deliveryFee, 0)}
                </h3>
                <p style={styles.statLabel}>Total Delivery Fees</p>
              </div>
              <div style={styles.statCard}>
                <CheckCircle color="#f59e0b" size={32} style={{ margin: '0 auto' }} />
                <h3 style={styles.statNumber}>
                  RM{prebookUsers.filter(u => u.commitmentPaid).length * 10}
                </h3>
                <p style={styles.statLabel}>Commitment Fees</p>
              </div>
            </div>

            {/* Orders List */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>All Orders</h2>
              {orders.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No orders yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Order #</th>
                        <th style={styles.tableHeader}>Customer</th>
                        <th style={styles.tableHeader}>Student ID</th>
                        <th style={styles.tableHeader}>Items</th>
                        <th style={styles.tableHeader}>Amount</th>
                        <th style={styles.tableHeader}>Delivery Fee</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const user = prebookUsers.find(u => u.id === order.userId);
                        return (
                          <tr key={order.id}>
                            <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                            <td style={styles.tableCell}>{order.userName}</td>
                            <td style={styles.tableCell}>{user?.studentId}</td>
                            <td style={{ ...styles.tableCell, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.items}
                            </td>
                            <td style={styles.tableCell}>RM{order.totalAmount}</td>
                            <td style={styles.tableCell}>RM{order.deliveryFee}</td>
                            <td style={styles.tableCell}>
                              <span style={styles.statusBadge}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Prebook Users Management */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Prebook Users Management</h2>
              {prebookUsers.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No prebook users yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Name</th>
                        <th style={styles.tableHeader}>Student ID</th>
                        <th style={styles.tableHeader}>Registered Time</th>
                        <th style={styles.tableHeader}>Commitment Fee</th>
                        <th style={styles.tableHeader}>Order Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prebookUsers.map((user) => (
                        <tr key={user.id}>
                          <td style={styles.tableCell}>{user.name}</td>
                          <td style={styles.tableCell}>{user.studentId}</td>
                          <td style={styles.tableCell}>{user.timestamp}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: user.commitmentPaid ? '#dcfce7' : '#fef3c7',
                              color: user.commitmentPaid ? '#166534' : '#92400e'
                            }}>
                              {user.commitmentPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: user.hasOrdered ? '#dcfce7' : '#f3f4f6',
                              color: user.hasOrdered ? '#166534' : '#6b7280'
                            }}>
                              {user.hasOrdered ? 'Ordered' : 'Not Ordered'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Driver Portal */}
        {activeTab === 'driver' && <DriverOrderList />}

        {/* Scan Preview Modal */}
        {showScanPreview && scannedData && (
          <div style={styles.scanPreview}>
            <div style={styles.scanModal}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Scanned Receipt Data</h2>
                <button
                  onClick={() => setShowScanPreview(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={24} color="#6b7280" />
                </button>
              </div>

              <div style={styles.scanResult}>
                <h3 style={{ color: '#0ea5e9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} />
                  Receipt Successfully Scanned!
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Order Number:</strong>
                  <div style={{ fontSize: '18px', fontFamily: 'monospace', color: '#1f2937', marginTop: '4px' }}>
                    {scannedData.orderNumber}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <strong>Total Amount:</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>
                    RM{scannedData.totalAmount}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <strong>Items:</strong>
                  <div style={{ marginTop: '8px' }}>
                    {scannedData.items.map((item, index) => (
                      <div key={index} style={{
                        padding: '8px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        border: '1px solid #e5e7eb'
                      }}>
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500' }}>Estimated Delivery Fee:</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                      RM{calculateDeliveryFee(scannedData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.warningAlert, marginBottom: '20px' }}>
                <AlertCircle color="#f59e0b" size={20} style={{ marginBottom: '8px' }} />
                <p style={{ color: '#92400e', margin: 0, fontWeight: '500' }}>
                  Please verify the scanned information is correct before confirming.
                </p>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  onClick={handleScanReject}
                  style={{
                    ...styles.button,
                    backgroundColor: '#dc2626',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <X size={16} />
                  Incorrect - Rescan
                </button>
                <button
                  onClick={handleScanConfirm}
                  style={{
                    ...styles.button,
                    ...styles.buttonGreen,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={16} />
                  Confirm & Use Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Crave2CaveSystem;