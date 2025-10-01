import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle, AlertCircle, PlayCircle, X, Film, Loader2 } from 'lucide-react';
import * as firebaseService from '../services/firebase';
import { calculateDeliveryFee } from '../utils/calculateDeliveryFee';
import { isToday } from '../utils/isToday';
import RetrieveRegistration from './RetrieveRegistration';
import BeautifulMessage from './BeautifulMessage';
import FeeBreakdown from './FeeBreakdown';
import UnifiedQRCodeDisplay from './UnifiedQRCodeDisplay';
import CountdownTimer from './CountdownTimer';
import LoadingAnimation from './LoadingAnimation';

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
  isCurrentUserEligible,        // ← ADD THIS LINE
  setIsCurrentUserEligible,
  setSelectedVendor,
}) => {
  const [userStep, setUserStep] = useState(() => {
  // ✅ Initialize with session step if available
  return rememberedStudent?.sessionStep || 1;
});
  const [studentName, setStudentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null); // Commitment fee receipt
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState('');
  const [paymentProof, setPaymentProof] = useState(null); // Delivery fee proof
  const [orderReceiptFiles, setOrderReceiptFiles] = useState([]); // Multiple order receipts
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [nameError, setNameError] = useState('');
  const [contactError, setContactError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
   const [isLoading, setIsLoading] = useState(false); // Add local loading state
  const [loadingMessage, setLoadingMessage] = useState(''); 


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
    banner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: windowWidth <= 480 ? '8px' : '12px', // Tighter gap on mobile
      padding: windowWidth <= 480 ? '10px 12px' : '12px 20px', // Tighter padding on mobile
      backgroundColor: '#eef2ff',
      color: '#4338ca',
      borderRadius: '16px',
      marginBottom: '24px',
      border: '1px solid #c7d2fe',
    },
    bannerText: {
      fontWeight: '500',
      // Dynamically shrink font size for smaller screens
      fontSize: windowWidth <= 390 ? '12px' : windowWidth <= 480 ? '13px' : '15px',
      whiteSpace: 'nowrap', // This is the key to keeping it on one line
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      flex: '1 1 auto', // Allow it to take up available space
    },
    bannerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0, // Prevent buttons from shrinking
    },
    bannerButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      // Dynamically shrink padding for smaller screens
      padding: windowWidth <= 480 ? '6px 10px' : '8px 16px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '600',
      // Dynamically shrink font size for smaller screens
      fontSize: windowWidth <= 480 ? '12px' : '14px',
      transition: 'background-color 0.2s ease',
    },
    videoContainer: {
      maxHeight: isVideoVisible ? '500px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.5s ease-in-out, margin-bottom 0.5s ease-in-out',
      marginBottom: isVideoVisible ? '24px' : '0',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px', // Add padding to ensure content never touches screen edges
    },
    modalContent: {
      position: 'relative',
      background: 'transparent', // The container itself is now transparent
      width: '100%',
      maxWidth: '1200px', // Set a max width for large screens
      maxHeight: '100%', // Ensure it never exceeds the screen height
      display: 'flex',
      flexDirection: 'column', // Stack the button and video
      alignItems: 'flex-end', // Align the close button to the right
      gap: '8px', // Space between close button and video
    },
    closeModalButton: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: '#4f46e5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      flexShrink: 0, // Prevent the button from being squished
    },
    videoWrapper: {
      width: '100%',
      aspectRatio: '16 / 9', // The magic that keeps the video in the correct shape
      backgroundColor: '#000',
      borderRadius: '16px',
      overflow: 'hidden', // Ensures the iframe corners are rounded
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    },
    
  };

  const showLocalLoading = (message) => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  // Replace all hideLoadingAnimation calls with this function
  const hideLocalLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
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

const handleAddReceipt = (event) => {
  // Prevent adding more than 3 files.
  if (orderReceiptFiles.length >= 3) {
    alert("You can only upload a maximum of 3 receipts.");
    return;
  }
  
  if (event.target.files && event.target.files[0]) {
    const newFile = event.target.files[0];
    setOrderReceiptFiles(prevFiles => [...prevFiles, newFile]);
    event.target.value = null; // Important: allows re-adding the same file if removed
  }
};

