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
  systemAvailability,
}) => {
  const [userStep, setUserStep] = useState(() => {
  // ✅ Initialize with session step if available
  return rememberedStudent?.sessionStep || 1;
});
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null); // Commitment fee receipt
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState('');
  const [paymentProof, setPaymentProof] = useState(null); // Delivery fee proof
  const [orderReceiptFiles, setOrderReceiptFiles] = useState([]); // Multiple order receipts
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [nameError, setNameError] = useState('');
  const [idError, setIdError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isCurrentUserEligible, setIsCurrentUserEligible] = useState(false);

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
    imagePreview: {
      marginBottom: '16px',
      textAlign: 'center', // Helps center the image and text
    },
    previewImage: {
      maxWidth: '100%',
      maxHeight: '200px',   // This controls the maximum height
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      objectFit: 'contain', // Shows the whole image without stretching
      cursor: 'pointer',
      backgroundColor: '#f8fafc', // A light background for images with transparency
      transition: 'transform 0.2s ease',
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

  // ADD THESE TWO FUNCTIONS
const handleAddReceipt = (event) => {
  if (event.target.files && event.target.files[0]) {
    const newFile = event.target.files[0];
    setOrderReceiptFiles(prevFiles => [...prevFiles, newFile]);
    event.target.value = null; // Important: allows re-adding the same file if removed
  }
};

const handleRemoveReceipt = (indexToRemove) => {
  setOrderReceiptFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
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
  if (!systemAvailability.isSystemOpen) {
    showSuccessAnimation(
      'System Closed',
      'The food delivery system is only available on Tuesday and Friday from 12:00 AM to 6:00 PM (Malaysia Time).',
      <div>
        <p style={{ margin: '8px 0', color: '#92400e', fontWeight: '600' }}>
          Next available: {systemAvailability.nextOpenTime}
        </p>
      </div>,
      0,
      true
    );
    return;
  }

  if (!validateName(studentName) || !validateStudentId(studentId)) return;
  
  const existingUser = prebookUsers.find(user => 
    isToday(user.timestamp) && 
    (user.studentId === studentId || user.name.toLowerCase() === studentName.toLowerCase())
  );
  
  if (existingUser) {
    showSuccessAnimation(
      'Registration Already Exists', 
      `This name or Student ID has already been registered today.`, 
      <BeautifulMessage 
        type="error" 
        message="Please try again tomorrow or retrieve your registration." 
        icon={<AlertCircle />} 
      />, 
      3000, 
      true
    );
    return;
  }

  showLoadingAnimation('Registering...');
  
  try {
    const currentPaidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
    const currentUserPosition = prebookUsers.length + 1;

    // ✅ FIX: Eligibility is NOT decided here.
    const newUser = {
      name: studentName,
      studentId,
      timestamp: new Date().toISOString(),
      commitmentPaid: false,
      orderSubmitted: false,
      registrationOrder: currentUserPosition,
      hasOrdered: false,
      orderTotal: 0,
      // The `eligibleForDeduction` field is removed from this object.
    };

    const nextStep = currentPaidUsersCount >= 3 ? 3 : 2;
    const newUserId = await firebaseService.savePrebookUser(newUser);
    
    updateSession(nextStep, { name: studentName, studentId, firestoreId: newUserId });
    
    setSelectedUserId(newUserId);
    await fetchAllData();
    hideLoadingAnimation();
    setUserStep(nextStep);

    const message = currentPaidUsersCount >= 3
      ? 'System is already activated! You can submit your order directly.'
      : 'Please proceed to pay the RM10 base delivery fee to help activate the system.';

    showSuccessAnimation(
      'Registration Successful!', 
      message,
      null,
      3000,
      true
    );

  } catch (error) {
    hideLoadingAnimation();
    alert('Error registering user. Please try again.');
    console.error('Registration error:', error);
  }
};

const handleCommitmentPayment = async () => {
  if (!receiptFile) {
    showSuccessAnimation('Missing Receipt', 'Please upload a payment receipt.', null, 3000, true);
    return;
  }

  showLoadingAnimation('Uploading receipt...');

  try {
    if (!(receiptFile instanceof File)) {
      throw new Error('Invalid receipt file: Please select a valid image');
    }
    const receiptURL = await firebaseService.uploadFileToStorage(receiptFile);

    // 1. Determine eligibility based on the data we have right now.
    const currentPaidCount = prebookUsers.filter(u => u.commitmentPaid).length;
    const isEligibleForDeduction = currentPaidCount < 3;

    // 2. ✅ SET OUR LOCAL STATE IMMEDIATELY. This is the key to the fix.
    setIsCurrentUserEligible(isEligibleForDeduction);

    // 3. Update the database as the permanent source of truth.
    await firebaseService.updatePrebookUser(selectedUserId, {
      commitmentPaid: true,
      receiptURL,
      receiptUploadTime: new Date().toISOString(),
      eligibleForDeduction: isEligibleForDeduction,
    });

    // 4. Update the session and navigate.
    updateSession(3, { name: studentName, studentId, firestoreId: selectedUserId });
    
    // We can now remove the complex data fetching from here.
    // The local state has already solved the UI problem.
    await fetchAllData(); // Still good to refresh data for other parts of the app.
    hideLoadingAnimation();

    const newPaidCount = currentPaidCount + 1;
    if (newPaidCount >= 3) {
      showSuccessAnimation(
        'Payment Confirmed!',
        'You can now submit your order!',
        null, 2500, true,
        () => setUserStep(3) // Simple navigation is fine now.
      );
    } else {
      const remaining = 3 - newPaidCount;
      showSuccessAnimation(
        'Payment Confirmed!',
        'Your payment has been received.',
        <p>We need {remaining} more paid user{remaining > 1 ? 's' : ''} to activate.</p>,
        0, true,
        () => setUserStep(3)
      );
    }
  } catch (error) {
    hideLoadingAnimation();
    showSuccessAnimation('Upload Failed', `Error: ${error.message}`, null, 3000, true);
    console.error('Payment error:', error);
  }
};

  const handleOrderSubmission = async () => {
  if (orderReceiptFiles.length === 0) {
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

// Use the eligibleForDeduction flag set during payment
const commitmentFeeDeducted = (user?.eligibleForDeduction && deliveryFee > 0) ? 10 : 0;

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

    const uploadPromises = orderReceiptFiles.map(file => {
      if (!(file instanceof File)) {
        throw new Error('Invalid order receipt file found.');
      }
      return firebaseService.uploadFileToStorage(file);
    });
    const orderImageURLs = await Promise.all(uploadPromises);

    const orderData = {
      userId: selectedUserId,
      userName: studentName,
      studentId,
      orderTotal: totalAmount,
      originalDeliveryFee: deliveryFee,
      deliveryFee: actualDeliveryFee,
      commitmentFeeDeducted,
      totalWithDelivery: totalAmount + actualDeliveryFee,
      orderImageURLs,
      paymentProofURL,
      orderNumber: orderNumber.trim(),
      status: 'pending',
      userPosition: currentUserIndex + 1,
      wasFourthUser: currentUserIndex >= 3,
      timestamp: new Date().toISOString(),
      vendor: selectedVendor,
    };

    const orderId = await firebaseService.saveOrder(orderData);
    const completeOrder = { ...orderData, orderId };

    await firebaseService.updatePrebookUser(selectedUserId, {
      orderTotal: orderData.orderTotal,
      orderSubmitted: true,
      hasOrdered: true,
      lastOrderDate: new Date().toISOString(),
    });

    hideLoadingAnimation();

    // ✅ FIX: Update session to 'order_submitted' state (awaiting email)
    updateSession('order_submitted', { name: studentName, studentId, firestoreId: selectedUserId });
    localStorage.setItem('pendingOrderDetails', JSON.stringify(completeOrder));

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
        setCurrentOrder(completeOrder);
        
        // ✅ CRITICAL: Don't call setOrderConfirmed(true) here
        // Wait until email is submitted in the email modal
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
    if (!systemAvailability.isSystemOpen) {
    showSuccessAnimation(
      'System Closed',
      'The food delivery system is only available on Tuesday and Friday from 12:00 AM to 6:00 PM (Malaysia Time).',
      <div>
        <p style={{ margin: '8px 0', color: '#92400e', fontWeight: '600' }}>
          Next available: {systemAvailability.nextOpenTime}
        </p>
      </div>,
      0, // Don't auto-close
      true
    );
    return;
  }

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

  setStudentName(foundUser.name);
  setStudentId(foundUser.studentId);
  setSelectedUserId(foundUser.firestoreId);
  setShowRetrieve(false);

  setIsCurrentUserEligible(foundUser.eligibleForDeduction || false);

  // ✅ NEW LOGIC: Check current system state for navigation
  const currentPaidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
  const systemIsActive = currentPaidUsersCount >= 3;

  if (foundUser.commitmentPaid) {
  // User has paid - always go to step 3
  updateSession(3, { name: foundUser.name, studentId: foundUser.studentId, firestoreId: foundUser.firestoreId });
  setUserStep(3);
  showSuccessAnimation(
    `Welcome back, ${foundUser.name}!`,
    'You can now submit your order.',
    null,
    2500,
    true
  );
} else {
  // User hasn't paid - check if system is already active
  if (systemIsActive) {
    // ✅ FIX: System is active, user can skip payment and go to step 3
    // Their eligibleForDeduction flag remains what it was set during registration
    updateSession(3, { name: foundUser.name, studentId: foundUser.studentId, firestoreId: foundUser.firestoreId });
    setUserStep(3);
    
    const deductionMessage = foundUser.eligibleForDeduction 
      ? 'You will get RM10 deduction on delivery fee!'
      : 'No RM10 deduction (you were not among the first 3 to register).';
    
    showSuccessAnimation(
      `Welcome back, ${foundUser.name}!`,
      `System is already active! You can submit your order directly. ${deductionMessage}`,
      null,
      4000,
      true
    );
  } else {
    // System not active, user needs to pay - go to step 2
    updateSession(2, { name: foundUser.name, studentId: foundUser.studentId, firestoreId: foundUser.firestoreId });
    setUserStep(2);
    showSuccessAnimation(
      `Welcome back, ${foundUser.name}!`,
      'Please complete your base delivery fee payment to continue.',
      <p>We still need {3 - currentPaidUsersCount} more paid users to activate the system.</p>,
      5000,
      true
    );
  }
}
};

const updateSession = (step, studentData) => {
  const todayKey = new Date().toLocaleDateString('en-CA');
  const sessionData = {
    vendor: selectedVendor,
    step: step, // Can now be: 1, 2, 3, 'order_submitted', or 'completed'
    student: {
      name: studentData.name,
      studentId: studentData.studentId,
      firestoreId: studentData.firestoreId
    },
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(`userSession-${todayKey}`, JSON.stringify(sessionData));
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
      
      // ✅ FIX: Get the saved session step and set it IMMEDIATELY
      const todayKey = new Date().toLocaleDateString('en-CA');
      const sessionJSON = localStorage.getItem(`userSession-${todayKey}`);
      
      if (sessionJSON) {
        try {
          const sessionData = JSON.parse(sessionJSON);
          if (typeof sessionData.step === 'number') {
            // ✅ Set step immediately without animation
            setUserStep(sessionData.step);
            return; // Exit early to prevent success animation
          }
        } catch (e) {
          console.error('Error parsing session data in loadFromSession:', e);
        }
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
  setOrderReceiptFiles([]);
  setCurrentUserIndex(0);
  setNameError('');
  setIdError('');
  setOrderError('');
  
  // ADD THIS: Clear session if requested
  if (clearSession) {
    clearStudentSession();
  }
}, []);

useEffect(() => {
  if (rememberedStudent && !selectedUserId && prebookUsers.length > 0) {
    const foundUser = prebookUsers.find(u => u.firestoreId === rememberedStudent.firestoreId);
    if (foundUser) {
      // ✅ Set all data immediately
      setStudentName(rememberedStudent.name);
      setStudentId(rememberedStudent.studentId);
      setSelectedUserId(rememberedStudent.firestoreId);
      
      const userOrder = registrationOrder.find(order => order.userId === foundUser.firestoreId);
      const userIndex = userOrder ? userOrder.order - 1 : prebookUsers.findIndex(u => u.firestoreId === foundUser.firestoreId);
      setCurrentUserIndex(userIndex);
      
      // ✅ Set the step from session data immediately
      if (rememberedStudent.sessionStep) {
        setUserStep(rememberedStudent.sessionStep);
      }
    }
  }
}, [rememberedStudent, prebookUsers, registrationOrder]);

useEffect(() => {
  setResetStudentForm(() => resetForm);
}, [resetForm, setResetStudentForm]);

useEffect(() => {
    // This effect runs whenever the user's step changes.
    // When the user first lands on the order submission step (Step 3),
    // we force a final data refresh. This guarantees that their
    // eligibility status, which was just set during payment, is up-to-date.
    if (userStep === 3) {
      console.log("Entering Step 3, ensuring data is fresh...");
      fetchAllData();
    }
  }, [userStep, fetchAllData]); // Re-run this effect only when userStep changes.

  const parsedOrderTotal = parseFloat(orderTotal) || 0;
const deliveryFee = calculateDeliveryFee(parsedOrderTotal);
const commitmentFeeDeducted = (isCurrentUserEligible && deliveryFee > 0) ? 10 : 0;

const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

const isSubmitDisabled =
  !orderNumber.trim() ||
  !orderTotal ||
  isNaN(orderTotal) ||
  Number(orderTotal) <= 0 ||
  orderReceiptFiles.length === 0 ||
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
  <span>Minimum 3 official users required</span>
  <span>{prebookUsers.filter(u => u.commitmentPaid).length}/3</span>
</div>
        <div style={styles.progressTrack}>
          <div style={{
  ...styles.progressFill,
  width: `${Math.min((prebookUsers.filter(u => u.commitmentPaid).length / 3) * 100, 100)}%`
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
    </h3>
    <p>RM10 base delivery fee applies to the first 3 users but will be waived automatically during order submission. (Please check back before 6pm!!)</p>

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
        <strong>Base Delivery Fee:</strong> RM10
      </p>
    </div>
    
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
    
    <div style={styles.buttonRow}>
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
            Step 3: Submit Your Order (Please submit before 6pm)
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
  Upload Order Receipt(s) (At least one required)<span style={{ color: '#ef4444' }}>*</span>
</label>

<div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
  {orderReceiptFiles.map((file, index) => (
    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
      <span style={{ fontSize: '14px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {file.name}
      </span>
      <button 
        type="button" 
        onClick={() => handleRemoveReceipt(index)} 
        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Remove
      </button>
    </div>
  ))}
</div>

{/* START: ADD THIS RESPONSIVE PREVIEW GRID */}
{orderReceiptFiles.length > 0 && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  }}>
    {orderReceiptFiles.map((file, index) => (
      <div key={index} style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #e2e8f0'
      }}>
        <img
          src={URL.createObjectURL(file)}
          alt={`Receipt preview ${index + 1}`}
          onClick={() => setSelectedImage(file)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    ))}
  </div>
)}
{/* END: ADD THIS RESPONSIVE PREVIEW GRID */}

<input
  type="file"
  accept="image/*"
  onChange={handleAddReceipt}
  style={{ display: 'none' }}
  id="receipt-upload-input"
/>
<label htmlFor="receipt-upload-input" style={{ ...styles.button, ...styles.buttonBlue, display: 'inline-block', width: 'auto', textAlign: 'center', marginBottom: '16px' }}>
  Add Receipt
</label>

{orderReceiptFiles.length === 0 && orderError === 'missingFile' && (
  <p style={styles.errorText}>Please upload at least one order receipt.</p>
)}
          </div>

<FeeBreakdown 
  orderTotal={parseFloat(orderTotal) || 0}
  // ✅ Pass the reliable local state directly to the component
  isEligibleForDeduction={isCurrentUserEligible}
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