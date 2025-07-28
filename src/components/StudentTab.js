import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle, AlertCircle, Camera, Loader2 } from 'lucide-react';

// Import services and utils
import * as firebaseService from '../services/firebase';
import { scanReceipt } from '../services/ocrService';
import { compressImage } from '../utils/compressImage';
import { calculateDeliveryFee } from '../utils/calculateDeliveryFee';
import { isToday } from '../utils/isToday';

// Import components
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
  setShowScanConfirmation,
  setScannedData,
  setOrderConfirmed,
  setCurrentOrder,
  setResetStudentForm,
  setShowEmailModal,
  setUserForEmail,
  selectedVendor
}) => {

  // Student-specific state
  const [userStep, setUserStep] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [orderTotal, setOrderTotal] = useState('');
  const [orderImage, setOrderImage] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [finalOrderNumber, setFinalOrderNumber] = useState('');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [showRetrieve, setShowRetrieve] = useState(false);
  
  // Form validation state
  const [nameError, setNameError] = useState('');
  const [idError, setIdError] = useState('');
  
  // Scanning state
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('scanning');

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
    scanningIndicator: {
      marginTop: '16px',
      padding: '20px',
      borderRadius: '12px',
      backgroundColor: '#e0f2fe',
      border: '1px solid #7dd3fc',
      textAlign: 'center'
    },
    errorCard: {
      marginTop: '16px',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fbbf24'
    },
    imagePreview: {
      marginTop: '16px',
      textAlign: 'center'
    },
    previewImage: {
      maxWidth: windowWidth <= 480 ? '150px' : '200px',
      maxHeight: windowWidth <= 480 ? '150px' : '200px',
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      cursor: 'pointer'
    }
  };

  // Validation functions
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

  // Registration handler
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
          <p>Please proceed to pay the RM10 commitment fee.</p>,
          3000,
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

  // Order image handler
  const handleOrderImageSelect = async (file) => {
    if (!file) return;
    
    setOrderImage(file);
    setScanError('');
    setScannedData({ orderNumber: '', orderTotal: '' });
    setScanMode('scanning');
    setIsScanning(true);
    
    try {
      const compressedFile = await compressImage(file);
      const scanResult = await scanReceipt(compressedFile);
      const { orderNumber, orderTotal: scannedTotal } = scanResult;
      
      setScannedData({ orderNumber, orderTotal: scannedTotal });
      
      if (orderNumber && scannedTotal) {
        setScanMode('confirm');
        setShowScanConfirmation(true);
        setFinalOrderNumber(orderNumber);
        setOrderTotal(scannedTotal);
      } else {
        setScanMode('manual');
        let errorMessage = 'Some information could not be detected:\n';
        if (!orderNumber) errorMessage += '• Order number not found\n';
        if (!scannedTotal) errorMessage += '• Order total not found\n';
        errorMessage += '\nPlease enter the missing information manually.';
        setScanError(errorMessage);
        
        if (scannedTotal) setOrderTotal(scannedTotal);
        if (orderNumber) setFinalOrderNumber(orderNumber);
      }
    } catch (error) {
      console.error('Receipt processing failed:', error);
      setScanMode('manual');
      setScanError('Unable to scan the receipt. Please enter the details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  // Commitment payment handler
  const handleCommitmentPayment = async () => {
    const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
    const isFourthUser = userOrder ? userOrder.order >= 4 : currentUserIndex >= 3;
    
    if (!isFourthUser && !receiptFile) {
      alert('Please upload payment receipt');
      return;
    }

    showLoadingAnimation(isFourthUser ? 'Processing...' : 'Uploading receipt...');
    
    try {
      let receiptURL = null;
      if (!isFourthUser) {
        receiptURL = await firebaseService.uploadFileToStorage(receiptFile);
      }
      
      await firebaseService.updatePrebookUser(selectedUserId, {
        commitmentPaid: true,
        paymentReceiptUploaded: !isFourthUser,
        receiptURL,
        wasFourthUser: isFourthUser
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
          'Your RM10 commitment fee has been received.',
          <p>We need {remaining} more paid user{remaining > 1 ? 's' : ''} before order submission opens. Please check back later!</p>,
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
      alert('Error submitting payment. Please try again.');
      console.error('Payment error:', error);
    }
  };

  // Order submission handler
    // This is the complete, updated function for StudentTab.js
  const handleOrderSubmission = async () => {
    // --- Step 1: Basic validation (this part is unchanged) ---
    if (!orderTotal || !finalOrderNumber.trim() || !orderImage) {
      alert('Please complete all required fields: Order Total, Order Number, and upload a receipt image.');
      return;
    }
    
    const totalAmount = parseFloat(orderTotal);
    if (isNaN(totalAmount)) {
      alert('Please enter a valid order total.');
      return;
    }
    
    const deliveryFee = calculateDeliveryFee(totalAmount);
    const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
    const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
    const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);
    
    if (actualDeliveryFee > 0 && !paymentProof) {
      showSuccessAnimation(
        'Payment Receipt Required',
        'Please upload your payment receipt to continue.',
        // ... (BeautifulMessage component)
      );
      return;
    }

    // --- Step 2: Show loading and process the order (this part is mostly unchanged) ---
    showLoadingAnimation('Processing order...');
    
    try {
      const compressedOrderImage = await compressImage(orderImage);
      const orderImageURL = await firebaseService.uploadFileToStorage(compressedOrderImage);
      
      let paymentProofURL = null;
      if (paymentProof) {
        const compressedPaymentProof = await compressImage(paymentProof);
        paymentProofURL = await firebaseService.uploadFileToStorage(compressedPaymentProof);
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
        orderNumber: finalOrderNumber.trim(),
        status: 'pending',
        userPosition: currentUserIndex + 1,
        wasFourthUser: currentUserIndex >= 3,
        timestamp: new Date().toISOString(),
        vendor: selectedVendor
      };
      
      await firebaseService.saveOrder(orderData);
      await firebaseService.updatePrebookUser(selectedUserId, {
        orderTotal: orderData.orderTotal,
        orderSubmitted: true,
        hasOrdered: true,
        orderImageURL: orderData.orderImageURL,
        lastOrderDate: new Date().toISOString()
      });
      
      hideLoadingAnimation();
      
      // --- Step 3: Trigger the Email Modal (This is the new part) ---
      // Instead of showing a success animation and the waiting page,
      // we now find the current user's data and tell App.js to open the email prompt.
      
      const currentUserForModal = prebookUsers.find(u => u.firestoreId === selectedUserId);
      
      if (currentUserForModal) {
        // Pass the user's data up to App.js so the modal knows who to update
        setUserForEmail(currentUserForModal);
      }
      
      // Tell App.js to open the email modal
      setShowEmailModal(true);
      
      // Keep the order data ready for when the waiting page is shown later
      setCurrentOrder(orderData);

    } catch (error) {
      hideLoadingAnimation();
      alert('Error submitting order. Please try again.');
      console.error('Order submission error:', error);
    }
  };
  
  // Retrieve registration handler
  const handleRetrieveRegistration = (name, id) => {
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
      showSuccessAnimation(
        "Order Already Submitted",
        `Hi ${foundUser.name}, you have already submitted your order today.`,
        <BeautifulMessage 
          type="info" 
          title="Daily Order Limit" 
          message="You can only submit one order per day." 
          icon={<CheckCircle />} 
          onClose={() => setOrderConfirmed(true)} 
        />,
        3000,
        true,
        () => setOrderConfirmed(true)
      );
      return;
    }

    const userOrder = registrationOrder.find(order => order.userId === foundUser.firestoreId);
    const userIndex = userOrder ? userOrder.order - 1 : prebookUsers.findIndex(u => u.firestoreId === foundUser.firestoreId);
    
    setCurrentUserIndex(userIndex);
    setStudentName(foundUser.name);
    setStudentId(foundUser.studentId);
    setSelectedUserId(foundUser.firestoreId);
    
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

    // Reset form handler
  const resetForm = useCallback(() => {
    setUserStep(1);
    setStudentName('');
    setStudentId('');
    setSelectedUserId('');
    setReceiptFile(null);
    setOrderTotal('');
    setOrderImage(null);
    setPaymentProof(null);
    setFinalOrderNumber('');
    setCurrentUserIndex(0);
    setNameError('');
    setIdError('');
    setScanError('');
    setIsScanning(false);
    setScanMode('scanning');
  }, []); // The empty array is important!

  // Add this hook right after the resetForm function.
  // It sends the resetForm function up to the App.js parent.
  useEffect(() => {
    if (setResetStudentForm) {
      setResetStudentForm(() => resetForm);
    }
  }, [resetForm, setResetStudentForm]);

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

      {/* Step 1: Registration */}
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

      {/* Step 2: Payment */}
      {userStep === 2 && (
        <div>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#1e293b',
            fontSize: windowWidth <= 480 ? '16px' : '18px'
          }}>
            Step 2: Pay Commitment Fee
          </h3>
          
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
              <strong>Commitment Fee:</strong> {
                currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4) 
                  ? 'FREE (4th+ user!)' 
                  : 'RM10'
              }
            </p>
          </div>
          
          {!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && (
            <>
              <p style={{ marginBottom: '16px', color: '#64748b' }}>
                Upload proof of payment (RM10 commitment fee):
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

       {/* Step 3: Order Submission */}
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
              Upload Order Receipt
            </h4>
            <p style={{ marginBottom: '12px', color: '#64748b' }}>
              <Camera size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Take a clear photo of your receipt. We'll try to scan the details.
            </p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleOrderImageSelect(e.target.files[0])} 
              style={{ 
                ...styles.input, 
                backgroundColor: '#f0f9ff', 
                border: '2px dashed #3b82f6', 
                padding: '16px', 
                cursor: 'pointer' 
              }} 
              disabled={isScanning} 
            />
            {isScanning && (
              <div style={styles.scanningIndicator}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
                Scanning receipt...
              </div>
            )}
            {scanError && !isScanning && (
              <div style={styles.errorCard}>
                <AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {scanError.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
            {orderImage && !isScanning && (
              <div style={styles.imagePreview}>
                <img 
                  src={URL.createObjectURL(orderImage)} 
                  alt="Uploaded Receipt" 
                  style={styles.previewImage}
                  onClick={() => setSelectedImage(orderImage)}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                  Click image to enlarge
                </p>
              </div>
            )}
          </div>
          
          {(orderImage || scanMode === 'manual') && (
            <div style={styles.sectionCard}>
              <h4 style={styles.sectionHeader}>
                <span style={styles.stepNumber}>2</span>
                Order Details
              </h4>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Order Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter order number from receipt" 
                value={finalOrderNumber} 
                onChange={(e) => setFinalOrderNumber(e.target.value)} 
                style={{ ...styles.input, backgroundColor: finalOrderNumber ? '#f0fdf4' : '#fff' }} 
              />
              <label style={{ display: 'block', marginBottom: '8px', marginTop: '16px', color: '#374151', fontWeight: '500' }}>
                Order Total (RM) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Enter order total amount" 
                value={orderTotal} 
                onChange={(e) => setOrderTotal(e.target.value)} 
                style={{ ...styles.input, backgroundColor: orderTotal ? '#f0fdf4' : '#fff' }} 
              />
            </div>
          )}

          {orderTotal && (
            <>
              <FeeBreakdown 
                orderTotal={parseFloat(orderTotal) || 0} 
                userIndex={currentUserIndex} 
                isCommitmentFeePaid={prebookUsers.find(u => u.firestoreId === selectedUserId)?.commitmentPaid} 
                registrationOrder={registrationOrder} 
                selectedUserId={selectedUserId} 
              />
              
              {(() => {
                const deliveryFee = calculateDeliveryFee(parseFloat(orderTotal) || 0);
                const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
                const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
                const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);
                
                if (actualDeliveryFee > 0) {
                  return (
                    <div style={styles.sectionCard}>
                      <h4 style={styles.sectionHeader}>Delivery Fee Payment</h4>
                      <UnifiedQRCodeDisplay amount={actualDeliveryFee} />
                      <p style={{ marginTop: '16px', marginBottom: '12px', color: '#64748b' }}>
                        Please upload proof of payment for the delivery fee:
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
              
              {(() => {
                const deliveryFee = calculateDeliveryFee(parseFloat(orderTotal) || 0);
                const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
                const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
                const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);
                const isButtonDisabled = !orderImage || !finalOrderNumber.trim() || (actualDeliveryFee > 0 && !paymentProof);
                
                return (
                  <button 
                    onClick={handleOrderSubmission} 
                    disabled={isButtonDisabled} 
                    style={{ 
                      ...styles.button, 
                      ...styles.buttonOrange, 
                      opacity: isButtonDisabled ? 0.5 : 1, 
                      cursor: isButtonDisabled ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    Submit Order
                  </button>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* Waiting state if user paid but system not yet active */}
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