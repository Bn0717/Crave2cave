import React, { useState } from 'react';
import { MapPin, Receipt, Users, Truck, CheckCircle, Calculator } from 'lucide-react';

const Crave2CaveSystem = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [prebookUsers, setPrebookUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [driverQueue, setDriverQueue] = useState([]);
  const [minOrderReached, setMinOrderReached] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    items: '',
    totalAmount: 0
  });

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '15px',
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
    successAlert: {
      textAlign: 'center',
      padding: '16px',
      backgroundColor: '#ecfdf5',
      borderRadius: '8px',
      border: '1px solid #10b981'
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
      padding: '8px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      marginBottom: '8px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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

  const handlePrebook = () => {
    if (studentName.trim()) {
      const newUser = {
        id: Date.now(),
        name: studentName,
        timestamp: new Date().toLocaleTimeString(),
        hasOrdered: false
      };
      
      const updatedUsers = [...prebookUsers, newUser];
      setPrebookUsers(updatedUsers);
      
      if (updatedUsers.length >= 5) {
        setMinOrderReached(true);
      }
      
      setStudentName('');
      alert(`${studentName} has been added to the prebook list!`);
    }
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

    // Reset form
    setReceiptFile(null);
    setSelectedUserId('');
    setOrderDetails({ orderNumber: '', items: '', totalAmount: 0 });
    
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
                  <span>Minimum 5 users required</span>
                  <span>{prebookUsers.length}/5</span>
                </div>
                <div style={styles.progressTrack}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${progressPercentage}%`
                    }}
                  ></div>
                </div>
              </div>

              {!minOrderReached ? (
                <div>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    onClick={handlePrebook}
                    style={{
                      ...styles.button,
                      ...styles.buttonGreen
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                  >
                    Join Prebook Queue
                  </button>
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
                          <span>{user.name}</span>
                          {user.hasOrdered && (
                            <CheckCircle color="#059669" size={16} />
                          )}
                        </div>
                        <span style={styles.timestamp}>{user.timestamp}</span>
                      </div>
                    ))}
                  </div>
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
                      {prebookUsers.filter(u => !u.hasOrdered).map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
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
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="Order Number"
                      value={orderDetails.orderNumber}
                      onChange={(e) => setOrderDetails({...orderDetails, orderNumber: e.target.value})}
                      style={styles.input}
                    />
                    
                    <textarea
                      placeholder="Items ordered (e.g., 2x Pepperoni Pizza, 1x Garlic Bread)"
                      value={orderDetails.items}
                      onChange={(e) => setOrderDetails({...orderDetails, items: e.target.value})}
                      style={styles.textarea}
                    />
                    
                    <input
                      type="number"
                      placeholder="Total Amount (RM)"
                      value={orderDetails.totalAmount}
                      onChange={(e) => setOrderDetails({...orderDetails, totalAmount: parseFloat(e.target.value) || 0})}
                      style={styles.input}
                    />
                    
                    {orderDetails.totalAmount > 0 && (
                      <div style={{ ...styles.note, backgroundColor: '#ecfdf5', marginTop: '0', marginBottom: '12px' }}>
                        <p style={{ ...styles.noteText, color: '#065f46', margin: 0 }}>
                          Delivery Fee: <strong>RM{calculateDeliveryFee(orderDetails.totalAmount)}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleReceiptUpload}
                  style={{
                    ...styles.button,
                    ...styles.buttonPurple
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
                >
                  Submit Order
                </button>
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
                <h3 style={styles.statNumber}>{prebookUsers.length}</h3>
                <p style={styles.statLabel}>Prebook Users</p>
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
                        <th style={styles.tableHeader}>Items</th>
                        <th style={styles.tableHeader}>Amount</th>
                        <th style={styles.tableHeader}>Delivery Fee</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                          <td style={styles.tableCell}>{order.userName}</td>
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
      </div>
    </div>
  );
};

export default Crave2CaveSystem;