const handleRemoveReceipt = (indexToRemove) => {
  setOrderReceiptFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
};

  const validateContactNumber = (number) => {
  if (!number.trim()) { 
    setContactError('Contact number is required'); 
    return false; 
  }
  const digits = number.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) { 
    setContactError('Contact number must be 10-11 digits'); 
    return false; 
  }
  setContactError(''); 
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

  const getValidationMessage = () => {
  const missingFields = [];
  
  if (!orderNumber.trim()) {
    missingFields.push('Order Number');
  }
  if (!orderTotal || isNaN(orderTotal) || Number(orderTotal) <= 0) {
    missingFields.push('Order Total');
  }
  if (orderReceiptFiles.length === 0) {
    missingFields.push('Order Receipt(s)');
  }
  if (actualDeliveryFee > 0 && !paymentProof) {
    missingFields.push('Delivery Fee Payment Proof');
  }
  
  if (missingFields.length === 0) return null;
  
  const fieldList = missingFields.length === 1 
    ? missingFields[0]
    : missingFields.slice(0, -1).join(', ') + ' and ' + missingFields[missingFields.length - 1];
  
  return `Please complete: ${fieldList}`;
};

const handlePrebook = async () => {
    if (!systemAvailability.isSystemOpen) {
      showSuccessAnimation(
        'System Closed',
        'The food delivery system is only available on Tuesday and Friday from 12:00 AM to 4:30 PM (Malaysia Time).',
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

    
if (!validateName(studentName) || !validateContactNumber(contactNumber)) return;
    
    const existingUser = prebookUsers.find(user => 
  isToday(user.timestamp) && 
  (user.contactNumber === contactNumber || user.name.toLowerCase() === studentName.toLowerCase())
);
    
    if (existingUser) {
      showSuccessAnimation(
        'Registration Already Exists', 
        `This name or Contact Number has already been registered today.`, 
        <BeautifulMessage 
          type="error" 
          message="Please try again tomorrow or retrieve your registration." 
          icon={<AlertCircle />} 
        />, 
        0, 
        true
      );
      return;
    }

    showLocalLoading('Registering...');
    
    // Use setTimeout to allow the UI to update before Firebase operations
    setTimeout(async () => {
      try {
        const currentPaidUsersCount = todayUsers.filter(u => u.commitmentPaid).length;
        const currentUserPosition = todayUsers.length + 1;

        const newUser = {
          name: studentName,
          contactNumber,
          timestamp: new Date().toISOString(),
          commitmentPaid: false,
          orderSubmitted: false,
          registrationOrder: currentUserPosition,
          hasOrdered: false,
          orderTotal: 0,
          vendor: selectedVendor,
        };

        const nextStep = currentPaidUsersCount >= 3 ? 3 : 2;
        const newUserId = await firebaseService.savePrebookUser(newUser);
        
        updateSession(nextStep, { name: studentName, contactNumber, firestoreId: newUserId }, selectedVendor);
        
        setSelectedUserId(newUserId);
        fetchAllData();
        setUserStep(nextStep);

        hideLocalLoading();

        const message = currentPaidUsersCount >= 3
          ? 'System is already activated! You can submit your order directly.'
          : 'Please proceed to pay the RM10 base delivery fee to activate the system.';

        showSuccessAnimation(
          'Registration Successful!', 
          message,
          null,
          0,
          true
        );

      } catch (error) {
        hideLocalLoading();
        alert('Error registering user. Please try again.');
        console.error('Registration error:', error);
      }
    }, 50); // Small delay to allow UI to update
  };

const handleCommitmentPayment = async () => {
    if (!receiptFile) {
      showSuccessAnimation('Missing Receipt', 'Please upload a payment receipt.', null, 0, true);
      return;
    }

    showLocalLoading('Uploading receipt...');

    // Use setTimeout to allow UI to update
    setTimeout(async () => {
      try {
        if (!(receiptFile instanceof File)) {
          throw new Error('Invalid receipt file: Please select a valid image');
        }
        const receiptURL = await firebaseService.uploadFileToStorage(receiptFile);

        const currentPaidCount = todayUsers.filter(u => u.commitmentPaid).length;
        const isEligibleForDeduction = currentPaidCount < 3;

        setIsCurrentUserEligible(isEligibleForDeduction);

        await firebaseService.updatePrebookUser(selectedUserId, {
          commitmentPaid: true,
          receiptURL,
          receiptUploadTime: new Date().toISOString(),
          eligibleForDeduction: isEligibleForDeduction,
        });

        updateSession(3, { name: studentName, contactNumber, firestoreId: selectedUserId }, selectedVendor);
        
        fetchAllData();
        hideLocalLoading();

        const newPaidCount = currentPaidCount + 1;
        if (newPaidCount >= 3) {
          showSuccessAnimation(
            'Payment Confirmed!',
            'You can now submit your order!',
            null, 0, true,
            () => setUserStep(3)
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
        hideLocalLoading();
        showSuccessAnimation('Upload Failed', `Error: ${error.message}`, null, 0, true);
        console.error('Payment error:', error);
      }
    }, 50);
  };

  const handleOrderSubmission = async () => {
  // Use local variable to get the current selectedUserId value with better fallback logic
  let currentSelectedUserId = selectedUserId;
  
  // If selectedUserId is empty but we have remembered student data, use that
  if ((!currentSelectedUserId || currentSelectedUserId.trim() === '') && rememberedStudent?.firestoreId) {
    currentSelectedUserId = rememberedStudent.firestoreId;
    // Update the state with the recovered ID
    setSelectedUserId(currentSelectedUserId);
  }
  
  console.log('handleOrderSubmission called with:', {
    selectedUserId,
    rememberedStudent: rememberedStudent ? rememberedStudent.firestoreId : 'none',
    currentSelectedUserId
  });

  if (!currentSelectedUserId || typeof currentSelectedUserId !== 'string' || currentSelectedUserId.trim() === '') {
    console.error('No valid selectedUserId found');
    showSuccessAnimation(
      'Session Error',
      'Your session data is invalid. Please retrieve your registration again.',
      null,
      0,
      true
    );
    return;
  }

  // Use the currentSelectedUserId for all operations
  if (orderReceiptFiles.length === 0) {
    setOrderError('missingFile');
    return;
  }

  if (!validateOrderDetails()) {
    showSuccessAnimation(
      'Missing Fields',
      orderError,
      null,
      0,
      true
    );
    return;
  }

  const totalAmount = parseFloat(orderTotal);
  const deliveryFee = calculateDeliveryFee(totalAmount);
  const user = prebookUsers.find(u => u.firestoreId === currentSelectedUserId);

  const commitmentFeeDeducted = (user?.eligibleForDeduction && deliveryFee > 0) ? 10 : 0;
  const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

  if (actualDeliveryFee > 0 && !paymentProof) {
    showSuccessAnimation(
      'Payment Receipt Required',
      'Please upload your payment receipt for the delivery fee.',
      null,
      0,
      true
    );
    return;
  }

  showLocalLoading('Processing order...');

  // Save form state with the reliable ID
  localStorage.setItem(`formState-${currentSelectedUserId}`, JSON.stringify({
    orderNumber: orderNumber.trim(),
    orderTotal: totalAmount
  }));

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
      userId: currentSelectedUserId, // Use the reliable ID
      userName: studentName,
      contactNumber,
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

    await firebaseService.updatePrebookUser(currentSelectedUserId, {
      orderTotal: orderData.orderTotal,
      orderSubmitted: true,
      hasOrdered: true,
      lastOrderDate: new Date().toISOString(),
    });

    hideLocalLoading();

    updateSession('order_submitted', { name: studentName, contactNumber, firestoreId: currentSelectedUserId }, selectedVendor);
    localStorage.setItem('pendingOrderDetails', JSON.stringify(completeOrder));
    localStorage.removeItem(`formState-${currentSelectedUserId}`);

    showSuccessAnimation(
      'Order Submitted!',
      'Please provide your email to receive order updates.',
      null,
      0,
      true,
      () => {
        setUserForEmail({ firestoreId: currentSelectedUserId, name: studentName });
        setShowEmailModal(true);
        setCurrentOrder(completeOrder);
      }
    );
  } catch (error) {
    hideLocalLoading();
    showSuccessAnimation(
      'Order Submission Failed',
      `Failed to submit order: ${error.message}`,
      null,
      0,
      true
    );
    console.error('Order submission error:', error);
  }
};


  const handleRetrieveRegistration = async (name, retrievedContact) => {
  if (!systemAvailability.isSystemOpen) {
    showSuccessAnimation(
      'System Closed',
      'The food delivery system is only available on Tuesday and Friday from 12:00 AM to 4:30 PM (Malaysia Time).',
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

  const foundUser = prebookUsers.find(user =>
    user.name?.toLowerCase() === name.toLowerCase() &&
    user.contactNumber === retrievedContact &&
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

  setStudentName(foundUser.name);
  setContactNumber(foundUser.contactNumber);
  setSelectedUserId(foundUser.firestoreId); // This is the most critical line to fix the error
  setIsCurrentUserEligible(foundUser.eligibleForDeduction || false);
  // CRITICAL: Set the vendor FIRST before any other operations
  if (foundUser.vendor) {
    setSelectedVendor(foundUser.vendor);
  }

  // This part of your logic for already COMPLETED orders is good and remains.
  if (foundUser.orderSubmitted && isToday(foundUser.lastOrderDate)) {
    showLocalLoading('Retrieving your order...');
    try {
      // Note: You might consider using getTodaysOrderByUserId here too for consistency
      const order = await firebaseService.getTodaysOrderByUserId(foundUser.firestoreId);
      if (order) {
        setShowRetrieve(false);
        setCurrentOrder(order);
        setOrderConfirmed(true);
        hideLocalLoading();
        return;
      } else {
        // This case handles data inconsistency, which is good to have.
        hideLocalLoading();
        showSuccessAnimation(
          "Order Not Found",
          `No order details found for ${foundUser.name}.`,
          <BeautifulMessage
            type="info"
            title="Order Issue"
            message="Please contact support if you believe this is an error."
            icon={<AlertCircle />}
          />,
          0,
          true
        );
        return;
      }
    } catch (error) {
      console.error('Error retrieving order:', error);
      hideLocalLoading();
      showSuccessAnimation(
        "Error", `Failed to retrieve order: ${error.message}`, null, 0, true
      );
      return;
    }
  }

  const usersFromRegistrationDay = prebookUsers.filter(u =>
    new Date(u.timestamp).toLocaleDateString() === new Date(foundUser.timestamp).toLocaleDateString()
  );
  const paidUsersOnRegistrationDay = usersFromRegistrationDay.filter(u => u.commitmentPaid).length;
  const wasSystemActiveOnRegistrationDay = paidUsersOnRegistrationDay >= 3;

  if (foundUser.commitmentPaid) {
  showLocalLoading("Verifying your order status...");

  setTimeout(async () => {
    try {
      const existingOrder = await firebaseService.getTodaysOrderByUserId(foundUser.firestoreId);

      if (existingOrder) {
        // Order exists - advance to email prompt
        console.log("Found existing order during retrieval. Advancing to email prompt.");
        updateSession('order_submitted', { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
        localStorage.setItem('pendingOrderDetails', JSON.stringify(existingOrder));
        setUserForEmail({ firestoreId: foundUser.firestoreId, name: foundUser.name });
        setShowEmailModal(true);
        setCurrentOrder(existingOrder);
      } else {
        // No order found - go to order form with message about previous attempt
        console.log("No existing order found during retrieval. User may have been interrupted.");
        updateSession(3, { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
        setUserStep(3);
        
        // Check if there's saved form data indicating a previous attempt
        const savedFormStateJSON = localStorage.getItem(`formState-${foundUser.firestoreId}`);
        if (savedFormStateJSON) {
          const savedFormState = JSON.parse(savedFormStateJSON);
          setOrderNumber(savedFormState.orderNumber || '');
          setOrderTotal(savedFormState.orderTotal || '');
          
          showSuccessAnimation(
            `Welcome back, ${foundUser.name}!`, 
            'It looks like your previous order submission was interrupted. Please re-enter your order details.', 
            <BeautifulMessage 
              type="warning" 
              message="Your previous order was not completed. Please fill in the form again." 
              icon={<AlertCircle />} 
            />, 
            0, 
            true
          );
        } else {
          const deductionMessage = foundUser.eligibleForDeduction ? 'You will get RM10 deduction on delivery fee!' : 'No RM10 deduction applies.';
          showSuccessAnimation(`Welcome back, ${foundUser.name}!`, `System is active! You can submit your order directly. ${deductionMessage}`, null, 0, true);
        }
      }
    } catch (error) {
      console.error("Error verifying order during retrieval:", error);
      showSuccessAnimation("Verification Failed", "Could not check your order status. Please try again.", null, 0, true);
    } finally {
      hideLocalLoading();
    }
  }, 50);
} else if (wasSystemActiveOnRegistrationDay) {
    updateSession(3, { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
    setUserStep(3);
    const deductionMessage = foundUser.eligibleForDeduction ? 'You will get RM10 deduction on delivery fee!' : 'No RM10 deduction applies.';
    showSuccessAnimation(`Welcome back, ${foundUser.name}!`, `System is active! You can submit your order directly. ${deductionMessage}`, null, 0, true);
  } else {
    const currentPaidUsersCount = todayUsers.filter(u => u.commitmentPaid).length;
    updateSession(2, { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
    setUserStep(2);
    showSuccessAnimation(`Welcome back, ${foundUser.name}!`, 'Please complete your base delivery fee payment.', <p>We need {Math.max(0, 3 - currentPaidUsersCount)} more paid users today to activate the system.</p>, 0, true);
  }
}; 


const updateSession = (step, studentData, vendor) => {
  const todayKey = new Date().toLocaleDateString('en-CA');
  const sessionData = {
    vendor: vendor,
    step: step,
    student: {
      name: studentData.name,
      contactNumber: studentData.contactNumber,
      firestoreId: studentData.firestoreId
    },
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(`userSession-${todayKey}`, JSON.stringify(sessionData));
};

const clearStudentSession = useCallback(() => {
  localStorage.removeItem('rememberedStudent');
  setRememberedStudent(null);
}, [setRememberedStudent]);

// 2. Define this second, as it depends on clearStudentSession.
const resetForm = useCallback((clearSession = false) => {
  setUserStep(1);
  setStudentName('');
  setContactNumber('');
  setSelectedUserId('');
  setReceiptFile(null);
  setOrderNumber('');
  setOrderTotal('');
  setPaymentProof(null);
  setOrderReceiptFiles([]);
  setCurrentUserIndex(0);
  setNameError('');
  setOrderError('');
  setIsCurrentUserEligible(false);
  setContactError('');
  
  if (selectedUserId) {
    localStorage.removeItem(`formState-${selectedUserId}`);
  }

  if (clearSession) {
    clearStudentSession();
  }
}, [clearStudentSession, selectedUserId]); // Added selectedUserId to dependencies

const loadFromSession = useCallback(async () => {
  if (!rememberedStudent || prebookUsers.length === 0) {
    return;
  }

  // CRITICAL: Use local variables to avoid state timing issues
  const userFirestoreId = rememberedStudent.firestoreId;
  const userName = rememberedStudent.name;
  const userContactNumber = rememberedStudent.contactNumber;

  // Validate userFirestoreId before proceeding
  if (!userFirestoreId || typeof userFirestoreId !== 'string' || userFirestoreId.trim() === '') {
    console.error("Session restore failed: firestoreId is missing or invalid from rememberedStudent object.");
    showSuccessAnimation("Session Restore Failed", "Your session data is incomplete. Please start over.", null, 0, true);
    resetForm(true);
    return;
  }

  // Set all state synchronously using the local variables
  setStudentName(userName);
  setContactNumber(userContactNumber);
  setSelectedUserId(userFirestoreId);
  
  const foundUser = prebookUsers.find(u => u.firestoreId === userFirestoreId);
  if (foundUser) {
    setIsCurrentUserEligible(foundUser.eligibleForDeduction || false);
  }

  showLocalLoading("Restoring your session...");
  const sessionStep = rememberedStudent.sessionStep;

  if (sessionStep === 3) {
    try {
      // Use the local variable instead of state
      const existingOrder = await firebaseService.getTodaysOrderByUserId(userFirestoreId);

      if (existingOrder) {
        console.log("Session restore detected existing order. Advancing to email prompt.");
        updateSession('order_submitted', { name: userName, contactNumber: userContactNumber, firestoreId: userFirestoreId }, selectedVendor);
        localStorage.setItem('pendingOrderDetails', JSON.stringify(existingOrder));
        setUserForEmail({ firestoreId: userFirestoreId, name: userName });
        setShowEmailModal(true);
        setCurrentOrder(existingOrder);
      } else {
        console.log("No existing order found. Checking for interrupted submission.");
        const savedFormStateJSON = localStorage.getItem(`formState-${userFirestoreId}`);
        if (savedFormStateJSON) {
          const savedFormState = JSON.parse(savedFormStateJSON);
          setOrderNumber(savedFormState.orderNumber || '');
          setOrderTotal(savedFormState.orderTotal || '');
          
          setTimeout(() => {
            showSuccessAnimation(
              'Submission Interrupted', 
              'Your previous order submission was not completed successfully.', 
              <BeautifulMessage 
                type="warning" 
                message="Please review and re-submit your order details below." 
                icon={<AlertCircle />} 
              />, 
              0, 
              true
            );
          }, 500);
        }
        setUserStep(3);
      }
    } catch (error) {
      console.error("Error verifying order during session restore:", error);
      showSuccessAnimation("Session Restore Failed", "Failed to restore your session. Please retrieve your registration again.", null, 0, true);
      resetForm(true);
    } finally {
      hideLocalLoading();
    }
  } else {
    setUserStep(sessionStep);
    hideLocalLoading();
  }
}, [rememberedStudent, prebookUsers, selectedVendor, showSuccessAnimation, resetForm, hideLocalLoading]);

useEffect(() => {
  setResetStudentForm(() => resetForm);
}, [resetForm, setResetStudentForm]);

useEffect(() => {
  if (rememberedStudent && prebookUsers.length > 0 && (!selectedUserId || selectedUserId.trim() === '')) {
    console.log('Missing or invalid selectedUserId, attempting to restore from session...');
    loadFromSession();
  }
}, [rememberedStudent, prebookUsers, selectedUserId, loadFromSession]);

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
      {/* Add LoadingAnimation component */}
      {isLoading && <LoadingAnimation message={loadingMessage} />}
      <>
        {/* This is the banner that is always visible */}
        <div style={styles.banner}>
          <span style={styles.bannerText}>
            {windowWidth <= 430
              ? "New? Watch our 1-min guide!"
              : "First time here? Watch a 1-min guide to see how it works!"
            }
          </span>
          <div style={styles.bannerActions}>
            <button
              onClick={() => setIsVideoVisible(true)} // This now opens the modal
              style={styles.bannerButton}
            >
              <PlayCircle size={windowWidth <= 480 ? 16 : 18} />
              <span>
                {windowWidth <= 420 ? 'Play' : 'Play Video'}
              </span>
            </button>
          </div>
        </div>

        {/* This is the Video Modal that only appears when isVideoVisible is true */}
        {isVideoVisible && (
          <div style={styles.modalOverlay} onClick={() => setIsVideoVisible(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeModalButton} onClick={() => setIsVideoVisible(false)}>
                <X size={24} />
              </button>
              <div style={styles.videoWrapper}>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/LLSWWeqVEaY?rel=0&cc_load_policy=1&autoplay=1"
                  title="Tutorial Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  // V-- THIS IS THE CRITICAL ATTRIBUTE FOR FULLSCREEN --V
                  allowFullScreen
                  style={{ border: 0 }} // Clean up iframe default border
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </>
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
  <span>{todayUsers.filter(u => u.commitmentPaid).length}/3</span>
</div>
        <div style={styles.progressTrack}>
          <div style={{
  ...styles.progressFill,
  width: `${Math.min((todayUsers.filter(u => u.commitmentPaid).length / 3) * 100, 100)}%`
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
  type="tel" 
  placeholder="Enter your contact number (0123456789)" 
  value={contactNumber} 
  onChange={(e) => { 
    setContactNumber(e.target.value); 
    validateContactNumber(e.target.value); 
  }} 
  style={{ 
    ...styles.input, 
    ...(contactError && styles.inputError) 
  }} 
/>
{contactError && <p style={styles.errorText}>{contactError}</p>}

          <button 
            onClick={handlePrebook} 
            disabled={isProcessing}
            style={{ 
              ...styles.button, 
              ...styles.buttonGreen,
              ...(isProcessing && { opacity: 0.7, cursor: 'not-allowed' })
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                Registering...
              </>
            ) : (
              'Register for Delivery'
            )}
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
    <p>RM10 base delivery fee applies to the first 3 users but will be waived automatically during order submission. (Please check back before 4:30pm!!)</p>

    <UnifiedQRCodeDisplay 
      isCommitmentFee={true} 
      userIndex={currentUserIndex} 
      registrationOrder={registrationOrder} 
      selectedUserId={selectedUserId} 
    />
    
    <div style={styles.infoCard}>
      <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {studentName}</p>
      <p style={{ margin: '0 0 8px 0' }}><strong>Contact:</strong> {contactNumber}</p>
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
            Step 3: Submit Your Order (Please submit before 4:30pm)
          </h3>
          
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '24px', 
            border: '1px solid #86efac', 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle color="#16a34a" size={24} />
  <span style={{
    fontSize: windowWidth <= 375 ? '13px' : windowWidth <= 480 ? '14px' : '16px',
  }}>
    Payment confirmed! You can now submit your order.
  </span>
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
              maxLength={10}
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
    const [intPart, decimalPart] = value.split('.');

    // Prevent typing more than 4 digits before decimal
    if (intPart && intPart.length > 4) {
      return;
    }
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
            <label style={{ display: 'block', marginBottom: '8px', marginTop: '16px', color: '#374151', fontWeight: '500'}}>
  Upload Order Receipt(s)<span style={{ color: '#ef4444' }}>*</span>
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
  disabled={orderReceiptFiles.length >= 3}
/>
<label 
  htmlFor="receipt-upload-input" 
  style={{ 
    ...styles.button, 
    ...(orderReceiptFiles.length >= 3 ? styles.buttonGray : styles.buttonBlue),
    display: 'inline-block', 
    width: 'auto', 
    textAlign: 'center', 
    marginBottom: '16px',
    ...(orderReceiptFiles.length >= 3 && {
      cursor: 'not-allowed',
      opacity: 0.7
    })
  }}
>
  {orderReceiptFiles.length >= 3 
    ? 'Maximum 3 Receipts' 
    : `Add Receipt (${orderReceiptFiles.length}/3)`
  }
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
                  <UnifiedQRCodeDisplay amount={actualDeliveryFee} />
                  <p style={{ marginTop: '16px', marginBottom: '12px', color: '#64748b', fontSize: windowWidth <= 375 ? '12px' : windowWidth <= 480 ? '13px' : '15px',}}>
                    Upload payment proof for the delivery fee: <span style={{ color: '#ef4444' }}>*</span>
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
          
          {isSubmitDisabled && (
  <BeautifulMessage 
    type="warning" 
    title="Required Fields Missing" 
    message={getValidationMessage()} 
    icon={<AlertCircle />} 
  />
)}

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
  You'll be able to submit your order once we reach the minimum requirement. 
  Please check back later <strong>before 4:30pm!</strong>
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