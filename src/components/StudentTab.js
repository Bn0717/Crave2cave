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
import imageCompression from 'browser-image-compression';
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);


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

const handleAddReceipt = async (event) => { // <--- MAKE THIS ASYNC
  if (orderReceiptFiles.length >= 3) {
    alert("You can only upload a maximum of 3 receipts.");
    return;
  }
  
  if (event.target.files && event.target.files[0]) {
    const originalFile = event.target.files[0];
    const compressedFile = await handleImageCompression(originalFile); // Compress the file
    setOrderReceiptFiles(prevFiles => [...prevFiles, compressedFile]); // Add the compressed file
    event.target.value = null;
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

const handleImageCompression = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      console.log(`Original file size: ${file.size / 1024 / 1024} MB`);
      // 1. Compress the file into a Blob
      const compressedBlob = await imageCompression(file, options);
      console.log(`Compressed file size: ${compressedBlob.size / 1024 / 1024} MB`);

      // 2. THIS IS THE CRITICAL FIX: Convert the Blob back into a File object
      const compressedFileAsFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });

      return compressedFileAsFile; // <-- NOW RETURNS A FILE, NOT A BLOB

    } catch (error) {
      console.error("Image compression failed:", error);
      // Fallback to the original file if compression fails
      return file;
    }
  };

