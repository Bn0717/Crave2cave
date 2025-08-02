import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import * as firebaseService from '../services/firebase';
import { calculateDeliveryFee } from '../utils/calculateDeliveryFee';
import { isToday } from '../utils/isToday';
import RetrieveRegistration from './RetrieveRegistration';
import BeautifulMessage from './BeautifulMessage';
import FeeBreakdown from './FeeBreakdown';
import UnifiedQRCodeDisplay from './UnifiedQRCodeDisplay';
import CountdownTimer from './CountdownTimer';

const StudentTab = ({
  prebookUsers,
  todayUsers,
  todayOrders,
  minOrderReached,
  systemActivatedToday,
  registrationOrder,
  windowWidth,
  showSuccessAnimation,
  showLoadingAnimation,
  hideLoadingAnimation,
  fetchAllData,
  setSelectedImage,
  setOrderConfirmed,
  setCurrentOrder,
  setResetStudentForm,
  setShowEmailModal,
  setUserForEmail,
  selectedVendor,
  rememberedStudent,
  setRememberedStudent,
}) => {
  const [userStep, setUserStep] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null); // Commitment fee receipt
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState('');
  const [paymentProof, setPaymentProof] = useState(null); // Delivery fee proof
  const [orderReceiptFile, setOrderReceiptFile] = useState(null); // Order receipt
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [nameError, setNameError] = useState('');
  const [idError, setIdError] = useState('');
  const [orderError, setOrderError] = useState('');

  const styles = {
    card: { 
      backgroundColor: 'white', 
      borderRadius: '20px', 
      padding: windowWidth <= 480 ? '20px' : '32px', 
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', 
      marginBottom: '24px', 
      border: '1px solid #f1f5f9' 
    },
    cardHeader: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      marginBottom: '24px',
      flexDirection: windowWidth <= 480 ? 'column' : 'row',
      textAlign: windowWidth <= 480 ? 'center' : 'left'
    },
    cardTitle: { 
      fontSize: windowWidth <= 480 ? '20px' : '24px', 
      fontWeight: '700', 
      margin: 0, 
      color: '#1e293b' 
    },
    progressBar: { marginBottom: '28px' },
    progressText: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      fontSize: windowWidth <= 480 ? '12px' : '14px', 
      color: '#64748b', 
      marginBottom: '10px', 
      fontWeight: '500',
      flexWrap: 'wrap',
      gap: '8px'
    },
    progressTrack: { 
      width: '100%', 
      height: '12px', 
      backgroundColor: '#e2e8f0', 
      borderRadius: '6px', 
      overflow: 'hidden', 
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' 
    },
    progressFill: { 
      height: '100%', 
      backgroundColor: '#10b981', 
      transition: 'width 0.5s ease', 
      borderRadius: '6px', 
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' 
    },
    input: { 
      width: '100%', 
      padding: windowWidth <= 480 ? '14px 16px' : '16px 20px', 
      border: '2px solid #e2e8f0', 
      borderRadius: '12px', 
      marginBottom: '16px', 
      fontSize: windowWidth <= 480 ? '14px' : '16px', 
      boxSizing: 'border-box', 
      transition: 'all 0.2s', 
      backgroundColor: '#f8fafc' 
    },
    button: { 
      width: '100%', 
      padding: windowWidth <= 480 ? '14px 24px' : '16px 32px', 
      borderRadius: '12px', 
      fontWeight: '600', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: windowWidth <= 480 ? '14px' : '16px', 
      transition: 'all 0.3s ease', 
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)' 
    },
    buttonRow: {
      display: 'flex',
      gap: '12px',
      flexDirection: windowWidth <= 480 ? 'column' : 'row'
    },
    inputError: { borderColor: '#ef4444' },
    errorText: { 
      color: '#ef4444', 
      fontSize: '13px', 
      marginTop: '-12px', 
      marginBottom: '12px' 
    },
    buttonGreen: { 
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
      color: 'white' 
    },
    buttonBlue: { 
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
      color: 'white' 
    },
    buttonOrange: { 
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
      color: 'white' 
    },
    buttonGray: {
      backgroundColor: '#64748b',
      color: 'white'
    },
    sectionCard: {
      backgroundColor: '#f8fafc',
      padding: windowWidth <= 480 ? '16px' : '24px',
      borderRadius: '16px',
      marginBottom: '24px',
      border: '2px solid #e2e8f0'
    },
    sectionHeader: {
      margin: '0 0 16px 0',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: windowWidth <= 480 ? '16px' : '18px'
    },
    stepNumber: {
      backgroundColor: '#3b82f6',
      color: 'white',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    infoCard: {
      backgroundColor: '#f0f9ff',
      padding: windowWidth <= 480 ? '16px' : '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #bfdbfe'
    },
  };

  const validateName = (name) => {
    if (!name.trim()) { 
      setNameError('Name is required'); 
      return false; 
    }
    if (name.trim().split(' ').length < 2) { 
      setNameError('Please enter your full name (first and last name)'); 
      return false; 
    }
    setNameError(''); 
    return true;
  };

  const validateStudentId = (id) => {
    if (!id.trim()) { 
      setIdError('Student ID is required'); 
      return false; 
    }
    if (id.length < 4) { 
      setIdError('Student ID must be at least 4 characters'); 
      return false; 
    }
    if (!/\d{4}\/\d{2}$/.test(id)) { 
      setIdError('Student ID format should be like 0469/24'); 
      return false; 
    }
    setIdError(''); 
    return true;
  };

  const validateOrderDetails = () => {
    if (!orderNumber.trim()) {
      setOrderError('Order number is required');
      return false;
    }
    if (!orderTotal || isNaN(orderTotal) || Number(orderTotal) <= 0) {
      setOrderError('Order total must be a valid number greater than 0');
      return false;
    }
    setOrderError('');
    return true;
  };

  const handlePrebook = async () => {
    if (!validateName(studentName) || !validateStudentId(studentId)) return;
    
    const existingUser = prebookUsers.find(user => 
      isToday(user.timestamp) && 
      (user.studentId === studentId || user.name.toLowerCase() === studentName.toLowerCase())
    );
    
    if (existingUser) {
      let message = 'You have already registered today.';
      if (existingUser.studentId === studentId) {
        message = `Student ID ${studentId} has already been used.`;
      } else if (existingUser.name.toLowerCase() === studentName.toLowerCase()) {
        message = `Name "${studentName}" has already been used.`;
      }
      showSuccessAnimation(
        'Registration Already Exists', 
        message, 
        <BeautifulMessage 
          type="error" 
          message="Please try again tomorrow." 
          icon={<AlertCircle />} 
        />, 
        3000, 
        true
      );
      return;
    }

    showLoadingAnimation('Registering...');
    
    try {
      const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
      const isSystemActivated = paidUsersCount >= 3;
      const registrationIndex = prebookUsers.length;
      const isFourthOrLaterUser = isSystemActivated || registrationIndex >= 3;
      
      const newUser = {
        name: studentName,
        studentId,
        timestamp: new Date().toISOString(),
        hasOrdered: false,
        commitmentPaid: isFourthOrLaterUser,
        orderTotal: 0,
        orderSubmitted: false,
        wasFourthUser: isFourthOrLaterUser,
        registrationOrder: registrationIndex + 1
      };
      
      const newUserId = await firebaseService.savePrebookUser(newUser);
      setSelectedUserId(newUserId);
      setCurrentUserIndex(registrationIndex);
      saveStudentSession({
  name: studentName,
  studentId,
  firestoreId: newUserId
});
      await fetchAllData();
      hideLoadingAnimation();
      
      if (isFourthOrLaterUser) {
        showSuccessAnimation(
          'Registration Successful!', 
          'You have been registered for the food delivery service.',
          <p style={{ color: '#059669', fontWeight: '600', fontSize: '18px' }}>
            🎉 System is active! You can now submit your order.
          </p>,
          2500,
          true,
          () => setUserStep(3)
        );
      } else {
        showSuccessAnimation(
          'Registration Successful!', 
          'You have been registered for the food delivery service.',
          <p>Please proceed to pay the RM10 base delivery fee.</p>,
          5000,
          true,
          () => setUserStep(2)
        );
      }
    } catch (error) {
      hideLoadingAnimation();
      alert('Error registering user. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const handleCommitmentPayment = async () => {
    const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
    const isFourthUser = userOrder ? userOrder.order >= 4 : currentUserIndex >= 3;

    if (!isFourthUser && !receiptFile) {
      showSuccessAnimation(
        'Missing Receipt',
        'Please upload a payment receipt for the commitment fee.',
        null,
        3000,
        true
      );
      return;
    }

    showLoadingAnimation(isFourthUser ? 'Processing...' : 'Uploading receipt...');

    try {
      let receiptURL = null;
      if (!isFourthUser) {
        if (!(receiptFile instanceof File)) {
          throw new Error('Invalid receipt file: Please select a valid image');
        }
        receiptURL = await firebaseService.uploadFileToStorage(receiptFile);
      }

      await firebaseService.updatePrebookUser(selectedUserId, {
        commitmentPaid: true,
        paymentReceiptUploaded: !isFourthUser,
        receiptURL,
        wasFourthUser: isFourthUser,
      });

      const userBeingUpdated = prebookUsers.find(u => u.firestoreId === selectedUserId);
      const currentPaidCount = prebookUsers.filter(u => u.commitmentPaid).length;
      const newPaidCount = userBeingUpdated && !userBeingUpdated.commitmentPaid ? currentPaidCount + 1 : currentPaidCount;

      await fetchAllData();
      hideLoadingAnimation();

      if (newPaidCount >= 3 || isFourthUser) {
        showSuccessAnimation(
          isFourthUser ? 'Processing Complete!' : 'Payment Confirmed!',
          isFourthUser ? 'As a 4th+ registrant, you can proceed without payment!' : 'Your RM10 commitment fee has been received.',
          <p>You can now submit your order!</p>,
          2500,
          true,
          () => setUserStep(3)
        );
      } else {
        const remaining = 3 - newPaidCount;
        showSuccessAnimation(
          'Payment Confirmed!',
          'Your RM10 base delivery fee has been received.',
          <p>We need {remaining} more paid user{remaining > 1 ? 's' : ''} before order submission opens. Please check back later by retrieving your registration!</p>,
          0,
          true,
          () => {
            setUserStep(1);
            setStudentName('');
            setStudentId('');
            setSelectedUserId('');
            setReceiptFile(null);
          }
        );
      }
    } catch (error) {
      hideLoadingAnimation();
      showSuccessAnimation(
        'Upload Failed',
        `Failed to upload payment receipt: ${error.message}`,
        null,
        3000,
        true
      );
      console.error('Payment error:', error);
    }
  };

  const handleOrderSubmission = async () => {
  if (!orderReceiptFile) {
    setOrderError('missingFile');
    return;
  }

  if (!validateOrderDetails()) {
    showSuccessAnimation(
      'Missing Fields',
      orderError,
      null,
      3000,
      true
    );
    return;
  }

  const totalAmount = parseFloat(orderTotal);
  const deliveryFee = calculateDeliveryFee(totalAmount);
  const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
  const commitmentFeeDeducted = currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0 ? 10 : 0;
  const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

  if (actualDeliveryFee > 0 && !paymentProof) {
    showSuccessAnimation(
      'Payment Receipt Required',
      'Please upload your payment receipt for the delivery fee.',
      null,
      3000,
      true
    );
    return;
  }

  showLoadingAnimation('Processing order...');

  try {
    let paymentProofURL = null;
    if (paymentProof) {
      if (!(paymentProof instanceof File)) {
        throw new Error('Invalid payment proof file: Please select a valid image');
      }
      paymentProofURL = await firebaseService.uploadFileToStorage(paymentProof);
    }

    let orderImageURL = null;
    if (orderReceiptFile) {
      if (!(orderReceiptFile instanceof File)) {
        throw new Error('Invalid order receipt file: Please select a valid image');
      }
      orderImageURL = await firebaseService.uploadFileToStorage(orderReceiptFile);
    }

    const orderData = {
      userId: selectedUserId,
      userName: studentName,
      studentId,
      orderTotal: totalAmount,
      originalDeliveryFee: deliveryFee,
      deliveryFee: actualDeliveryFee,
      commitmentFeeDeducted,
      totalWithDelivery: totalAmount + actualDeliveryFee,
      orderImageURL,
      paymentProofURL,
      orderNumber: orderNumber.trim(),
      status: 'pending',
      userPosition: currentUserIndex + 1,
      wasFourthUser: currentUserIndex >= 3,
      timestamp: new Date().toISOString(),
      vendor: selectedVendor,
    };

    const orderId = await firebaseService.saveOrder(orderData);

    await firebaseService.updatePrebookUser(selectedUserId, {
      orderTotal: orderData.orderTotal,
      orderSubmitted: true,
      hasOrdered: true,
      lastOrderDate: new Date().toISOString(),
    });

    hideLoadingAnimation();

    showSuccessAnimation(
      'Order Submitted!',
      'Please provide your email to receive order updates.',
      null,
      3000,
      true,
      () => {
        if (!selectedUserId) {
          console.error('selectedUserId is undefined');
          showSuccessAnimation(
            'Error',
            'Unable to proceed: User ID is missing. Please try again.',
            null,
            3000,
            true
          );
          return;
        }

        setUserForEmail({ firestoreId: selectedUserId, name: studentName });
        setShowEmailModal(true);
        setCurrentOrder({ ...orderData, orderId });

        // 🚫 DO NOT call setOrderConfirmed(true) here anymore!
        // ✅ Call it inside the email modal after email is submitted
      }
    );
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation(
      'Order Submission Failed',
      `Failed to submit order: ${error.message}`,
      null,
      3000,
      true
    );
    console.error('Order submission error:', error);
  }
};


  const handleRetrieveRegistration = async (name, id) => {
  const foundUser = prebookUsers.find(user =>
    user.name?.toLowerCase() === name.toLowerCase() &&
    user.studentId === id &&
    isToday(user.timestamp)
  );
 
  if (!foundUser) {
    showSuccessAnimation(
      "Registration Not Found",
      `We couldn't find your registration details for today.`,
      <BeautifulMessage
        type="warning"
        title="Daily Registration Required"
        message="Registrations are only valid for the current day. Please register again for today's delivery."
        icon={<AlertCircle />}
      />,
      0,
      true
    );
    return;
  }

  if (foundUser.orderSubmitted && isToday(foundUser.lastOrderDate)) {
    showLoadingAnimation('Retrieving your order...');
    try {
      // Fetch the existing order for the user
      const order = await firebaseService.getOrderByUserId(foundUser.firestoreId);
      if (order) {
        // Close the retrieve form
        setShowRetrieve(false);
        // Set the current order with retrieved data
        setCurrentOrder({
    ...order,
    orderReceiptURL: order.orderReceiptURL || null
  });
        // Navigate to WaitingPage
        setOrderConfirmed(true);
        hideLoadingAnimation();
        return;
      } else {
        hideLoadingAnimation();
        showSuccessAnimation(
          "Order Not Found",
          `No order details found for ${foundUser.name}.`,
          <BeautifulMessage
            type="info"
            title="Order Issue"
            message="Please contact support if you believe this is an error."
            icon={<AlertCircle />}
          />,
          3000,
          true
        );
        return;
      }
    } catch (error) {
      console.error('Error retrieving order:', error);
      hideLoadingAnimation();
      showSuccessAnimation(
        "Error",
        `Failed to retrieve order: ${error.message}`,
        null,
        3000,
        true
      );
      return;
    }
  }

  // User hasn't submitted order yet, continue with normal registration flow
  const userOrder = registrationOrder.find(order => order.userId === foundUser.firestoreId);
  const userIndex = userOrder ? userOrder.order - 1 : prebookUsers.findIndex(u => u.firestoreId === foundUser.firestoreId);
 
  setCurrentUserIndex(userIndex);
  setStudentName(foundUser.name);
  setStudentId(foundUser.studentId);
  setSelectedUserId(foundUser.firestoreId);
  saveStudentSession({
  name: foundUser.name,
  studentId: foundUser.studentId,
  firestoreId: foundUser.firestoreId
});
 
  if (foundUser.commitmentPaid || (systemActivatedToday && userIndex >= 3)) {
    setUserStep(3);
    showSuccessAnimation(
      `Welcome back ${foundUser.name}!`,
      systemActivatedToday && userIndex >= 3
        ? 'System is active! You can proceed directly to order submission.'
        : 'Your payment has been confirmed. You can now submit your order.',
      null,
      2500,
      true
    );
  } else {
    setUserStep(2);
    const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
    showSuccessAnimation(
      `Welcome back ${foundUser.name}!`,
      'Please complete your commitment fee payment to continue.',
      <p>We still need {3 - paidUsersCount} more paid users before order submission opens.</p>,
      5000,
      true
    );
  }
  setShowRetrieve(false);
};

// Save student session to localStorage
const saveStudentSession = (studentData) => {
  const sessionData = {
    name: studentData.name,
    studentId: studentData.studentId,
    firestoreId: studentData.firestoreId,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('rememberedStudent', JSON.stringify(sessionData));
  setRememberedStudent(sessionData);
};

// Clear student session
const clearStudentSession = () => {
  localStorage.removeItem('rememberedStudent');
  setRememberedStudent(null);
};

const loadFromSession = async () => {
  if (rememberedStudent) {
    setStudentName(rememberedStudent.name);
    setStudentId(rememberedStudent.studentId);
    setSelectedUserId(rememberedStudent.firestoreId);
    
    // Find user in today's data
    const foundUser = prebookUsers.find(u => u.firestoreId === rememberedStudent.firestoreId);
    if (foundUser) {
      const userOrder = registrationOrder.find(order => order.userId === foundUser.firestoreId);
      const userIndex = userOrder ? userOrder.order - 1 : prebookUsers.findIndex(u => u.firestoreId === foundUser.firestoreId);
      setCurrentUserIndex(userIndex);
      
      // Check if user already has an order today
      if (foundUser.orderSubmitted && isToday(foundUser.lastOrderDate)) {
        try {
          showLoadingAnimation('Loading your order...');
          const order = await firebaseService.getOrderByUserId(foundUser.firestoreId);
          if (order) {
            setCurrentOrder(order);
            setOrderConfirmed(true);
            hideLoadingAnimation();
            return;
          }
        } catch (error) {
          console.error('Error loading order:', error);
          hideLoadingAnimation();
        }
      }
      
      // Determine which step to show
      if (foundUser.commitmentPaid || (systemActivatedToday && userIndex >= 3)) {
        setUserStep(3);
        showSuccessAnimation(
          `Welcome back ${foundUser.name}!`,
          'You can continue with your order submission.',
          null, 2000, true
        );
      } else {
        setUserStep(2);
        showSuccessAnimation(
          `Welcome back ${foundUser.name}!`,
          'Please complete your payment to continue.',
          null, 2000, true
        );
      }
    }
  }
};

  const resetForm = useCallback((clearSession = false) => {
  setUserStep(1);
  setStudentName('');
  setStudentId('');
  setSelectedUserId('');
  setReceiptFile(null);
  setOrderNumber('');
  setOrderTotal('');
  setPaymentProof(null);
  setOrderReceiptFile(null);
  setCurrentUserIndex(0);
  setNameError('');
  setIdError('');
  setOrderError('');
  
  // ADD THIS: Clear session if requested
  if (clearSession) {
    clearStudentSession();
  }
}, []);

  // Auto-load student session on component mount
useEffect(() => {
  if (rememberedStudent && userStep === 1 && !selectedUserId && prebookUsers.length > 0) {
    const foundUser = prebookUsers.find(u => u.firestoreId === rememberedStudent.firestoreId);
    if (foundUser && isToday(foundUser.timestamp)) {
      loadFromSession();
    }
  }
}, [rememberedStudent, prebookUsers, userStep, selectedUserId]);
useEffect(() => {
  setResetStudentForm(() => resetForm);
}, [resetForm, setResetStudentForm]);

  const parsedOrderTotal = parseFloat(orderTotal) || 0;
const deliveryFee = calculateDeliveryFee(parsedOrderTotal);
const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

const isSubmitDisabled =
  !orderNumber.trim() ||
  !orderTotal ||
  isNaN(orderTotal) ||
  Number(orderTotal) <= 0 ||
  !orderReceiptFile ||
  (actualDeliveryFee > 0 && !paymentProof); // ✅ ONLY require paymentProof if actual fee > 0



  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <Users color="#3b82f6" size={28} />
        <h2 style={styles.cardTitle}>Food Delivery Registration</h2>
      </div>

      <RetrieveRegistration 
        onRetrieve={handleRetrieveRegistration} 
        isVisible={showRetrieve} 
        onToggle={() => setShowRetrieve(!showRetrieve)} 
        windowWidth={windowWidth} 
      />

      <div style={styles.progressBar}>
        <div style={styles.progressText}>
          <span>Minimum 3 paid users required</span>
          <span>{todayUsers.filter(u => u.commitmentPaid).length}/{Math.max(3, todayUsers.filter(u => u.commitmentPaid).length)}</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{
            ...styles.progressFill,
            width: `${Math.min((todayUsers.filter(u => u.commitmentPaid).length / Math.max(3, todayUsers.filter(u => u.commitmentPaid).length)) * 100, 100)}%`
          }}></div>
        </div>
      </div>

      {userStep === 1 && (
        <div>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#1e293b', 
            fontSize: windowWidth <= 480 ? '16px' : '18px' 
          }}>
            Step 1: Register
          </h3>
          
          <input 
            type="text" 
            placeholder="Enter your full name (e.g., Bryan Ngu)" 
            value={studentName} 
            onChange={(e) => { 
              setStudentName(e.target.value); 
              validateName(e.target.value); 
            }} 
            style={{ 
              ...styles.input, 
              ...(nameError && styles.inputError) 
            }} 
          />
          {nameError && <p style={styles.errorText}>{nameError}</p>}
          
          <input 
            type="text" 
            placeholder="Enter your student ID (e.g., 0469/24)" 
            value={studentId} 
            onChange={(e) => { 
              setStudentId(e.target.value); 
              validateStudentId(e.target.value); 
            }} 
            style={{ 
              ...styles.input, 
              ...(idError && styles.inputError) 
            }} 
          />
          {idError && <p style={styles.errorText}>{idError}</p>}
          
          {rememberedStudent && (
  <div style={{
    backgroundColor: '#f0f9ff',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid #bfdbfe'
  }}>
    <p style={{ margin: '0 0 12px 0', color: '#1e40af', fontWeight: '600' }}>
      Welcome back {rememberedStudent.name}!
    </p>
    <div style={styles.buttonRow}>
      <button 
        onClick={loadFromSession}
        style={{ 
          ...styles.button, 
          ...styles.buttonBlue 
        }}
      >
        Continue Previous Session
      </button>
      <button 
        onClick={() => resetForm(true)}
        style={{ 
          ...styles.button, 
          ...styles.buttonGray 
        }}
      >
        Start Fresh
      </button>
    </div>
  </div>
)}

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

      {userStep === 2 && (
        <div>
          <h3 style={{ 
            marginBottom: '1px', 
            color: '#1e293b',
            fontSize: windowWidth <= 480 ? '16px' : '18px'
          }}>
            Step 2: Pay Base Delivery Fee 
          </h3><p>RM10 base delivery fee applies to the first 3 users but will be waived automatically during order submission.</p>

          <UnifiedQRCodeDisplay 
            isCommitmentFee={true} 
            userIndex={currentUserIndex} 
            registrationOrder={registrationOrder} 
            selectedUserId={selectedUserId} 
          />
          
          <div style={styles.infoCard}>
            <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {studentName}</p>
            <p style={{ margin: '0 0 8px 0' }}><strong>Student ID:</strong> {studentId}</p>
            <p style={{ margin: 0 }}>
              <strong>Base Delivery Fee:</strong> {
                currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4) 
                  ? 'FREE (4th+ user!)' 
                  : 'RM10'
              }
            </p>
          </div>
          
          {!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && (
            <>
              <p style={{ marginBottom: '16px', color: '#64748b' }}>
                Upload proof of payment (RM10 base delivery fee):
              </p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setReceiptFile(e.target.files[0])} 
                style={styles.input} 
              />
              {receiptFile && (
                <div style={styles.imagePreview}>
                  <img 
                    src={URL.createObjectURL(receiptFile)} 
                    alt="Payment Receipt" 
                    style={styles.previewImage}
                    onClick={() => setSelectedImage(receiptFile)}
                  />
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    Click image to enlarge
                  </p>
                </div>
              )}
            </>
          )}
          
          <div style={styles.buttonRow}>
            <button 
              onClick={handleCommitmentPayment} 
              disabled={!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && !receiptFile}
              style={{ 
                ...styles.button, 
                ...styles.buttonBlue,
                opacity: (!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && !receiptFile) ? 0.5 : 1,
                cursor: (!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && !receiptFile) ? 'not-allowed' : 'pointer'
              }}
            >
              {(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) 
                ? 'Continue (Free)' 
                : 'Submit Payment'
              }
            </button>
            <button 
              onClick={() => { 
                setUserStep(1); 
                setSelectedUserId(''); 
                setReceiptFile(null); 
              }} 
              style={{ 
                ...styles.button, 
                ...styles.buttonGray
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {userStep === 3 && minOrderReached && (
        <div>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#1e293b', 
            fontSize: windowWidth <= 480 ? '18px' : '20px' 
          }}>
            Step 3: Submit Your Order
          </h3>
          
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '24px', 
            border: '1px solid #86efac', 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle color="#16a34a" size={24} />
            Payment confirmed! You can now submit your order.
          </div>

          <div style={styles.sectionCard}>
            <h4 style={styles.sectionHeader}>
              <span style={styles.stepNumber}>1</span>
              Order Details
            </h4>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Order Number (Enter the first five letters of order number — for driver’s convenience) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter order number" 
              value={orderNumber} 
              onChange={(e) => { 
                setOrderNumber(e.target.value); 
                setOrderError(''); 
              }} 
              style={{ 
                ...styles.input, 
                ...(orderError && !orderNumber && styles.inputError),
                backgroundColor: orderNumber ? '#f0fdf4' : '#fff' 
              }} 
            />
            <label style={{ display: 'block', marginBottom: '8px', marginTop: '16px', color: '#374151', fontWeight: '500' }}>
              Order Total (RM) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
  type="number"
  step="0.01"
  min="0.01"
  placeholder="Enter order total amount (e.g., 15.50)"
  value={orderTotal}
  onChange={(e) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (value === '' || (parseFloat(value) > 0 && !isNaN(parseFloat(value)))) {
      setOrderTotal(value);
      setOrderError('');
    }
  }}
  onKeyDown={(e) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
    // Prevent negative sign, e, E, +
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  }}
  onPaste={(e) => {
    // Handle paste event to only allow numbers
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (/^\d*\.?\d*$/.test(paste) && parseFloat(paste) > 0) {
      setOrderTotal(paste);
      setOrderError('');
    }
  }}
  style={{
    ...styles.input,
    ...(orderError && (!orderTotal || parseFloat(orderTotal) <= 0) && styles.inputError),
    backgroundColor: (orderTotal && parseFloat(orderTotal) > 0) ? '#f0fdf4' : '#fff'
  }}
/>
            {orderError && <p style={styles.errorText}>{orderError}</p>}
            <label style={{ display: 'block', marginBottom: '8px', marginTop: '16px', color: '#374151', fontWeight: '500' }}>
  Upload Order Receipt (Must be clear and complete!)<span style={{ color: '#ef4444' }}>*</span>
</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setOrderReceiptFile(e.target.files[0])}
              style={styles.input}
            />
            {!orderReceiptFile && orderError === 'missingFile' && (
  <p style={styles.errorText}>Please upload your order receipt.</p>
)}

            {orderReceiptFile && (
              <div style={styles.imagePreview}>
                <img
                  src={URL.createObjectURL(orderReceiptFile)}
                  alt="Order Receipt"
                  style={styles.previewImage}
                  onClick={() => setSelectedImage(orderReceiptFile)}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                  Click image to enlarge
                </p>
              </div>
            )}
          </div>

          <FeeBreakdown 
            orderTotal={parseFloat(orderTotal) || 0} 
            userIndex={currentUserIndex} 
            isCommitmentFeePaid={prebookUsers.find(u => u.firestoreId === selectedUserId)?.commitmentPaid} 
            registrationOrder={registrationOrder} 
            selectedUserId={selectedUserId} 
          />
          
          {(() => {
            
            
            if (actualDeliveryFee > 0) {
              return (
                <div style={styles.sectionCard}>
                  <h4 style={styles.sectionHeader}>Delivery Fee Payment</h4>
                  <UnifiedQRCodeDisplay amount={actualDeliveryFee} />
                  <p style={{ marginTop: '16px', marginBottom: '12px', color: '#64748b' }}>
                    Please upload proof of payment for the delivery fee: <span style={{ color: '#ef4444' }}>*</span>
                  </p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setPaymentProof(e.target.files[0])} 
                    style={styles.input} 
                  />
                  {paymentProof && (
                    <div style={styles.imagePreview}>
                      <img 
                        src={URL.createObjectURL(paymentProof)} 
                        alt="Payment Proof" 
                        style={styles.previewImage}
                        onClick={() => setSelectedImage(paymentProof)}
                      />
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
          
          <button 
  onClick={handleOrderSubmission} 
  disabled={isSubmitDisabled}
  style={{ 
    ...styles.button, 
    ...styles.buttonOrange, 
    opacity: isSubmitDisabled ? 0.5 : 1, 
    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer' 
  }}
>
  Submit Order
</button>


        </div>
      )}

      {userStep === 3 && !minOrderReached && (
        <div>
          <BeautifulMessage 
            type="success" 
            title="Payment Confirmed!" 
            message="Thank you for your base delivery fee. Your payment has been successfully processed." 
            icon={<CheckCircle />} 
          />
          <BeautifulMessage 
            type="warning" 
            title="Waiting for More Orders" 
            message={`We need at least 3 paid users before order submission opens. Current progress: ${todayUsers.filter(u => u.commitmentPaid).length}/3 users`} 
            icon={<AlertCircle />}
          >
            <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
              You'll be able to submit your order once we reach the minimum requirement. Please check back later!
            </p>
          </BeautifulMessage>
          <button 
            onClick={resetForm} 
            style={{ 
              ...styles.button, 
              ...styles.buttonGray,
              marginTop: '16px'
            }}
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentTab;