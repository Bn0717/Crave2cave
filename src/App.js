import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Import services and utils
import * as firebaseService from './services/firebase';
import { scanReceipt } from './services/ocrService';
import { compressImage } from './utils/compressImage';
import { calculateDeliveryFee } from './utils/calculateDeliveryFee';
import { isToday } from './utils/isToday';

// Import all UI components
import Navigation from './components/Navigation';
import LoadingAnimation from './components/LoadingAnimation';
import SuccessAnimation from './components/SuccessAnimation';
import WaitingPage from './components/WaitingPage';
import ImageModal from './components/ImageModal';
import AuthScreen from './components/AuthScreen';
import RetrieveRegistration from './components/RetrieveRegistration';
import BeautifulMessage from './components/BeautifulMessage';
import FeeBreakdown from './components/FeeBreakdown';
import UnifiedQRCodeDisplay from './components/UnifiedQRCodeDisplay';
import ScanConfirmationModal from './components/ScanConfirmationModal';
import ResponsiveTable from './components/ResponsiveTable';
import SimpleChart from './components/SimpleChart';
import CountdownTimer from './components/CountdownTimer';

// Import icons for JSX
import { Users, CheckCircle, Package, Clock, Calendar, AlertCircle, Camera, Truck, UserCheck, History, DollarSign, TrendingUp, Receipt, Loader2 } from 'lucide-react';

