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
import { Users, CheckCircle, Package, Clock, Calendar, AlertCircle, Camera, Truck, UserCheck, History, DollarSign, TrendingUp, Receipt } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('student');
    const [prebookUsers, setPrebookUsers] = useState([]);
    const [orders, setOrders] = useState([]);
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
    const isFourthUser = currentOrder ? (currentOrder.order === 4) : (currentUserIndex === 3);

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

    const filterTodayData = useCallback((orders = [], users = []) => {
        const todayOrdersFiltered = orders.filter(order => isToday(order.timestamp));
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
            setOrders(ordersData);
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
            await firebaseService.savePrebookUser(newUser);
            await fetchAllData(); // Refetch all data to ensure state is perfectly synced
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
        const isFourthUser = userOrder ? userOrder.order === 4 : currentUserIndex === 3;
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
            await fetchAllData();
            hideLoadingAnimation();
            const paidCount = prebookUsers.filter(u => u.commitmentPaid).length;
            if (paidCount >= 3 || isFourthUser) {
                showSuccessAnimation(isFourthUser ? 'Processing Complete!' : 'Payment Confirmed!', isFourthUser ? 'As the 4th registrant, you can proceed without payment!' : 'Your RM10 commitment fee has been received.', <p>You can now submit your order!</p>, 2500, true, () => setUserStep(3));
            } else {
                const remaining = 3 - paidCount;
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
                                    <p style={{ margin: 0 }}><strong>Commitment Fee:</strong> {currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4) ? 'FREE (4th user!)' : 'RM10'}</p>
                                </div>
                                {!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && (
                                    <>
                                        <p style={{ marginBottom: '16px', color: '#64748b' }}>Upload proof of payment (RM10 commitment fee):</p>
                                        <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files[0])} style={styles.input} />
                                        {receiptFile && <div style={{ marginBottom: '20px', textAlign: 'center' }}><img src={URL.createObjectURL(receiptFile)} alt="Payment Receipt" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /></div>}
                                    </>
                                )}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={handleCommitmentPayment} disabled={!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && !receiptFile} style={{ ...styles.button, ...styles.buttonBlue, opacity: (!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && !receiptFile) ? 0.5 : 1, cursor: (!(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && !receiptFile) ? 'not-allowed' : 'pointer' }}>
                                        {(currentUserIndex >= 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) ? 'Continue (Free)' : 'Submit Payment'}
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
                        {!isAuthenticated ? <AuthScreen title="Admin Dashboard" onAuth={handleAuthentication} styles={styles} /> : (
                            <div>
                                {(loadingUsers || loadingOrders || loadingHistory) ? <div style={{ textAlign: 'center', padding: '60px' }}><LoadingAnimation message="Loading dashboard data..." /></div> : (
                                    <div>
                                        {/* Paste the entire JSX for the Admin Portal here */}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'driver' && (
                     <>
                        {!isAuthenticated ? <AuthScreen title="Driver Portal" onAuth={handleAuthentication} styles={styles} /> : (
                            <div>
                                {(loadingUsers || loadingOrders) ? <div style={{ textAlign: 'center', padding: '60px' }}><LoadingAnimation message="Loading driver data..." /></div> : (
                                    <div>
                                       {/* Paste the entire JSX for the Driver Portal here */}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;