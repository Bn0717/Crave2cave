import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Receipt, Users, Truck, CheckCircle, Calculator, Camera, Scan, Lock, Eye, EyeOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBg56oKPkkQBHZYlqDe86gNKuM6CU9o0no",
  authDomain: "crave-2-cave.firebaseapp.com",
  projectId: "crave-2-cave",
  storageBucket: "crave-2-cave.firebasestorage.app",
  messagingSenderId: "328846262825",
  appId: "1:328846262825:web:149f44152723bdc62d9238"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Crave2CaveSystem = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [prebookUsers, setPrebookUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [minOrderReached, setMinOrderReached] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [orderTotal, setOrderTotal] = useState('');
  const [orderImage, setOrderImage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [userStep, setUserStep] = useState(1); // 1: Register, 2: Pay commitment, 3: Submit order

  const ADMIN_PASSCODE = 'YIEK';

useEffect(() => {
    // Check if the admin has already been authenticated in this session
    const isAuthenticatedFromStorage = localStorage.getItem('isAdminAuthenticated');
    if (isAuthenticatedFromStorage === 'true') {
        setIsAuthenticated(true); // Automatically authenticate if the flag exists
    }
    
    getPrebookUsers();
    getOrders();
}, []);


  // Firebase functions
  const savePrebookUser = async (user) => {
    try {
      const docRef = await addDoc(collection(db, 'prebookUsers'), user);
      console.log('Document written with ID: ', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
      throw e;
    }
  };

  const updatePrebookUser = async (userId, updates) => {
    try {
      const userRef = doc(db, 'prebookUsers', userId);
      await updateDoc(userRef, updates);
      console.log('User updated successfully');
    } catch (e) {
      console.error('Error updating user: ', e);
      throw e;
    }
  };

  const getPrebookUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'prebookUsers'));
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, firestoreId: doc.id, ...doc.data() }));
      setPrebookUsers(users);

      // Check if minimum order reached
      const paidUsers = users.filter(u => u.commitmentPaid);
      setMinOrderReached(paidUsers.length >= 3);
    } catch (e) {
      console.error('Error getting users: ', e);
    }
  };

  const saveOrder = async (order) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log('Order saved with ID: ', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error saving order: ', e);
      throw e;
    }
  };

  const getOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orders);
    } catch (e) {
      console.error('Error getting orders: ', e);
    }
  };

  useEffect(() => {
    getPrebookUsers();
    getOrders();
  }, []);

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
    buttonBlue: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    buttonOrange: {
      backgroundColor: '#ea580c',
      color: 'white'
    },
    successAlert: {
      textAlign: 'center',
      padding: '16px',
      backgroundColor: '#ecfdf5',
      borderRadius: '8px',
      border: '1px solid #10b981'
    },
    authContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px'
    },
    passcodeInput: {
      position: 'relative',
      marginBottom: '16px',
      width: '300px'
    },
    toggleButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280'
    },
    orderItem: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#f9fafb'
    },
    orderImage: {
      maxWidth: '200px',
      maxHeight: '200px',
      borderRadius: '8px',
      marginTop: '8px'
    }
  };

  const handlePrebook = async () => {
    if (!studentName.trim() || !studentId.trim()) {
      alert('Please enter both your name and student ID');
      return;
    }

    const nameExists = prebookUsers.some(user => user.name && user.name.toLowerCase() === studentName.toLowerCase());
    const idExists = prebookUsers.some(user => user.studentId === studentId);

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

    try {
      const newUser = {
        name: studentName,
        studentId: studentId,
        timestamp: new Date().toISOString(),
        hasOrdered: false,
        commitmentPaid: false,
        orderTotal: 0,
        orderSubmitted: false
      };

      const firestoreId = await savePrebookUser(newUser);
      const userWithId = { ...newUser, id: firestoreId, firestoreId };

      setPrebookUsers(prev => [...prev, userWithId]);
      setSelectedUserId(firestoreId);
      setUserStep(2);

      alert('Registration successful! Please pay the RM10 commitment fee to proceed.');
    } catch (error) {
      alert('Error registering user. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const handleCommitmentPayment = async () => {
    if (!receiptFile) {
      alert('Please upload payment receipt');
      return;
    }

    try {
      // Update Firestore that the user has paid and uploaded the receipt
      await updatePrebookUser(selectedUserId, {
        commitmentPaid: true,
        paymentReceiptUploaded: true
      });

      // Update the local state to reflect the user's payment status
      setPrebookUsers(prev => prev.map(user =>
        user.firestoreId === selectedUserId
          ? { ...user, commitmentPaid: true }
          : user
      ));

      // Refresh the prebooked users
      await getPrebookUsers(); // Refresh data

      // Set the user step to 3 (Submit Order)
      setUserStep(3);
      alert('Commitment fee payment submitted! You can now submit your order total.');
    } catch (error) {
      alert('Error submitting payment. Please try again.');
      console.error('Payment error:', error);
    }
  };


  const handleOrderSubmission = async () => {
    if (!orderTotal || !orderImage) {
      alert('Please enter order total and upload order image');
      return;
    }

    const totalAmount = parseFloat(orderTotal);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      alert('Please enter a valid order total');
      return;
    }

    try {
      const selectedUser = prebookUsers.find(u => u.firestoreId === selectedUserId);
      const deliveryFee = calculateDeliveryFee(totalAmount);

      const orderData = {
        userId: selectedUserId,
        userName: selectedUser.name,
        studentId: selectedUser.studentId,
        orderTotal: totalAmount,
        deliveryFee: deliveryFee,
        totalWithDelivery: totalAmount + deliveryFee,
        timestamp: new Date().toISOString(),
        orderImageUploaded: true
      };

      await saveOrder(orderData);

      await updatePrebookUser(selectedUserId, {
        orderTotal: totalAmount,
        orderSubmitted: true,
        hasOrdered: true
      });

      await getPrebookUsers();
      await getOrders();

      alert(`Order submitted successfully! 
Order Total: RM${totalAmount}
Delivery Fee: RM${deliveryFee}
Total Amount: RM${totalAmount + deliveryFee}`);
    } catch (error) {
      alert('Error submitting order. Please try again.');
      console.error('Order submission error:', error);
    }
  };

  const calculateDeliveryFee = (amount) => {
    if (amount < 50) return 8;
    if (amount >= 50 && amount < 100) return 17;
    if (amount >= 100 && amount < 150) return 25;
    if (amount >= 150 && amount < 200) return 30;
    return 35; // RM200+
  };

const handleAuthentication = () => {
    if (passcode === ADMIN_PASSCODE) {
        // Save authentication status to localStorage
        localStorage.setItem('isAdminAuthenticated', 'true');  // Store the authentication flag

        setIsAuthenticated(true);
        setPasscode('');
    } else {
        alert('Invalid passcode');
    }
};



const resetAuth = () => {
    setIsAuthenticated(false);
    setPasscode('');
    localStorage.removeItem('isAdminAuthenticated');  // Clear the authentication flag
};

  const passcodeInputRef = useRef(null);

  const AuthScreen = ({ title }) => (
    <div style={styles.card}>
      <div style={styles.authContainer}>
        <Lock size={48} color="#6b7280" style={{ marginBottom: '24px' }} />
        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>{title}</h2>
        <p style={{ marginBottom: '24px', color: '#6b7280', textAlign: 'center' }}>
          Enter the passcode to access {title.toLowerCase()}
        </p>
        <div style={styles.passcodeInput}>
          <input
            type={showPasscode ? 'text' : 'password'}
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
            ref={passcodeInputRef}  // Added ref to the input
            autoFocus  // Ensures the input remains in focus
          />
          <button
            type="button"
            onClick={() => setShowPasscode(!showPasscode)}
            style={styles.toggleButton}
          >
            {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          onClick={handleAuthentication}
          style={{
            ...styles.button,
            ...styles.buttonBlue,
            width: '300px'
          }}
        >
          Access {title}
        </button>
      </div>
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
            onClick={() => {
              setActiveTab('student');
              setIsAuthenticated(false);
            }}
            style={{
              ...styles.navButton,
              ...(activeTab === 'student' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Student Portal
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setIsAuthenticated(false);
            }}
            style={{
              ...styles.navButton,
              ...(activeTab === 'admin' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('driver');
              setIsAuthenticated(false);
            }}
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
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Users color="#059669" size={24} />
                <h2 style={styles.cardTitle}>Food Delivery Registration</h2>
              </div>

              {/* Progress Bar */}
              <div style={styles.progressBar}>
                <div style={styles.progressText}>
                  <span>Minimum 3 paid user required</span>
                  <span>{prebookUsers.filter(u => u.commitmentPaid).length}/3</span>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min((prebookUsers.filter(u => u.commitmentPaid).length / 3) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Step 1: Registration */}
              {userStep === 1 && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Step 1: Register</h3>
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
                    Register for Delivery
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {userStep === 2 && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Step 2: Pay Commitment Fee</h3>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <p><strong>Name:</strong> {studentName}</p>
                    <p><strong>Student ID:</strong> {studentId}</p>
                    <p><strong>Commitment Fee:</strong> RM10</p>
                  </div>

                  <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                    Upload proof of payment (RM10 commitment fee):
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files[0])} // Update receipt file state
                    style={styles.input}
                  />

                  {receiptFile && (
                    <div style={{ marginBottom: '16px' }}>
                      <img
                        src={URL.createObjectURL(receiptFile)}
                        alt="Payment Receipt"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleCommitmentPayment}
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
                        setUserStep(1);
                        setSelectedUserId('');
                        setReceiptFile(null);
                      }}
                      style={{
                        ...styles.button,
                        backgroundColor: '#6b7280',
                        color: 'white'
                      }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Submission */}
              {userStep === 3 && minOrderReached && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Step 3: Submit Your Order</h3>

                  <div style={{
                    backgroundColor: '#ecfdf5',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #10b981'
                  }}>
                    <CheckCircle color="#059669" size={20} style={{ marginRight: '8px' }} />
                    Payment confirmed! You can now submit your order.
                  </div>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter your order total (RM)"
                    value={orderTotal}
                    onChange={(e) => setOrderTotal(e.target.value)}
                    style={styles.input}
                  />

                  {orderTotal && (
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <p style={{ margin: '4px 0' }}>Order Total: RM{orderTotal}</p>
                      <p style={{ margin: '4px 0' }}>Delivery Fee: RM{calculateDeliveryFee(parseFloat(orderTotal) || 0)}</p>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                        Total Amount: RM{(parseFloat(orderTotal) || 0) + calculateDeliveryFee(parseFloat(orderTotal) || 0)}
                      </p>
                    </div>
                  )}

                  <p style={{ marginBottom: '8px', color: '#6b7280' }}>
                    Upload image of your order:
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setOrderImage(e.target.files[0])}
                    style={styles.input}
                  />

                  {orderImage && (
                    <div style={{ marginBottom: '16px' }}>
                      <img
                        src={URL.createObjectURL(orderImage)}
                        alt="Order"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleOrderSubmission}
                    disabled={!orderTotal || !orderImage}
                    style={{
                      ...styles.button,
                      ...styles.buttonOrange,
                      opacity: (!orderTotal || !orderImage) ? 0.5 : 1,
                      cursor: (!orderTotal || !orderImage) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Submit Order
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && (
          <>
            {!isAuthenticated ? (
              <AuthScreen title="Admin Dashboard" />
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2>Admin Dashboard</h2>
                  <button
                    onClick={resetAuth}
                    style={{
                      ...styles.button,
                      width: 'auto',
                      backgroundColor: '#6b7280',
                      color: 'white'
                    }}
                  >
                    Logout
                  </button>
                </div>

                <div style={styles.grid}>
                  {/* Statistics */}
                  <div style={styles.card}>
                    <h3>Summary</h3>
                    <p>Total Registered Users: {prebookUsers.length}</p>
                    <p>Paid Users: {prebookUsers.filter(u => u.commitmentPaid).length}</p>
                    <p>Orders Submitted: {orders.length}</p>
                    <p>Total Commitment Fees: RM{prebookUsers.filter(u => u.commitmentPaid).length * 10}</p>
                    <p>Total Delivery Fees: RM{orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)}</p>
                  </div>

                  {/* Prebook Users */}
                  <div style={styles.card}>
                    <h3>Registered Users</h3>
                    {prebookUsers.map((user, index) => (
                      <div key={user.id || index} style={styles.orderItem}>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Student ID:</strong> {user.studentId}</p>
                        <p><strong>Commitment Paid:</strong> {user.commitmentPaid ? 'Yes' : 'No'}</p>
                        <p><strong>Order Submitted:</strong> {user.orderSubmitted ? 'Yes' : 'No'}</p>
                        {user.orderTotal && <p><strong>Order Total:</strong> RM{user.orderTotal}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Orders */}
                  <div style={styles.card}>
                    <h3>Summary</h3>
                    <p>Total Registered Users: {prebookUsers.length}</p>
                    <p>Paid Users: {prebookUsers.filter(u => u.commitmentPaid).length}</p>
                    <p>Orders Submitted: {orders.length}</p>
                    <p>Total Commitment Fees: RM{prebookUsers.filter(u => u.commitmentPaid).length * 10}</p>

                    {/* Add Total Delivery Fees calculation here */}
                    <p>Total Delivery Fees: RM{orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)}</p>

                    <p>Total Order Amount: RM{orders.reduce((sum, order) => sum + (order.totalWithDelivery || 0), 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Driver Portal */}
        {activeTab === 'driver' && (
          <>
            {!isAuthenticated ? (
              <AuthScreen title="Driver Portal" />
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2>Driver Portal</h2>
                  <button
                    onClick={resetAuth}
                    style={{
                      ...styles.button,
                      width: 'auto',
                      backgroundColor: '#6b7280',
                      color: 'white'
                    }}
                  >
                    Logout
                  </button>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <Truck color="#ea580c" size={24} />
                    <h2 style={styles.cardTitle}>Delivery Orders</h2>
                  </div>

                  {orders.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                      No orders available yet.
                    </p>
                  ) : (
                    orders.map((order, index) => (
                      <div key={order.id || index} style={styles.orderItem}>
                        <p><strong>Customer:</strong> {order.userName}</p>
                        <p><strong>Student ID:</strong> {order.studentId}</p>
                        <p><strong>Order Total:</strong> RM{order.orderTotal}</p>
                        <p><strong>Order Time:</strong> {new Date(order.timestamp).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Crave2CaveSystem;