function App() {
    // All state declarations from before are here...
    const [activeTab, setActiveTab] = useState('student');
    const [prebookUsers, setPrebookUsers] = useState([]);
    const [todayOrders, setTodayOrders] = useState([]);
    const [todayUsers, setTodayUsers] = useState([]);
    const [minOrderReached, setMinOrderReached] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [orderTotal, setOrderTotal] = useState('');
    const [orderImage, setOrderImage] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userStep, setUserStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successConfig, setSuccessConfig] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [nameError, setNameError] = useState('');
    const [idError, setIdError] = useState('');
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [showRetrieve, setShowRetrieve] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [registrationOrder, setRegistrationOrder] = useState([]);
    const [paymentProof, setPaymentProof] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [systemActivatedToday, setSystemActivatedToday] = useState(false);
    const [finalOrderNumber, setFinalOrderNumber] = useState('');
    const [scanError, setScanError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState('scanning');
    const [scannedData, setScannedData] = useState({ orderNumber: '', orderTotal: '' });
    const [showScanConfirmation, setShowScanConfirmation] = useState(false);
    
    const ADMIN_PASSCODE = 'byyc';

    // All styles...
    const styles = {
        container: { minHeight: '100vh', paddingTop: '90px' },
        maxWidth: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' },
        card: { backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', marginBottom: '24px', border: '1px solid #f1f5f9' },
        cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
        cardTitle: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#1e293b' },
        grid: { display: 'grid', gap: '24px', gridTemplateColumns: '1fr' },
        progressBar: { marginBottom: '28px' },
        progressText: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginBottom: '10px', fontWeight: '500' },
        progressTrack: { width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' },
        progressFill: { height: '100%', backgroundColor: '#10b981', transition: 'width 0.5s ease', borderRadius: '6px', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' },
        input: { width: '100%', padding: '16px 20px', border: '2px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', fontSize: '16px', boxSizing: 'border-box', transition: 'all 0.2s', backgroundColor: '#f8fafc' },
        button: { width: '100%', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '16px', transition: 'all 0.3s ease', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)' },
        inputError: { borderColor: '#ef4444' },
        errorText: { color: '#ef4444', fontSize: '13px', marginTop: '-12px', marginBottom: '12px' },
        buttonGreen: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' },
        buttonBlue: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' },
        buttonOrange: { background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white' },
        authContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px' },
        passcodeInput: { position: 'relative', marginBottom: '20px', width: '100%', maxWidth: '320px', display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' },
        toggleButton: { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px' },
        statCard: { backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease', cursor: 'pointer', border: '1px solid #f1f5f9' },
        statIcon: { width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
        statContent: { flex: 1, minWidth: 0 },
        statLabel: { fontSize: '14px', color: '#64748b', marginBottom: '4px', fontWeight: '500' },
        statValue: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', lineHeight: '1.2' },
    };

    // All functions from before are here and correct...
    const filterTodayData = useCallback((ordersData = [], users = []) => {
        const todayOrdersFiltered = ordersData.filter(order => isToday(order.timestamp));
        const todayUsersFiltered = users.filter(user => isToday(user.registrationDate) || isToday(user.timestamp));
        setTodayOrders(todayOrdersFiltered);
        setTodayUsers(todayUsersFiltered);
        const todayPaidUsers = todayUsersFiltered.filter(u => u.commitmentPaid);
        const isActivatedToday = todayPaidUsers.length >= 3;
        setMinOrderReached(isActivatedToday);
        setSystemActivatedToday(isActivatedToday);
    }, []);

    const fetchAllData = useCallback(async () => {
        try {
            setLoadingUsers(true); setLoadingOrders(true); setLoadingHistory(true);
            const [users, ordersData, history] = await Promise.all([
                firebaseService.getPrebookUsers(),
                firebaseService.getOrders(),
                firebaseService.getHistoryData()
            ]);
            setPrebookUsers(users);
            setHistoryData(history);
            filterTodayData(ordersData, users);
            const orderArray = users.map((user, index) => ({ userId: user.firestoreId, order: index + 1 }));
            setRegistrationOrder(orderArray);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingUsers(false); setLoadingOrders(false); setLoadingHistory(false);
        }
    }, [filterTodayData]);

    const showSuccessAnimation = (title, message, additionalInfo = null, duration = 2000, showOkButton = true, onCloseCallback = null) => {
        setSuccessConfig({ title, message, additionalInfo, duration, showOkButton, onClose: onCloseCallback });
        setShowSuccess(true);
    };

    const showLoadingAnimation = (message) => { setLoadingMessage(message); setIsLoading(true); };
    const hideLoadingAnimation = () => { setIsLoading(false); setLoadingMessage(''); };

    const validateName = (name) => {
        if (!name.trim()) { setNameError('Name is required'); return false; }
        if (name.trim().split(' ').length < 2) { setNameError('Please enter your full name (first and last name)'); return false; }
        setNameError(''); return true;
    };

    const validateStudentId = (id) => {
        if (!id.trim()) { setIdError('Student ID is required'); return false; }
        if (id.length < 4) { setIdError('Student ID must be at least 4 characters'); return false; }
        if (!/\d{4}\/\d{2}$/.test(id)) { setIdError('Student ID format should be like 0469/24'); return false; }
        setIdError(''); return true;
    };
    
    const handlePrebook = async () => {
        if (!validateName(studentName) || !validateStudentId(studentId)) return;
        const existingUser = prebookUsers.find(user => isToday(user.timestamp) && (user.studentId === studentId || user.name.toLowerCase() === studentName.toLowerCase()));
        if (existingUser) {
            let message = 'You have already registered today.';
            if (existingUser.studentId === studentId) message = `Student ID ${studentId} has already been used.`;
            else if (existingUser.name.toLowerCase() === studentName.toLowerCase()) message = `Name "${studentName}" has already been used.`;
            showSuccessAnimation('Registration Already Exists', message, <BeautifulMessage type="error" message="Please try again tomorrow." icon={<AlertCircle />} />, 3000, true);
            return;
        }
        showLoadingAnimation('Registering...');
        try {
            const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
            const isSystemActivated = paidUsersCount >= 3;
            const registrationIndex = prebookUsers.length;
            const isFourthOrLaterUser = isSystemActivated || registrationIndex >= 3;
            const newUser = { name: studentName, studentId, timestamp: new Date().toISOString(), hasOrdered: false, commitmentPaid: isFourthOrLaterUser, orderTotal: 0, orderSubmitted: false, wasFourthUser: isFourthOrLaterUser, registrationOrder: registrationIndex + 1 };
            const newUserId = await firebaseService.savePrebookUser(newUser);
            setSelectedUserId(newUserId);
            await fetchAllData();
            hideLoadingAnimation();
            if (isFourthOrLaterUser) {
                showSuccessAnimation('Registration Successful!', 'You have been registered for the food delivery service.', <p style={{ color: '#059669', fontWeight: '600', fontSize: '18px' }}>🎉 System is active! You can now submit your order.</p>, 2500, true, () => setUserStep(3));
            } else {
                showSuccessAnimation('Registration Successful!', 'You have been registered for the food delivery service.', <p>Please proceed to pay the RM10 commitment fee.</p>, 3000, true, () => setUserStep(2));
            }
        } catch (error) {
            hideLoadingAnimation();
            alert('Error registering user. Please try again.');
            console.error('Registration error:', error);
        }
    };
    
    const handleOrderImageSelect = async (file) => {
        if (!file) return;
        setOrderImage(file); setScanError(''); setScannedData({ orderNumber: '', orderTotal: '' }); setScanMode('scanning'); setShowScanConfirmation(false); setIsScanning(true);
        try {
            const compressedFile = await compressImage(file);
            const scanResult = await scanReceipt(compressedFile);
            const { orderNumber, orderTotal: scannedTotal } = scanResult;
            setScannedData({ orderNumber, orderTotal: scannedTotal });
            if (orderNumber && scannedTotal) {
                setScanMode('confirm');
                setShowScanConfirmation(true);
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
    
    const handleScanConfirmation = (confirmed) => {
        if (confirmed) {
            setOrderTotal(scannedData.orderTotal);
            setFinalOrderNumber(scannedData.orderNumber);
            setShowScanConfirmation(false);
            setScanMode('manual');
            showSuccessAnimation('Scan Successful!', 'Order details have been filled automatically.', null, 1500, true);
        } else {
            setShowScanConfirmation(false);
            setScanMode('manual');
            setScanError('Please upload a clearer image or enter the details manually.');
        }
    };
    
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
            await firebaseService.updatePrebookUser(selectedUserId, { commitmentPaid: true, paymentReceiptUploaded: !isFourthUser, receiptURL, wasFourthUser: isFourthUser });
            const userBeingUpdated = prebookUsers.find(u => u.firestoreId === selectedUserId);
            const currentPaidCount = prebookUsers.filter(u => u.commitmentPaid).length;
            const newPaidCount = userBeingUpdated && !userBeingUpdated.commitmentPaid ? currentPaidCount + 1 : currentPaidCount;
            await fetchAllData();
            hideLoadingAnimation();
            if (newPaidCount >= 3 || isFourthUser) {
                showSuccessAnimation(isFourthUser ? 'Processing Complete!' : 'Payment Confirmed!', isFourthUser ? 'As a 4th+ registrant, you can proceed without payment!' : 'Your RM10 commitment fee has been received.', <p>You can now submit your order!</p>, 2500, true, () => setUserStep(3));
            } else {
                const remaining = 3 - newPaidCount;
                showSuccessAnimation('Payment Confirmed!', 'Your RM10 commitment fee has been received.', <p>We need {remaining} more paid user{remaining > 1 ? 's' : ''} before order submission opens. Please check back later!</p>, 0, true, () => {
                    setUserStep(1); setStudentName(''); setStudentId(''); setSelectedUserId(''); setReceiptFile(null);
                });
            }
        } catch (error) {
            hideLoadingAnimation();
            alert('Error submitting payment. Please try again.');
            console.error('Payment error:', error);
        }
    };
    
    const handleOrderSubmission = async () => {
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
        const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid) ? 10 : 0;
        const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);
        if (actualDeliveryFee > 0 && !paymentProof) {
            showSuccessAnimation('Payment Receipt Required', 'Please upload your payment receipt to continue.', <BeautifulMessage type="warning" message={`Your delivery fee is RM${actualDeliveryFee.toFixed(2)}. Please upload proof of payment.`} icon={<Receipt />} />, 3000, true);
            return;
        }
        showLoadingAnimation('Processing order...');
        try {
            const compressedOrderImage = await compressImage(orderImage);
            const orderImageURL = await firebaseService.uploadFileToStorage(compressedOrderImage);
            let paymentProofURL = null;
            if (paymentProof) {
                const compressedPaymentProof = await compressImage(paymentProof);
                paymentProofURL = await firebaseService.uploadFileToStorage(compressedPaymentProof);
            }
            const orderData = { userId: selectedUserId, userName: studentName, studentId, orderTotal: totalAmount, originalDeliveryFee: deliveryFee, deliveryFee: actualDeliveryFee, commitmentFeeDeducted, totalWithDelivery: totalAmount + actualDeliveryFee, orderImageURL, paymentProofURL, orderNumber: finalOrderNumber.trim(), status: 'pending', userPosition: currentUserIndex + 1, wasFourthUser: currentUserIndex >= 3, timestamp: new Date().toISOString() };
            await firebaseService.saveOrder(orderData);
            await firebaseService.updatePrebookUser(selectedUserId, { orderTotal: orderData.orderTotal, orderSubmitted: true, hasOrdered: true, orderImageURL: orderData.orderImageURL, lastOrderDate: new Date().toISOString() });
            setCurrentOrder(orderData);
            hideLoadingAnimation();
            showSuccessAnimation('Order Confirmed!', 'Your order has been successfully submitted.', (<div><Truck size={32} color="#ea580c" style={{ marginBottom: '8px' }} /><p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#92400e', fontWeight: '600' }}>Driver Pickup at 7:00 PM</p><CountdownTimer targetTime="19:00" /></div>), 0, true, () => setOrderConfirmed(true));
        } catch (error) {
            hideLoadingAnimation();
            alert('Error submitting order. Please try again.');
            console.error('Order submission error:', error);
        }
    };
    
    const handleCloseWaitingPage = () => {
        setOrderConfirmed(false); setUserStep(1); setSelectedUserId(''); setStudentName(''); setStudentId(''); setOrderTotal(''); setOrderImage(null); setReceiptFile(null); setPaymentProof(null); fetchAllData();
    };

    const handleAuthentication = (passcodeAttempt) => {
        if (passcodeAttempt === ADMIN_PASSCODE) {
            localStorage.setItem('isAdminAuthenticated', 'true');
            setIsAuthenticated(true);
        } else {
            alert('Invalid passcode');
        }
    };
    
    const resetAuth = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAdminAuthenticated');
    };

    const handleRetrieveRegistration = (name, id) => {
        const foundUser = prebookUsers.find(user => user.name?.toLowerCase() === name.toLowerCase() && user.studentId === id && isToday(user.timestamp));
        if (!foundUser) {
            showSuccessAnimation("Registration Not Found", `We couldn't find your registration details for today.`, <BeautifulMessage type="warning" title="Daily Registration Required" message="Registrations are only valid for the current day. Please register again for today's delivery." icon={<Calendar />} />, 0, true);
            return;
        }
        const userTodayOrder = todayOrders.find(order => order.userId === foundUser.firestoreId);
        if (userTodayOrder) setCurrentOrder(userTodayOrder);
        if (foundUser.orderSubmitted && isToday(foundUser.lastOrderDate)) {
            showSuccessAnimation("Order Already Submitted", `Hi ${foundUser.name}, you have already submitted your order today.`, <BeautifulMessage type="info" title="Daily Order Limit" message="You can only submit one order per day." icon={<Package />} onClose={() => setOrderConfirmed(true)} />, 3000, true, () => setOrderConfirmed(true));
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
            showSuccessAnimation(`Welcome back ${foundUser.name}!`, systemActivatedToday && userIndex >= 3 ? 'System is active! You can proceed directly to order submission.' : 'Your payment has been confirmed. You can now submit your order.', null, 2500, true);
        } else {
            setUserStep(2);
            const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
            showSuccessAnimation(`Welcome back ${foundUser.name}!`, 'Please complete your commitment fee payment to continue.', <p>We still need {3 - paidUsersCount} more paid users before order submission opens.</p>, 5000, true);
        }
        setShowRetrieve(false);
    };

    const getTotalHistoryStats = () => {
        const totalRegistered = historyData.reduce((sum, entry) => sum + (entry.registeredUsers || 0), 0);
        const totalRevenue = historyData.reduce((sum, entry) => sum + (entry.totalRevenue || 0), 0);
        const totalProfit = historyData.reduce((sum, entry) => sum + (entry.profit || 0), 0);
        const totalOrders = historyData.reduce((sum, entry) => sum + (entry.totalOrders || 0), 0);
        const todayString = new Date().toISOString().split('T')[0];
        const todayInHistory = historyData.some(entry => entry.date === todayString);
        if (!todayInHistory && todayUsers.length > 0) {
          const todayRegistered = todayUsers.filter(u => isToday(u.timestamp)).length;
          const todayRevenue = todayUsers.filter(u => u.commitmentPaid).length * 10 + todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
          const todayProfit = todayRevenue - (todayOrders.length > 0 ? 30 : 0);
          return { totalRegistered: totalRegistered + todayRegistered, totalRevenue: totalRevenue + todayRevenue, totalProfit: totalProfit + todayProfit, totalOrders: totalOrders + todayOrders.length };
        }
        return { totalRegistered, totalRevenue, totalProfit, totalOrders };
    };

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        const auth = localStorage.getItem('isAdminAuthenticated');
        if (auth === 'true') setIsAuthenticated(true);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const checkForNewDay = () => {
            const now = new Date();
            const malaysiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
            const lastAccessDate = localStorage.getItem('lastAccessDate');
            const todayMalaysia = malaysiaTime.toDateString();
            if (lastAccessDate !== todayMalaysia) {
                localStorage.setItem('lastAccessDate', todayMalaysia);
                setTodayOrders([]); setTodayUsers([]); setPrebookUsers([]); setMinOrderReached(false); setSystemActivatedToday(false);
                setUserStep(1); setStudentName(''); setStudentId(''); setSelectedUserId(''); setOrderTotal(''); setOrderImage(null); setReceiptFile(null); setPaymentProof(null); setOrderConfirmed(false); setCurrentOrder(null);
                fetchAllData();
            }
        };
        checkForNewDay();
        const interval = setInterval(checkForNewDay, 60000);
        return () => clearInterval(interval);
    }, [fetchAllData]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return (
        <div style={styles.container}>
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} setIsAuthenticated={resetAuth} />

            {isLoading && <LoadingAnimation message={loadingMessage} />}
            {showSuccess && <SuccessAnimation {...successConfig} onClose={() => { setShowSuccess(false); if (successConfig.onClose) successConfig.onClose(); }} />}
            {orderConfirmed && <WaitingPage onClose={handleCloseWaitingPage} currentOrder={currentOrder} />}
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
            {showScanConfirmation && <ScanConfirmationModal scannedData={scannedData} onConfirm={handleScanConfirmation} orderImage={orderImage} windowWidth={windowWidth} />}
            
            <div style={styles.maxWidth}>
                {activeTab === 'student' && (
                    <div style={styles.card}>
                        {/* The entire student flow JSX is here... */}
                        <div style={styles.cardHeader}>
                            <Users color="#3b82f6" size={28} />
                            <h2 style={styles.cardTitle}>Food Delivery Registration</h2>
                        </div>
                        <RetrieveRegistration onRetrieve={handleRetrieveRegistration} isVisible={showRetrieve} onToggle={() => setShowRetrieve(!showRetrieve)} windowWidth={windowWidth} />
                        <div style={styles.progressBar}>
                            <div style={styles.progressText}>
                                <span>Minimum 3 paid users required</span>
                                <span>{todayUsers.filter(u => u.commitmentPaid).length}/{Math.max(3, todayUsers.filter(u => u.commitmentPaid).length)}</span>
                            </div>
                            <div style={styles.progressTrack}>
                                <div style={{ ...styles.progressFill, width: `${Math.min((todayUsers.filter(u => u.commitmentPaid).length / Math.max(3, todayUsers.filter(u => u.commitmentPaid).length)) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        {userStep === 1 && (
                            <div>
                                <h3 style={{ marginBottom: '20px', color: '#1e293b', fontSize: windowWidth <= 480 ? '16px' : '18px' }}>Step 1: Register</h3>
                                <input type="text" placeholder="Enter your full name (e.g., Bryan Ngu)" value={studentName} onChange={(e) => { setStudentName(e.target.value); validateName(e.target.value); }} style={{ ...styles.input, ...(nameError && styles.inputError) }} />
                                {nameError && <p style={styles.errorText}>{nameError}</p>}
                                <input type="text" placeholder="Enter your student ID (e.g., 0469/24)" value={studentId} onChange={(e) => { setStudentId(e.target.value); validateStudentId(e.target.value); }} style={{ ...styles.input, ...(idError && styles.inputError) }} />
                                {idError && <p style={styles.errorText}>{idError}</p>}
                                <button onClick={handlePrebook} style={{ ...styles.button, ...styles.buttonGreen }}>Register for Delivery</button>
                            </div>
                        )}
                        {userStep === 2 && (
                            <div>
                                <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Step 2: Pay Commitment Fee</h3>
                                <UnifiedQRCodeDisplay isCommitmentFee={true} userIndex={currentUserIndex} registrationOrder={registrationOrder} selectedUserId={selectedUserId} />
                                <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                                    <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {studentName}</p>
                                    <p style={{ margin: '0 0 8px 0' }}><strong>Student ID:</strong> {studentId}</p>
                                    <p style={{ margin: 0 }}><strong>Commitment Fee:</strong> {currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4) ? 'FREE (4th+ user!)' : 'RM10'}</p>
                                </div>
                                {!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && (
                                    <>
                                        <p style={{ marginBottom: '16px', color: '#64748b' }}>Upload proof of payment (RM10 commitment fee):</p>
                                        <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files[0])} style={styles.input} />
                                        {receiptFile && <div style={{ marginBottom: '20px', textAlign: 'center' }}><img src={URL.createObjectURL(receiptFile)} alt="Payment Receipt" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /></div>}
                                    </>
                                )}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={handleCommitmentPayment} disabled={!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && !receiptFile} style={{ ...styles.button, ...styles.buttonBlue, opacity: (!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && !receiptFile) ? 0.5 : 1, cursor: (!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) && !receiptFile) ? 'not-allowed' : 'pointer' }}>
                                        {(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order >= 4)) ? 'Continue (Free)' : 'Submit Payment'}
                                    </button>
                                    <button onClick={() => { setUserStep(1); setSelectedUserId(''); setReceiptFile(null); }} style={{ ...styles.button, backgroundColor: '#64748b', color: 'white' }}>Back</button>
                                </div>
                            </div>
                        )}
                        {userStep === 3 && minOrderReached && (
                            <div>
                                <h3 style={{ marginBottom: '20px', color: '#1e293b', fontSize: windowWidth <= 480 ? '18px' : '20px' }}>Step 3: Submit Your Order</h3>
                                <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #86efac', display: 'flex', alignItems: 'center' }}><CheckCircle color="#16a34a" size={24} style={{ marginRight: '8px' }} />Payment confirmed! You can now submit your order.</div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '2px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ backgroundColor: '#3b82f6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>1</span>
                                        Upload Order Receipt
                                    </h4>
                                    <p style={{ marginBottom: '12px', color: '#64748b' }}><Camera size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Take a clear photo of your receipt. We'll automatically scan the order details.</p>
                                    <input type="file" accept="image/*" onChange={(e) => handleOrderImageSelect(e.target.files[0])} style={{ ...styles.input, backgroundColor: '#f0f9ff', border: '2px dashed #3b82f6', padding: '16px', cursor: 'pointer' }} disabled={isScanning} />
                                    {isScanning && <div style={{ marginTop: '16px', padding: '20px', borderRadius: '12px', backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc', textAlign: 'center' }}><LoadingAnimation message="Scanning receipt..." /></div>}
                                    {scanError && !isScanning && <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' }}><AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{scanError}</div>}
                                    {orderImage && !isScanning && <div style={{ marginTop: '16px', textAlign: 'center' }}><img src={URL.createObjectURL(orderImage)} alt="Uploaded Receipt" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '2px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setSelectedImage(URL.createObjectURL(orderImage))} /><p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Click image to enlarge</p></div>}
                                </div>
                                {(orderImage || scanMode === 'manual') && !showScanConfirmation && (
                                    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '2px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ backgroundColor: '#3b82f6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>2</span>Order Details</h4>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Order Number <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input type="text" placeholder="Enter order number from receipt" value={finalOrderNumber} onChange={(e) => setFinalOrderNumber(e.target.value)} style={{ ...styles.input, backgroundColor: finalOrderNumber ? '#f0fdf4' : '#fff' }} />
                                        <label style={{ display: 'block', marginBottom: '8px', marginTop: '16px', color: '#374151', fontWeight: '500' }}>Order Total (RM) <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input type="number" step="0.01" placeholder="Enter order total amount" value={orderTotal} onChange={(e) => setOrderTotal(e.target.value)} style={{ ...styles.input, backgroundColor: orderTotal ? '#f0fdf4' : '#fff' }} />
                                    </div>
                                )}
                                {orderTotal && (
                                    <>
                                        <FeeBreakdown orderTotal={parseFloat(orderTotal) || 0} userIndex={currentUserIndex} isCommitmentFeePaid={prebookUsers.find(u => u.firestoreId === selectedUserId)?.commitmentPaid} registrationOrder={registrationOrder} selectedUserId={selectedUserId} />
                                        {(() => {
                                            const deliveryFee = calculateDeliveryFee(parseFloat(orderTotal) || 0);
                                            const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
                                            const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
                                            const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);
                                            if (actualDeliveryFee > 0) {
                                                return (
                                                    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '2px solid #e2e8f0' }}>
                                                        <h4 style={{ margin: '0 0 16px 0' }}>Delivery Fee Payment</h4>
                                                        <UnifiedQRCodeDisplay amount={actualDeliveryFee} />
                                                        <p style={{ marginTop: '16px', marginBottom: '12px', color: '#64748b' }}>Please upload proof of payment for the delivery fee:</p>
                                                        <input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files[0])} style={styles.input} />
                                                        {paymentProof && <div style={{ marginTop: '16px', textAlign: 'center' }}><img src={URL.createObjectURL(paymentProof)} alt="Payment Proof" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} /></div>}
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
                                            return <button onClick={handleOrderSubmission} disabled={isButtonDisabled} style={{ ...styles.button, ...styles.buttonOrange, opacity: isButtonDisabled ? 0.5 : 1, cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }}>Submit Order</button>;
                                        })()}
                                    </>
                                )}
                            </div>
                        )}
                        {userStep === 3 && !minOrderReached && (
                            <div>
                                <BeautifulMessage type="success" title="Payment Confirmed!" message="Thank you for your commitment. Your payment has been successfully processed." icon={<CheckCircle />} />
                                <BeautifulMessage type="warning" title="Waiting for More Orders" message={`We need at least 3 paid users before order submission opens. Current progress: ${prebookUsers.filter(u => u.commitmentPaid).length}/3 users`} icon={<Clock />}>
                                    <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>You'll be able to submit your order once we reach the minimum requirement. Please check back later!</p>
                                </BeautifulMessage>
                                <button onClick={() => { setUserStep(1); setStudentName(''); setStudentId(''); setSelectedUserId(''); setReceiptFile(null); }} style={{ ...styles.button, backgroundColor: '#64748b', color: 'white' }}>Return to Home</button>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'admin' && (
                    <>
                    {!isAuthenticated ? (
                        <AuthScreen title="Admin Dashboard" onAuth={handleAuthentication} styles={styles} />
                    ) : (
                        <div>
                        {(loadingUsers || loadingOrders || loadingHistory) ? (
                            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '20px', marginBottom: '32px' }}>
                                <Loader2 size={56} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                                <p style={{ marginTop: '24px', color: '#64748b', fontSize: '18px' }}>Loading dashboard data...</p>
                            </div>
                        ) : (
                            // --- THIS IS THE FULLY RESTORED ADMIN UI ---
                            <div>
                            {!showHistory ? (
                                <>
                                {/* Today's View */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                    <h2 style={{ margin: 0, fontSize: '32px', color: '#1e293b' }}>Admin Dashboard</h2>
                                    <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '16px' }}>Today's Data - {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setShowHistory(true)} style={{ ...styles.button, width: 'auto', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <History size={20} /> View History
                                    </button>
                                    <button onClick={resetAuth} style={{ ...styles.button, width: 'auto', backgroundColor: '#64748b', color: 'white', padding: '14px 28px' }}>
                                        Logout
                                    </button>
                                    </div>
                                </div>

                                {/* Statistics Cards */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: window.innerWidth <= 480 
                            ? 'repeat(2, 1fr)' 
                            : window.innerWidth <= 768 
                            ? 'repeat(2, 1fr)' 
                            : 'repeat(auto-fit, minmax(240px, 1fr))', 
                          gap: window.innerWidth <= 480 ? '10px' : window.innerWidth <= 768 ? '16px' : '24px',
                          marginBottom: window.innerWidth <= 480 ? '24px' : '40px' 
                        }}>
                          <div style={{
                            ...styles.statCard,
                            ...(window.innerWidth <= 768 ? {
                              padding: window.innerWidth <= 480 ? '12px' : '16px',
                              gap: window.innerWidth <= 480 ? '10px' : '12px',
                            } : {})
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              ...(window.innerWidth <= 768 ? {
                                width: window.innerWidth <= 480 ? '40px' : '48px',
                                height: window.innerWidth <= 480 ? '40px' : '48px',
                              } : {})
                            }}>
                              <Users size={window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 32} color="#3b82f6" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                ...(window.innerWidth <= 480 ? { fontSize: '11px' } : {})
                              }}>Today's Registered / Paid</p>
                              <p style={{
                                ...styles.statValue,
                                ...(window.innerWidth <= 480 ? { fontSize: '18px' } : {})
                              }}>
                                {todayUsers.filter(u => isToday(u.timestamp)).length}/{todayUsers.filter(u => u.commitmentPaid).length}
                              </p>
                            </div>
                          </div>

                          <div style={{
                            ...styles.statCard,
                            ...(window.innerWidth <= 768 ? {
                              padding: window.innerWidth <= 480 ? '12px' : '16px',
                              gap: window.innerWidth <= 480 ? '10px' : '12px',
                            } : {})
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                              ...(window.innerWidth <= 768 ? {
                                width: window.innerWidth <= 480 ? '40px' : '48px',
                                height: window.innerWidth <= 480 ? '40px' : '48px',
                              } : {})
                            }}>
                              <Package size={window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 32} color="#ef4444" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                ...(window.innerWidth <= 480 ? { fontSize: '11px' } : {})
                              }}>Today's Orders</p>
                              <p style={{
                                ...styles.statValue,
                                ...(window.innerWidth <= 480 ? { fontSize: '18px' } : {})
                              }}>{todayOrders.length}</p>
                            </div>
                          </div>

                          <div style={{
                            ...styles.statCard,
                            ...(window.innerWidth <= 768 ? {
                              padding: window.innerWidth <= 480 ? '12px' : '16px',
                              gap: window.innerWidth <= 480 ? '10px' : '12px',
                            } : {})
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                              ...(window.innerWidth <= 768 ? {
                                width: window.innerWidth <= 480 ? '40px' : '48px',
                                height: window.innerWidth <= 480 ? '40px' : '48px',
                              } : {})
                            }}>
                              <DollarSign size={window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 32} color="#f59e0b" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                ...(window.innerWidth <= 480 ? { fontSize: '11px' } : {})
                              }}>Today's Revenue</p>
                              <p style={{
                                ...styles.statValue,
                                ...(window.innerWidth <= 480 ? { fontSize: '18px' } : {})
                              }}>
                                RM{(todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                                  todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div style={{
                            ...styles.statCard,
                            ...(window.innerWidth <= 768 ? {
                              padding: window.innerWidth <= 480 ? '12px' : '16px',
                              gap: window.innerWidth <= 480 ? '10px' : '12px',
                            } : {})
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                              ...(window.innerWidth <= 768 ? {
                                width: window.innerWidth <= 480 ? '40px' : '48px',
                                height: window.innerWidth <= 480 ? '40px' : '48px',
                              } : {})
                            }}>
                              <TrendingUp size={window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 32} color="#10b981" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                ...(window.innerWidth <= 480 ? { fontSize: '11px' } : {})
                              }}>Today's Profit</p>
                              <p style={{
                                ...styles.statValue,
                                ...(window.innerWidth <= 480 ? { fontSize: '18px' } : {})
                              }}>
                                RM{((todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                                  todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) - 
                                  (todayOrders.length > 0 ? 30 : 0))).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                                {/* Profit Breakdown with responsive text */}
                        <div style={styles.card}>
                          <h3 style={{ 
                            fontSize: window.innerWidth <= 480 ? '18px' : '22px', 
                            marginBottom: '20px' 
                          }}>
                            Today's Profit Calculation
                          </h3>
                          <div style={{ 
                            backgroundColor: '#f8fafc', 
                            padding: window.innerWidth <= 480 ? '16px' : '24px', 
                            borderRadius: '16px',
                            marginBottom: '24px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              marginBottom: '12px',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <span style={{ 
                                fontSize: window.innerWidth <= 480 ? '13px' : '16px',
                                lineHeight: '1.4'
                              }}>
                                Commitment Fees ({todayUsers.filter(u => u.commitmentPaid).length} × RM10):
                              </span>
                              <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: window.innerWidth <= 480 ? '13px' : '16px' 
                              }}>
                                +RM{(todayUsers.filter(u => u.commitmentPaid).length * 10).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              marginBottom: '12px',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <span style={{ 
                                fontSize: window.innerWidth <= 480 ? '13px' : '16px',
                                lineHeight: '1.4'
                              }}>
                                Delivery Fees:
                              </span>
                              <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: window.innerWidth <= 480 ? '13px' : '16px' 
                              }}>
                                +RM{todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              borderTop: '2px solid #e2e8f0',
                              paddingTop: '12px',
                              marginTop: '12px',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <span style={{ 
                                fontSize: window.innerWidth <= 480 ? '14px' : '16px',
                                lineHeight: '1.4'
                              }}>
                                Total Revenue:
                              </span>
                              <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: window.innerWidth <= 480 ? '14px' : '16px' 
                              }}>
                                RM{(todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                                  todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              marginTop: '12px',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <span style={{ 
                                fontSize: window.innerWidth <= 480 ? '13px' : '16px',
                                lineHeight: '1.4'
                              }}>
                                Driver Cost:
                              </span>
                              <span style={{ 
                                fontWeight: 'bold', 
                                color: '#dc2626', 
                                fontSize: window.innerWidth <= 480 ? '13px' : '16px' 
                              }}>
                                -RM{todayOrders.length > 0 ? '30.00' : '0.00'}
                              </span>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              borderTop: '2px solid #1e293b',
                              paddingTop: '12px',
                              marginTop: '12px',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <span style={{ 
                                fontSize: window.innerWidth <= 480 ? '16px' : '20px', 
                                fontWeight: 'bold',
                                lineHeight: '1.4'
                              }}>
                                Today's Profit:
                              </span>
                              <span style={{ 
                                fontSize: window.innerWidth <= 480 ? '16px' : '20px', 
                                fontWeight: 'bold', 
                                color: (todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                                      todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) - 
                                      (todayOrders.length > 0 ? 30 : 0)) >= 0 
                                      ? '#059669' : '#dc2626' 
                              }}>
                                RM{((todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                                    todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) - 
                                    (todayOrders.length > 0 ? 30 : 0)).toFixed(2))}
                              </span>
                            </div>
                          </div>
                        </div>
                      {/* --- ADD THIS NEW CARD --- */}
                        <div style={styles.card}>
                          <div style={styles.cardHeader}>
                            <UserCheck color="#f59e0b" size={28} />
                            <h2 style={styles.cardTitle}>Awaiting Order Submission</h2>
                          </div>
                          
                          {/* We now filter the 'todayUsers' array directly inside the JSX */}
                          {todayUsers.filter(user => user.commitmentPaid && !user.orderSubmitted).length > 0 ? (
                            <div style={{ 
                              display: 'grid', 
                              gap: '12px', 
                              marginTop: '16px',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                            }}>
                              {/* And we map over the freshly filtered array here */}
                              {todayUsers.filter(user => user.commitmentPaid && !user.orderSubmitted).map(user => (
                                <div key={user.id} style={{ 
                                  padding: '12px', 
                                  backgroundColor: '#fffbeb', 
                                  border: '1px solid #fef3c7', 
                                  borderRadius: '8px' 
                                }}>
                                  <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>{user.name}</p>
                                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#b45309' }}>{user.studentId}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ marginTop: '20px', color: '#64748b', textAlign: 'center' }}>
                              All paid users have submitted their orders for today.
                            </p>
                          )}
                        </div>
                        {/* --- END OF NEW CARD --- */}

                                {/* Charts */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: window.innerWidth <= 768 
                          ? '1fr' 
                          : 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: window.innerWidth <= 480 ? '12px' : '20px', 
                        marginBottom: '32px',
                        width: '100%',
                        overflow: 'hidden' // Prevent horizontal scroll
                      }}>

                        <SimpleChart
                          type="bar"
                          title="Today's Order Distribution by Amount"
                          data={[
                            { label: '<RM50', value: todayOrders.filter(o => o.orderTotal < 50).length, color: '#3b82f6' },
                            { label: 'RM50-100', value: todayOrders.filter(o => o.orderTotal >= 50 && o.orderTotal < 100).length, color: '#10b981' },
                            { label: 'RM100-150', value: todayOrders.filter(o => o.orderTotal >= 100 && o.orderTotal < 150).length, color: '#f59e0b' },
                            { label: '>RM150', value: todayOrders.filter(o => o.orderTotal >= 150).length, color: '#ef4444' }
                          ]}
                        />

                        <SimpleChart
                          type="pie"
                          title="Today's Revenue Breakdown"
                          data={[
                            { label: 'Commitment Fees', value: todayUsers.filter(u => u.commitmentPaid).length * 10 },
                            { label: 'Delivery Fees', value: todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) }
                          ]}
                        />
                      </div>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: '24px', 
                        marginBottom: '40px',
                        width: '100%',
                        overflow: 'hidden' // Prevent horizontal scroll
                      }}></div>

                      {/* Today's Orders Table */}
                      <div style={styles.card}>
                        <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Today's Orders</h3>
                        {todayOrders.length === 0 ? (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '60px',
                            color: '#64748b'
                          }}>
                            <AlertCircle size={56} style={{ marginBottom: '20px' }} />
                            <p style={{ fontSize: '18px' }}>No orders for today yet.</p>
                          </div>
                        ) : (
                          <ResponsiveTable
                            headers={['Order #', 'Photo', 'Customer', 'Student ID', 'Order Total', 
                            'Delivery Fee', 'Total', 'Time']}
                            onImageClick={(imageUrl) => setSelectedImage(imageUrl)} // Add this prop to handle clicks
                            data={todayOrders.map((order, index) => [
                                order.orderNumber,
                                // Add this new object for the image cell
                                { type: 'image', value: order.orderImageURL }, 
                                order.userName,
                                order.studentId,
                                `RM${order.orderTotal}`,
                                `RM${order.deliveryFee}`,
                                `RM${order.totalWithDelivery}`,
                                new Date(order.timestamp).toLocaleString()
                            ])}
                        />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* History View */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '32px', color: '#1e293b' }}>History Overview</h2>
                          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '16px' }}>
                            All-time data and analytics
                          </p>
                        </div>
                        <button
                          onClick={() => setShowHistory(false)}
                          style={{
                            ...styles.button,
                            width: 'auto',
                            backgroundColor: '#64748b',
                            color: 'white',
                            padding: '14px 28px'
                          }}
                        >
                          Back to Today
                        </button>
                      </div>

                      {/* History Statistics - Responsive */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: window.innerWidth <= 480 
                            ? 'repeat(2, 1fr)' 
                            : window.innerWidth <= 768 
                            ? 'repeat(2, 1fr)' 
                            : 'repeat(auto-fit, minmax(200px, 1fr))', 
                          gap: window.innerWidth <= 480 ? '8px' : window.innerWidth <= 768 ? '12px' : '20px',
                          marginBottom: window.innerWidth <= 480 ? '24px' : '32px' 
                        }}>
                          <div style={{
                            ...styles.statCard,
                            padding: window.innerWidth <= 480 ? '12px' : window.innerWidth <= 768 ? '16px' : '24px',
                            gap: window.innerWidth <= 480 ? '8px' : '12px'
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              width: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px',
                              height: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px'
                            }}>
                              <Users size={window.innerWidth <= 480 ? 16 : window.innerWidth <= 768 ? 20 : 28} color="#3b82f6" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                fontSize: window.innerWidth <= 480 ? '10px' : '12px'
                              }}>Total Registered</p>
                              <p style={{
                                ...styles.statValue,
                                fontSize: window.innerWidth <= 480 ? '16px' : window.innerWidth <= 768 ? '20px' : '24px'
                              }}>{getTotalHistoryStats().totalRegistered}</p>
                            </div>
                          </div>

                          <div style={{
                            ...styles.statCard,
                            padding: window.innerWidth <= 480 ? '12px' : window.innerWidth <= 768 ? '16px' : '24px',
                            gap: window.innerWidth <= 480 ? '8px' : '12px'
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                              width: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px',
                              height: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px'
                            }}>
                              <Package size={window.innerWidth <= 480 ? 16 : window.innerWidth <= 768 ? 20 : 28} color="#ef4444" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                fontSize: window.innerWidth <= 480 ? '10px' : '12px'
                              }}>Total Orders</p>
                              <p style={{
                                ...styles.statValue,
                                fontSize: window.innerWidth <= 480 ? '16px' : window.innerWidth <= 768 ? '20px' : '24px'
                              }}>{getTotalHistoryStats().totalOrders}</p>
                            </div>
                          </div>

                          <div style={{
                            ...styles.statCard,
                            padding: window.innerWidth <= 480 ? '12px' : window.innerWidth <= 768 ? '16px' : '24px',
                            gap: window.innerWidth <= 480 ? '8px' : '12px'
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                              width: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px',
                              height: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px'
                            }}>
                              <DollarSign size={window.innerWidth <= 480 ? 16 : window.innerWidth <= 768 ? 20 : 28} color="#f59e0b" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                fontSize: window.innerWidth <= 480 ? '10px' : '12px'
                              }}>Total Revenue</p>
                              <p style={{
                                ...styles.statValue,
                                fontSize: window.innerWidth <= 480 ? '16px' : window.innerWidth <= 768 ? '20px' : '24px'
                              }}>
                                RM{getTotalHistoryStats().totalRevenue.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div style={{
                            ...styles.statCard,
                            padding: window.innerWidth <= 480 ? '12px' : window.innerWidth <= 768 ? '16px' : '24px',
                            gap: window.innerWidth <= 480 ? '8px' : '12px'
                          }}>
                            <div style={{ 
                              ...styles.statIcon, 
                              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                              width: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px',
                              height: window.innerWidth <= 480 ? '32px' : window.innerWidth <= 768 ? '40px' : '56px'
                            }}>
                              <TrendingUp size={window.innerWidth <= 480 ? 16 : window.innerWidth <= 768 ? 20 : 28} color="#10b981" />
                            </div>
                            <div style={styles.statContent}>
                              <p style={{
                                ...styles.statLabel,
                                fontSize: window.innerWidth <= 480 ? '10px' : '12px'
                              }}>Total Profit</p>
                              <p style={{
                                ...styles.statValue,
                                fontSize: window.innerWidth <= 480 ? '16px' : window.innerWidth <= 768 ? '20px' : '24px'
                              }}>
                                RM{getTotalHistoryStats().totalProfit.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                      {/* History Charts */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: window.innerWidth <= 768 
                          ? '1fr' 
                          : 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: window.innerWidth <= 480 ? '12px' : '20px', 
                        marginBottom: '32px',
                        width: '100%',
                        overflow: 'hidden' // Prevent horizontal scroll
                      }}>
                        <SimpleChart
                          type="bar"
                          title="Daily Orders Trend (Last 7 Days)"
                          data={historyData.slice(0, 7).reverse().map(entry => ({
                            label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            value: entry.totalOrders || 0,
                            color: '#3b82f6'
                          }))}
                        />

                        <SimpleChart
                          type="bar"
                          title="Daily Profit Trend (Last 7 Days)"
                          data={historyData.slice(0, 7).reverse().map(entry => ({
                            label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            value: entry.profit || 0,
                            color: entry.profit >= 0 ? '#10b981' : '#ef4444'
                          }))}
                        />
                      </div>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: window.innerWidth <= 768 
                          ? '1fr' 
                          : 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: window.innerWidth <= 480 ? '12px' : '20px', 
                        marginBottom: '32px',
                        width: '100%',
                        overflow: 'hidden' // Prevent horizontal scroll
                      }}>
                        <SimpleChart
                          type="bar"
                          title="Monthly Order Trends"
                          data={(() => {
                            const monthlyData = {};
                            historyData.forEach(entry => {
                              const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                              if (!monthlyData[month]) {
                                monthlyData[month] = 0;
                              }
                              monthlyData[month] += entry.totalOrders || 0;
                            });
                            
                            return Object.entries(monthlyData)
                              .slice(-6) // Last 6 months
                              .map(([month, orders]) => ({
                                label: month,
                                value: orders,
                                color: '#3b82f6'
                              }));
                          })()}
                        />

                        <SimpleChart
                          type="bar"
                          title="Monthly Profit Trends"
                          data={(() => {
                            const monthlyData = {};
                            historyData.forEach(entry => {
                              const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                              if (!monthlyData[month]) {
                                monthlyData[month] = 0;
                              }
                              monthlyData[month] += entry.profit || 0;
                            });
                            
                            return Object.entries(monthlyData)
                              .slice(-6) // Last 6 months
                              .map(([month, profit]) => ({
                                label: month,
                                value: profit,
                                color: profit >= 0 ? '#10b981' : '#ef4444'
                              }));
                          })()}
                        />
                      </div>

                      {/* History Table */}
                      <div style={styles.card}>
                        <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Daily History</h3>
                        {historyData.length === 0 ? (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '60px',
                            color: '#64748b'
                          }}>
                            <History size={56} style={{ marginBottom: '20px' }} />
                            <p style={{ fontSize: '18px' }}>No history data available yet.</p>
                          </div>
                        ) : (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '20px'
                          }}>
                            {historyData.map((entry, index) => (
                              <div key={index} style={{
                                backgroundColor: '#f8fafc',
                                border: '2px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '24px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                ':hover': {
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                  transform: 'translateY(-4px)'
                                }
                              }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '20px'
                                }}>
                                  <h4 style={{ 
                                    margin: 0, 
                                    fontSize: '18px', 
                                    color: '#1e293b',
                                    fontWeight: '600'
                                  }}>
                                    {new Date(entry.date).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </h4>
                                  <span style={{
                                    backgroundColor: entry.profit >= 0 ? '#d1fae5' : '#fee2e2',
                                    color: entry.profit >= 0 ? '#065f46' : '#991b1b',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}>
                                    {entry.profit >= 0 ? 'Profit' : 'Loss'}
                                  </span>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px'
                                  }}>
                                    <span style={{ color: '#64748b', fontSize: '14px' }}>Orders</span>
                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{entry.totalOrders || 0}</span>
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px'
                                  }}>
                                    <span style={{ color: '#64748b', fontSize: '14px' }}>Revenue</span>
                                    <span style={{ fontWeight: '600', color: '#059669' }}>
                                      RM{(entry.totalRevenue || 0).toFixed(2)}
                                    </span>
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    backgroundColor: entry.profit >= 0 ? '#f0fdf4' : '#fef2f2',
                                    borderRadius: '8px',
                                    border: `2px solid ${entry.profit >= 0 ? '#86efac' : '#fecaca'}`
                                  }}>
                                    <span style={{ 
                                      color: entry.profit >= 0 ? '#047857' : '#991b1b', 
                                      fontSize: '14px',
                                      fontWeight: '600'
                                    }}>
                                      Profit
                                    </span>
                                    <span style={{ 
                                      fontWeight: 'bold', 
                                      color: entry.profit >= 0 ? '#047857' : '#991b1b'
                                    }}>
                                      RM{(entry.profit || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

                {/* Driver Portal */}
        {activeTab === 'driver' && (
          <>
            {!isAuthenticated ? (
              <AuthScreen title="Driver Portal" onAuth={handleAuthentication} styles={styles} />
            ) : (
              <div>
                {(loadingUsers || loadingOrders) ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    marginBottom: '32px'
                  }}>
                    <Loader2 size={56} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '24px', color: '#64748b', fontSize: '18px' }}>Loading driver data...</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '32px',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '32px', color: '#1e293b' }}>Driver Portal</h2>
                        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '16px' }}>
                          Pickup Date: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={resetAuth}
                        style={{
                          ...styles.button,
                          width: 'auto',
                          backgroundColor: '#64748b',
                          color: 'white',
                          padding: '14px 28px'
                        }}
                      >
                        Logout
                      </button>
                    </div>

                    {/* Summary Cards */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: window.innerWidth <= 480 
                          ? '1fr' 
                          : window.innerWidth <= 768 
                          ? 'repeat(2, 1fr)' 
                          : 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: window.innerWidth <= 480 ? '10px' : window.innerWidth <= 768 ? '16px' : '24px',
                        marginBottom: window.innerWidth <= 480 ? '24px' : '40px' 
                      }}>
                        <div style={{
                          ...styles.statCard,
                          ...(window.innerWidth <= 768 ? {
                            padding: window.innerWidth <= 480 ? '12px' : '16px',
                            gap: window.innerWidth <= 480 ? '10px' : '12px',
                          } : {})
                        }}>
                          <div style={{ 
                            ...styles.statIcon, 
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            ...(window.innerWidth <= 768 ? {
                              width: window.innerWidth <= 480 ? '40px' : '48px',
                              height: window.innerWidth <= 480 ? '40px' : '48px',
                            } : {})
                          }}>
                            <Package size={window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 32} color="#ef4444" />
                          </div>
                          <div style={styles.statContent}>
                            <p style={{
                              ...styles.statLabel,
                              ...(window.innerWidth <= 480 ? { fontSize: '11px' } : {})
                            }}>Total Orders</p>
                            <p style={{
                              ...styles.statValue,
                              ...(window.innerWidth <= 480 ? { fontSize: '18px' } : {})
                            }}>{todayOrders.length}</p>
                          </div>
                        </div>

                        <div style={{
                          ...styles.statCard,
                          ...(window.innerWidth <= 768 ? {
                            padding: window.innerWidth <= 480 ? '12px' : '16px',
                            gap: window.innerWidth <= 480 ? '10px' : '12px',
                          } : {})
                        }}>
                          <div style={{ 
                            ...styles.statIcon, 
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            ...(window.innerWidth <= 768 ? {
                              width: window.innerWidth <= 480 ? '40px' : '48px',
                              height: window.innerWidth <= 480 ? '40px' : '48px',
                            } : {})
                          }}>
                            <Clock size={window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 32} color="#3b82f6" />
                          </div>
                          <div style={styles.statContent}>
                            <p style={{
                              ...styles.statLabel,
                              ...(window.innerWidth <= 480 ? { fontSize: '11px' } : {})
                            }}>Pickup Time</p>
                            <p style={{
                              ...styles.statValue,
                              ...(window.innerWidth <= 480 ? { fontSize: '18px' } : {})
                            }}>7:00 PM</p>
                          </div>
                        </div>

                        <div style={{
                          ...styles.statCard,
                          ...(window.innerWidth <= 768 ? {
                            padding: window.innerWidth <= 480 ? '12px' : '16px',
                            gap: window.innerWidth <= 480 ? '10px' : '12px',
                          } : {})
                        }}>
                          <div style={{ 
                            ...styles.statIcon, 
                            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                            ...(window.innerWidth <= 768 ? {
                              width: window.innerWidth <= 480 ? '40px' : '48px',
                              height: window.innerWidth <= 480 ? '40px' : '48px',
                            } : {})
                          }}>
                            <Calendar size={window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 24 : 32} color="#10b981" />
                          </div>
                          <div style={styles.statContent}>
                            <p style={{
                              ...styles.statLabel,
                              ...(window.innerWidth <= 480 ? { fontSize: '11px' } : {})
                            }}>Date</p>
                            <p style={{
                              ...styles.statValue,
                              ...(window.innerWidth <= 480 ? { fontSize: '18px' } : {})
                            }}>{new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                    {/* Updated Order Boxes Grid */}
                    <div style={styles.card}>
                      <div style={styles.cardHeader}>
                        <Truck color="#ea580c" size={28} />
                        <h2 style={styles.cardTitle}>Today's Orders</h2>
                      </div>

                      {todayOrders.length === 0 ? (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '60px',
                          color: '#64748b'
                        }}>
                          <Clock size={56} style={{ marginBottom: '20px' }} />
                          <p style={{ fontSize: '18px' }}>No orders for today yet.</p>
                        </div>
                      ) : (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                          gap: '16px',
                          '@media (max-width: 768px)': {
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
                          },
                          '@media (max-width: 480px)': {
                            gridTemplateColumns: '1fr'
                          }
                        }}>
                          {todayOrders.map((order, index) => (
                            <div key={order.id || index} style={{
                              padding: '16px',
                              border: '2px solid #e2e8f0',
                              borderRadius: '12px',
                              backgroundColor: '#f8fafc',
                              transition: 'all 0.2s',
                              ':hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                flexWrap: 'wrap',
                                gap: '8px'
                              }}>
                                <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                                  Order #{index + 1} - {order.userName}
                                </h4>
                                <span style={{
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  padding: '6px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}>
                                  {order.orderNumber}
                                </span>
                              </div>
                              
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                                marginBottom: '16px'
                              }}>
                                <div>
                                  <p style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Order Total</p>
                                  <p style={{ margin: '0', fontWeight: '600', fontSize: '16px', color: '#059669' }}>
                                    RM{order.orderTotal}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Student ID</p>
                                  <p style={{ margin: '0', fontWeight: '600', fontSize: '16px' }}>{order.studentId}</p>
                                </div>
                              </div>
                              
                              {order.orderImageURL && (
                                <button
                                  onClick={() => setSelectedImage(order.orderImageURL)}
                                  style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    ':hover': {
                                      backgroundColor: '#2563eb'
                                    }
                                  }}
                                >
                                  <Camera size={18} />
                                  View Order Photo
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;