const handlePrebook = async () => {
    if (!systemAvailability.isSystemOpen) {
      showSuccessAnimation(
        'System Closed',
        'The food delivery system is only available on Tuesday and Friday from 12:00 AM to 3:00 PM (Malaysia Time).',
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
    
    // Normalize the current user's input
    const normalizedName = studentName.trim().replace(/\s+/g, ' ').toLowerCase();
    const normalizedContact = contactNumber.replace(/\D/g, ''); // Removes all non-digits

    const targetDeliveryDate = systemAvailability.deliveryDate;

const existingUser = todayUsers.find(user => {
  const dbName = user.name?.trim().replace(/\s+/g, ' ').toLowerCase();
  const dbContact = user.contactNumber?.replace(/\D/g, '');
  
  return user.deliveryDate === targetDeliveryDate && (dbContact === normalizedContact || dbName === normalizedName);
});
    
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
          name: studentName.trim().replace(/\s+/g, ' '), // Save with proper spacing and case
          contactNumber: contactNumber.replace(/\D/g, ''), // Save only digits
          timestamp: new Date().toISOString(),
          commitmentPaid: false,
          orderSubmitted: false,
          registrationOrder: currentUserPosition,
          hasOrdered: false,
          orderTotal: 0,
          deliveryDate: systemAvailability.deliveryDate,
          vendor: null,
        };

        const nextStep = currentPaidUsersCount >= 3 ? 3 : 2;
        const newUserId = await firebaseService.savePrebookUser(newUser);
        
        updateSession(nextStep, { name: studentName, contactNumber, firestoreId: newUserId }, selectedVendor);
        
        setSelectedUserId(newUserId);
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
  if (!systemAvailability.isSystemOpen) {
      showSuccessAnimation(
        'System Closed',
        'The system is currently closed and cannot accept new payments.',
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
  if (!systemAvailability.isSystemOpen) {
      showSuccessAnimation(
        'System Closed',
        'The system is currently closed and cannot accept new order submissions.',
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

    // Use local variable to get the current selectedUserId value with better fallback logic
    let currentSelectedUserId = selectedUserId;

    // If selectedUserId is empty but we have remembered student data, use that
    if ((!currentSelectedUserId || currentSelectedUserId.trim() === '') && rememberedStudent?.firestoreId) {
      currentSelectedUserId = rememberedStudent.firestoreId;
      // Update the state with the recovered ID
      setSelectedUserId(currentSelectedUserId);
    }

    const existingOrder = todayOrders.find(order => order.userId === currentSelectedUserId);
    if (existingOrder) {
      showSuccessAnimation(
        'Order Already Submitted',
        `You have already placed an order today. You cannot submit another order for the same delivery date.`,
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#92400e' }}>
            Your existing order:
          </p>
          <p style={{ margin: 0, color: '#92400e' }}>
            📦 Order #{existingOrder.orderNumber}<br/>
            🏪 {existingOrder.vendor}<br/>
            💰 RM{existingOrder.orderTotal.toFixed(2)}
          </p>
        </div>,
        0,
        true
      );
      return;
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
      if (!(paymentProof instanceof File)) { // <-- CORRECTED LINE
        throw new Error('Invalid payment proof file: Please select a valid image');
      }
      paymentProofURL = await firebaseService.uploadFileToStorage(paymentProof);
    }

    const uploadPromises = orderReceiptFiles.map(file => {
      if (!(file instanceof File)) { // <-- CORRECTED LINE
        throw new Error('Invalid order receipt file found.');
      }
      return firebaseService.uploadFileToStorage(file);
    });

    const orderImageURLs = await Promise.all(uploadPromises);

    if (!selectedVendor || selectedVendor.trim() === '') {
  showSuccessAnimation('Merchant Not Selected', 'Please select a merchant before submitting.', null, 0, true);
  return;
}


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
      deliveryDate: systemAvailability.deliveryDate,
    };

    const orderId = await firebaseService.saveOrder(orderData);
    const completeOrder = { ...orderData, orderId };

    await firebaseService.updatePrebookUser(currentSelectedUserId, {
      orderTotal: orderData.orderTotal,
      orderSubmitted: true,
      hasOrdered: true,
      lastOrderDate: new Date().toISOString(),
      vendor: selectedVendor,
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
    // 1. Normalize the user's input immediately
    const normalizedNameInput = name.trim().replace(/\s+/g, ' ').toLowerCase();
    const normalizedContactInput = retrievedContact.replace(/\D/g, ''); // Removes all non-digits

    const foundUser = todayUsers.find(user => {
        const dbName = user.name?.trim().replace(/\s+/g, ' ').toLowerCase();
        const dbContact = user.contactNumber?.replace(/\D/g, '');
        return dbName === normalizedNameInput && dbContact === normalizedContactInput;
    });

    if (!foundUser) {
      showSuccessAnimation("Registration Not Found", `We couldn't find your registration for today. Please check your details or register again.`, null, 0, true);
      return;
    }

    if (foundUser.orderSubmitted && isToday(foundUser.lastOrderDate)) {
      showLocalLoading('Retrieving your order...');
      const order = await firebaseService.getTodaysOrderByUserId(foundUser.firestoreId);
      hideLocalLoading();
      if (order) {
        setShowRetrieve(false);
        setCurrentOrder(order);
        setOrderConfirmed(true);
      } else {
        showSuccessAnimation("Order Not Found", `No order details found for ${foundUser.name}.`, null, 0, true);
      }
      return;
    }

    if (!systemAvailability.isSystemOpen) {
      showSuccessAnimation(
        'System Closed',
        'The system is currently closed. You can only retrieve a completed order.',
        <div><p style={{ margin: '8px 0', color: '#92400e', fontWeight: '600' }}>Next available: {systemAvailability.nextOpenTime}</p></div>,
        0, true
      );
      return;
    }

    setStudentName(foundUser.name);
    setContactNumber(foundUser.contactNumber);
    setSelectedUserId(foundUser.firestoreId);
    setIsCurrentUserEligible(foundUser.eligibleForDeduction || false);
    if (foundUser.vendor) {
      setSelectedVendor(foundUser.vendor);
    }

    // --- START OF THE CORRECTED LOGIC BLOCK ---
    if (foundUser.commitmentPaid) {
  // Scenario A & B: User already paid commitment fee
  if (minOrderReached) {
    // System is active - go to Step 3 (order submission)
    updateSession(3, { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
    setUserStep(3);
    showSuccessAnimation(
      `Welcome back, ${foundUser.name}!`,
      'The system is active. You can now submit your order.',
      null, 0, true
    );
  } else {
    // System NOT active yet - stay waiting (no step change needed, just show message)
    const currentPaidUsersCount = todayUsers.filter(u => u.commitmentPaid).length;
    const remaining = Math.max(0, 3 - currentPaidUsersCount);
    updateSession(2, { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
    setUserStep(2); // Keep them at step 2 view but show waiting message
    showSuccessAnimation(
      `Welcome back, ${foundUser.name}!`,
      'Thank you for your payment. The system is waiting for more users to activate.',
      <p>We need {remaining} more paid user{remaining !== 1 ? 's' : ''} to open order submissions. Please check back later!</p>,
      0, true
    );
  }
} else {
  // Scenario C: User has NOT paid commitment fee
  if (minOrderReached) {
    // System already activated - skip payment, go directly to order submission
    updateSession(3, { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
    setUserStep(3);
    showSuccessAnimation(
      `Welcome back, ${foundUser.name}!`,
      'The system is already activated! You can submit your order directly without paying the commitment fee.',
      null, 0, true
    );
  } else {
    // System NOT activated - must pay commitment fee
    const currentPaidUsersCount = todayUsers.filter(u => u.commitmentPaid).length;
    const remaining = Math.max(0, 3 - currentPaidUsersCount);
    
    updateSession(2, { name: foundUser.name, contactNumber: foundUser.contactNumber, firestoreId: foundUser.firestoreId }, foundUser.vendor);
    setUserStep(2);
    
    showSuccessAnimation(
      `Welcome back, ${foundUser.name}!`,
      'Please complete your base delivery fee payment to proceed.',
      <p>We need {remaining} more paid user{remaining !== 1 ? 's' : ''} to activate the system for ordering.</p>,
      0, true
    );
  }
}
};

const updateSession = (step, studentData, vendor) => {
  const todayKey = new Date().toLocaleDateString('en-CA');
  const sessionData = {
    vendor: vendor || null,
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

  const userFirestoreId = rememberedStudent.firestoreId;
  const foundUser = prebookUsers.find(u => u.firestoreId === userFirestoreId);

  if (!foundUser) {
    showSuccessAnimation("Session Invalid", "Could not find your registration. Please start over.", null, 0, true);
    resetForm(true); // Clear the bad session data
    return;
  }

  // --- START OF NEW GATEKEEPER LOGIC ---
  // If the user's order is NOT submitted and the system is now CLOSED, stop them.
  if (!foundUser.orderSubmitted && !systemAvailability.isSystemOpen) {
    showSuccessAnimation(
      'System Closed',
      'Your session could not be restored because the system is now closed for new orders.',
      <div><p style={{ margin: '8px 0', color: '#92400e', fontWeight: '600' }}>Next available: {systemAvailability.nextOpenTime}</p></div>,
      0, true
    );
    resetForm(true); // Clear the session so it doesn't try to restore again
    return;
  }
  // --- END OF NEW GATEKEEPER LOGIC ---

  // If we pass the gatekeeper, proceed with session restoration as before.
  setStudentName(rememberedStudent.name);
  setContactNumber(rememberedStudent.contactNumber);
  setSelectedUserId(userFirestoreId);
  setIsCurrentUserEligible(foundUser.eligibleForDeduction || false);

  showLocalLoading("Restoring your session...");
  const sessionStep = rememberedStudent.sessionStep;

    if (sessionStep === 3) {
    try {
      const existingOrder = await firebaseService.getTodaysOrderByUserId(userFirestoreId);
      if (existingOrder) {
        updateSession('order_submitted', { name: rememberedStudent.name, contactNumber: rememberedStudent.contactNumber, firestoreId: userFirestoreId }, selectedVendor);
        localStorage.setItem('pendingOrderDetails', JSON.stringify(existingOrder));
        setUserForEmail({ firestoreId: userFirestoreId, name: rememberedStudent.name });
        setShowEmailModal(true);
        setCurrentOrder(existingOrder);
      } else {
        const userHasOrder = todayOrders.some(order => order.userId === userFirestoreId);
        
        if (userHasOrder) {
          showSuccessAnimation(
            'Order Found',
            'You have already submitted an order today. Please use "Retrieve Registration" to view it.',
            null,
            0,
            true
          );
          resetForm(true);
        } else {
          const savedFormStateJSON = localStorage.getItem(`formState-${userFirestoreId}`);
          if (savedFormStateJSON) {
            const savedFormState = JSON.parse(savedFormStateJSON);
            setOrderNumber(savedFormState.orderNumber || '');
            setOrderTotal(savedFormState.orderTotal || '');
          }
          setUserStep(3);
        }
      }
    } catch (error) {
      showSuccessAnimation("Session Restore Failed", "Failed to restore your session. Please retrieve your registration again.", null, 0, true);
      resetForm(true);
    } finally {
      hideLocalLoading();
    }
  } else {
    // ✅ This handles sessionStep 1 or 2
    setUserStep(sessionStep);
    hideLocalLoading();
  }
}, [rememberedStudent, prebookUsers, selectedVendor, systemAvailability.isSystemOpen, showSuccessAnimation, resetForm, hideLocalLoading, setOrderConfirmed, setCurrentOrder, setShowEmailModal, setUserForEmail]);

useEffect(() => {
  setResetStudentForm(() => resetForm);
}, [resetForm, setResetStudentForm]);

useEffect(() => {
  if (rememberedStudent && prebookUsers.length > 0 && (!selectedUserId || selectedUserId.trim() === '')) {
    console.log('Missing or invalid selectedUserId, attempting to restore from session...');
    loadFromSession();
  }
}, [rememberedStudent, prebookUsers, selectedUserId, loadFromSession]);

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
  (actualDeliveryFee > 0 && !paymentProof) ||
  !selectedVendor;



  return (
    <>
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
                  src="https://www.youtube.com/embed/D4tE5oGe7ng?rel=0&cc_load_policy=1&autoplay=1"
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

        {/* 1. ADD THIS ENTIRE DIV BLOCK */}
      <div style={{
        backgroundColor: '#eef2ff',
        border: '2px solid #818cf8',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          color: '#4338ca',
          fontSize: windowWidth <= 480 ? '16px' : '20px'
        }}>
          You are ordering for delivery on:
        </h3>
        <p style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '20px' : '24px',
          fontWeight: 'bold',
          color: '#3730a3',
          background: 'white',
          padding: '8px 16px',
          borderRadius: '12px',
          display: 'inline-block'
        }}>
          {new Date(systemAvailability.deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      
      <RetrieveRegistration 
        onRetrieve={handleRetrieveRegistration} 
        isVisible={showRetrieve} 
        onToggle={() => setShowRetrieve(!showRetrieve)} 
        windowWidth={windowWidth} 
      />

      <div style={styles.progressBar}>
  <div style={styles.progressText}>
    <span>Minimum 3 official users</span>
    <span>{todayUsers.filter(u => u.commitmentPaid).length}/3</span>
  </div>


        <div style={styles.progressTrack}>
          <div style={{
  ...styles.progressFill,
  width: `${Math.min((todayUsers.filter(u => u.commitmentPaid).length / 3) * 100, 100)}%`
}}></div>
        </div>
        
        <p style={{ 
          fontSize: windowWidth <= 480 ? '12px' : '13px', 
          color: '#64748b', 
          marginTop: '8px',
          lineHeight: '1.5'
        }}>
          <strong>Note:</strong> Official users are those who have registered and paid the RM10 deposit, which will be deducted from their total delivery fee when you submit your order.
        </p>
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
      Step 2: Pay Base Delivery Fee (Deposit)
    </h3>
    <p>RM10 base delivery fee applies to the first 3 users but will be deducted from their total delivery fee during order submission. (Please check back before 4:30pm!!)</p>

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
        <strong>Base Delivery Fee (Deposit):</strong> RM10
      </p>
    </div>
    
    <p style={{ marginBottom: '16px', color: '#64748b' }}>
      Upload proof of payment (RM10 base delivery fee):
    </p>
    <input
  type="file"
  accept="image/*"
  onChange={async (e) => { // <--- MAKE THIS ASYNC
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      const compressedFile = await handleImageCompression(originalFile);
      setReceiptFile(compressedFile);
    }
  }}
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
            fontSize: windowWidth <= 480 ? '15px' : '20px' 
          }}>
            Step 3: Submit Your Order (Please submit before 4:30pm on the delivery date)
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

<div style={styles.sectionCard}>
            <h4 style={styles.sectionHeader}>
  <span style={styles.stepNumber}>2</span>
  Select Your Merchant (FINAL CHOICE)
</h4>
<div style={{
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '12px',
  padding: '12px',
  marginBottom: '16px'
}}>
  <p style={{ 
    margin: 0, 
    color: '#92400e', 
    fontSize: windowWidth <= 480 ? '12px' : '13px',
    fontWeight: '600',
    lineHeight: '1.5'
  }}>
    ⚠️ <strong>Important:</strong> The merchant you select here will be your FINAL order pickup location. 
    Make sure your order receipt matches this merchant!
  </p>
</div>
            <p style={{ 
              marginBottom: '16px', 
              color: '#64748b',
              fontSize: windowWidth <= 480 ? '13px' : '14px' 
            }}>
              Please confirm which merchant you're ordering from:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth <= 480 ? '1fr' : 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '8px'
            }}>
              {[
                { id: 'dominos', name: "Domino's Pizza", emoji: '🍕', color: '#0078d4' },
                { id: 'ayam_gepuk', name: "Ayam Gepuk Pak Gembus", emoji: '🍗', color: '#ffcc02' },
                { id: 'mixue', name: 'MIXUE', emoji: '🧋', color: '#ff69b4' },
                { id: 'family_mart', name: 'Family Mart', emoji: '🏪', color: '#00a1e0' }
              ].map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor.id)}
                  style={{
                    padding: windowWidth <= 480 ? '16px' : '20px',
                    borderRadius: '12px',
                    border: selectedVendor === vendor.id 
                      ? `3px solid ${vendor.color}` 
                      : '2px solid #e2e8f0',
                    backgroundColor: selectedVendor === vendor.id 
                      ? `${vendor.color}15` 
                      : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    boxShadow: selectedVendor === vendor.id 
                      ? `0 4px 12px ${vendor.color}40` 
                      : 'none'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {vendor.emoji}
                  </div>
                  <div style={{ 
                    fontSize: windowWidth <= 480 ? '13px' : '14px',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    {vendor.name}
                  </div>
                </div>
              ))}
            </div>
            {!selectedVendor && (
              <p style={{ 
                color: '#ef4444', 
                fontSize: '13px', 
                marginTop: '8px',
                fontWeight: '500'
              }}>
                ⚠️ Please select a merchant before submitting
              </p>
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
  onChange={async (e) => { // <--- MAKE THIS ASYNC
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      const compressedFile = await handleImageCompression(originalFile);
      setPaymentProof(compressedFile);
    }
  }}
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
  onClick={() => setShowConfirmModal(true)} 
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

    {/* Order Confirmation Modal */}
      {showConfirmModal && (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.3s ease'
    }}
    onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmModal(false); }}
  >
    <style>{`
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    `}</style>
    
    <div style={{
      backgroundColor: 'white',
      borderRadius: '24px',
      maxWidth: '650px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
      animation: 'slideUp 0.4s ease',
      border: '3px solid #3b82f6'
    }}>
      {/* Header with gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: windowWidth <= 480 ? '24px 20px' : '32px 28px',
        borderBottom: '3px solid #2563eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle color="white" size={32} />
          </div>
          <h2 style={{
            fontSize: windowWidth <= 480 ? '22px' : '26px',
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Confirm Your Order
          </h2>
        </div>
        <p style={{
          color: 'rgba(255, 255, 255, 0.95)',
          margin: 0,
          fontSize: windowWidth <= 480 ? '14px' : '15px',
          fontWeight: '500'
        }}>
          Review your details carefully before submitting
        </p>
      </div>

      {/* Scrollable Content */}
      <div style={{
        padding: windowWidth <= 480 ? '20px' : '28px',
        maxHeight: 'calc(90vh - 250px)',
        overflowY: 'auto'
      }}>
        {/* Order Summary Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: windowWidth <= 480 ? '20px' : '24px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            fontSize: windowWidth <= 480 ? '17px' : '19px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '6px',
              height: '24px',
              backgroundColor: '#3b82f6',
              borderRadius: '3px'
            }}></div>
            Order Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Name</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', textAlign: 'right' }}>{studentName}</div>
            </div>
            
            {/* Contact */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Contact</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{contactNumber}</div>
            </div>
            
            {/* Merchant */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Merchant</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                {selectedVendor === 'dominos' && "🍕 Domino's Pizza"}
                {selectedVendor === 'ayam_gepuk' && "🍗 Ayam Gepuk"}
                {selectedVendor === 'mixue' && "🧋 MIXUE"}
              </div>
            </div>
            
            {/* Delivery Date */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Delivery Date</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                {new Date(systemAvailability.deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Order Number */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Order #</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>{orderNumber}</div>
            </div>
            
            {/* Order Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '10px',
              border: '2px solid #3b82f6'
            }}>
              <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '700' }}>Order Total</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e40af' }}>RM {parseFloat(orderTotal).toFixed(2)}</div>
            </div>

            {/* Receipt Images */}
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '10px' }}>📸 Order Receipt(s)</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '10px',
              }}>
                {orderReceiptFiles.map((file, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Receipt ${index + 1}`}
                      onClick={() => setSelectedImage(file)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: windowWidth <= 480 ? '18px' : '22px',
          borderRadius: '16px',
          border: '3px solid #fbbf24',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)'
        }}>
          <h4 style={{
            fontSize: windowWidth <= 480 ? '16px' : '17px',
            fontWeight: '800',
            color: '#92400e',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={22} strokeWidth={3} />
            Important Notice
          </h4>
          <p style={{
            fontSize: windowWidth <= 480 ? '13px' : '14px',
            color: '#92400e',
            lineHeight: '1.7',
            margin: '0 0 10px 0',
            fontWeight: '500'
          }}>
            By confirming this order, you acknowledge that all details are correct. 
            <strong style={{ display: 'block', marginTop: '8px' }}>
              ⚠️ Crave2Cave (C2C) will NOT provide refunds for:
            </strong>
          </p>
          <ul style={{
            fontSize: windowWidth <= 480 ? '13px' : '14px',
            color: '#92400e',
            lineHeight: '1.7',
            margin: 0,
            paddingLeft: '20px',
            fontWeight: '500'
          }}>
            <li>Incorrect pickup schedule/time</li>
            <li>Wrong pickup location</li>
            <li>Wrong merchant selection</li>
            <li>Errors in order details or contact info</li>
          </ul>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{
        padding: windowWidth <= 480 ? '16px 20px' : '20px 28px',
        borderTop: '2px solid #f1f5f9',
        backgroundColor: '#fafafa',
        display: 'flex',
        gap: '12px',
        flexDirection: windowWidth <= 480 ? 'column' : 'row'
      }}>
        <button
          onClick={() => setShowConfirmModal(false)}
          style={{
            flex: 1,
            padding: '15px 24px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          ← Review Again
        </button>
        <button
          onClick={() => {
            setShowConfirmModal(false);
            handleOrderSubmission();
          }}
          style={{
            flex: 1,
            padding: '15px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
          }}
        >
          ✓ Confirm & Submit →
        </button>
      </div>
    </div>
  </div>
)}
  </>
  );
};

export default StudentTab;