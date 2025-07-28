import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import logoForAnimation from './assets/logo(1).png';

// Import services and utils
import * as firebaseService from './services/firebase';
import { isToday } from './utils/isToday';

// Import all UI components
import Navigation from './components/Navigation';
import LoadingAnimation from './components/LoadingAnimation';
import SuccessAnimation from './components/SuccessAnimation';
import WaitingPage from './components/WaitingPage';
import ImageModal from './components/ImageModal';
import ScanConfirmationModal from './components/ScanConfirmationModal';
import LandingPage from './components/LandingPage';
import EmailPromptModal from './components/EmailPromptModal';

// Import new tab components
import StudentTab from './components/StudentTab';
import AdminTab from './components/AdminTab';
import DriverTab from './components/DriverTab';

function App() {
  // Main app state
  const [activeTab, setActiveTab] = useState('student');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showMainApp, setShowMainApp] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
  
  // Data state
  const [prebookUsers, setPrebookUsers] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [todayUsers, setTodayUsers] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [minOrderReached, setMinOrderReached] = useState(false);
  const [systemActivatedToday, setSystemActivatedToday] = useState(false);
  
  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Global UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successConfig, setSuccessConfig] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [showScanConfirmation, setShowScanConfirmation] = useState(false);
  const [scannedData, setScannedData] = useState({ orderNumber: '', orderTotal: '' });
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [registrationOrder, setRegistrationOrder] = useState([]);
  const [transitionConfig, setTransitionConfig] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
  const [userForEmail, setUserForEmail] = useState(null);

  // Reset function state
  const [resetStudentForm, setResetStudentForm] = useState(null);

  const ADMIN_PASSCODE = 'byyc';

  // Styles
  const styles = {
    container: { 
      minHeight: '100vh', 
      paddingTop: showMainApp ? '90px' : '0' 
    },
    maxWidth: { 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '0 20px', 
      width: '100%', 
      boxSizing: 'border-box' 
    }
  };

  // Data fetching and filtering
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
      setLoadingUsers(true); 
      setLoadingOrders(true); 
      setLoadingHistory(true);
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
      setLoadingUsers(false); 
      setLoadingOrders(false); 
      setLoadingHistory(false);
    }
  }, [filterTodayData]);

  // Global UI handlers
  const handleNavigateWithTransition = (config, navigationAction) => {
    setTransitionConfig(config);
    setTimeout(() => {
        navigationAction();
        setTransitionConfig(null);
    }, 1600); // Total animation duration
  };
  
  const showSuccessAnimation = (title, message, additionalInfo = null, duration = 2000, showOkButton = true, onCloseCallback = null) => {
    setSuccessConfig({ title, message, additionalInfo, duration, showOkButton, onClose: onCloseCallback });
    setShowSuccess(true);
  };

  const showLoadingAnimation = (message) => { 
    setLoadingMessage(message); 
    setIsLoading(true); 
  };
  
  const hideLoadingAnimation = () => { 
    setIsLoading(false); 
    setLoadingMessage(''); 
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

  const handleScanConfirmation = (confirmed, orderImage) => {
    if (confirmed) {
      setShowScanConfirmation(false);
      showSuccessAnimation('Scan Successful!', 'Order details have been filled automatically.', null, 1500, true);
    } else {
      setShowScanConfirmation(false);
    }
  };

  const handleLandingStart = (vendor) => {
    const startConfig = { background: '#ffffff' };
    handleNavigateWithTransition(startConfig, () => {
        setSelectedVendor(vendor);
        setShowLandingPage(false);
        setShowMainApp(true);
    });
  };

    const handleNavigateToPortal = (portalName) => {
    const startConfig = { background: '#ffffff' };
    handleNavigateWithTransition(startConfig, () => {
        resetAuth();
        setSelectedVendor(''); // <-- ADD THIS LINE
        setShowLandingPage(false);
        setShowMainApp(true);
        setActiveTab(portalName);
    });
  };

  const handleNavigationHome = () => {
    const homeConfig = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    handleNavigateWithTransition(homeConfig, () => {
        setShowLandingPage(true);
        setShowMainApp(false);
        setActiveTab('student');
        if (resetStudentForm) {
          resetStudentForm();
        }
    });
  };

    // ADD THIS NEW, SMARTER FUNCTION
  const handleTabNavigation = (tabName) => {
    // This is the core logic: if the user tries to go to the student tab
    // without having selected a vendor...
    if (tabName === 'student' && !selectedVendor) {
      // ...interrupt the action and send them back to the landing page.
      handleNavigationHome();
      return; // Stop the function here.
    }

    // For any other case (or if a vendor IS selected for the student tab)
    // proceed as normal. This also centralizes the auth reset logic.
    if (tabName === 'admin' || tabName === 'driver') {
      resetAuth();
    }
    setActiveTab(tabName);
  };

  const handleCloseWaitingPage = () => {
    setOrderConfirmed(false);
    setCurrentOrder(null);
    if (resetStudentForm) {
      resetStudentForm();
    }
    fetchAllData();
  };

  // Effects
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
        localStorage.removeItem(`selectedVendor-${lastAccessDate}`);
        setSelectedVendor('');
        setShowLandingPage(true);
        setShowMainApp(false);
        // ...reset other states...
        fetchAllData();
      }
    };
    checkForNewDay();
    const interval = setInterval(checkForNewDay, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData, resetStudentForm]);

  useEffect(() => {
    if (showMainApp) {
      fetchAllData();
    }
  }, [fetchAllData, showMainApp]);

  useEffect(() => {
    if (selectedVendor) {
      localStorage.setItem(`selectedVendor-${new Date().toDateString()}`, selectedVendor);
    }
  }, [selectedVendor]);

  // Shared props for child components
  const sharedProps = {
    prebookUsers, todayOrders, todayUsers, historyData, minOrderReached, systemActivatedToday,
    registrationOrder, loadingUsers, loadingOrders, loadingHistory, windowWidth,
    showSuccessAnimation, showLoadingAnimation, hideLoadingAnimation, fetchAllData,
    setSelectedImage, setShowScanConfirmation, setScannedData, setOrderConfirmed, setCurrentOrder, selectedVendor
  };


    const handleEmailSubmit = async (userId, email) => {
    showLoadingAnimation('Saving your email...');
    try {
      await firebaseService.updateUserEmail(userId, email);
      setShowEmailModal(false); // Close the modal
      setOrderConfirmed(true); // Now show the waiting page
    } catch (error) {
      alert('Failed to save email. Please try again.');
    } finally {
      hideLoadingAnimation();
    }
  };
  
  // NEW STYLES for the "Gate" Animation
  const gateAnimationStyles = `
    /* --- KEYFRAMES --- */
    @keyframes gateCloseLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes gateCloseRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes gateOpenLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } }
    @keyframes gateOpenRight { from { transform: translateX(0); } to { transform: translateX(100%); } }

    @keyframes logoFadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes logoFadeOut {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to   { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}

    /* --- MAIN OVERLAY CONTAINER --- */
    .gate-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      overflow: hidden;
    }
    .gate-overlay.is-active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    /* --- THE GATE DOORS --- */
    .gate-half {
      position: absolute;
      top: 0;
      width: 50.5%;
      height: 100%;
      background-color: #1f2937;
    }
    .gate-half.left { left: 0; }
    .gate-half.right { right: 0; }

    /* --- THE LOGO --- */
    .gate-logo-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border-radius: 50%;
      padding: 25px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .gate-logo {
      display: block;
      width: 150px;
      height: 150px;
    }

    /* --- APPLYING THE ANIMATIONS IN SEQUENCE --- */
    .gate-overlay.is-active .gate-half.left {
      animation: gateCloseLeft 0.8s cubic-bezier(0.83, 0, 0.17, 1) forwards,
                 gateOpenLeft 0.8s cubic-bezier(0.83, 0, 0.17, 1) 0.8s forwards;
    }
    .gate-overlay.is-active .gate-half.right {
      animation: gateCloseRight 0.8s cubic-bezier(0.83, 0, 0.17, 1) forwards,
                 gateOpenRight 0.8s cubic-bezier(0.83, 0, 0.17, 1) 0.8s forwards;
    }
    .gate-overlay.is-active .gate-logo-container {
      animation: logoFadeIn 0.8s cubic-bezier(0.83, 0, 0.17, 1) forwards,
                 logoFadeOut 0.8s cubic-bezier(0.83, 0, 0.17, 1) 0.8s forwards;
    }
  `;

  const GateTransitionOverlay = ({ config }) => {
    if (!config) return null;

    return (
      <div 
        className="gate-overlay is-active" 
        style={{ background: config.background }}
      >
        <div className="gate-half left"></div>
        <div className="gate-half right"></div>
        <div className="gate-logo-container">
          <img src={logoForAnimation} alt="Loading..." className="gate-logo" />
        </div>
      </div>
    );
  };
  
  // Show landing page
  if (showLandingPage) {
    return (
      <>
        <style>{gateAnimationStyles}</style>
        <GateTransitionOverlay config={transitionConfig} />
        {isLoading && <LoadingAnimation message={loadingMessage} />}
        {showSuccess && ( <SuccessAnimation {...successConfig} onClose={() => setShowSuccess(false)} /> )}
        <LandingPage 
          onStart={handleLandingStart}
          onNavigateToPortal={handleNavigateToPortal} 
          windowWidth={windowWidth}
        />
      </>
    );
  }

  // Show main app with navigation and tabs
  return (
    <div style={styles.container}>
      <style>{gateAnimationStyles}</style>
      <GateTransitionOverlay config={transitionConfig} />
        <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabNavigation} // <-- USE THE NEW PROP
        onHome={handleNavigationHome}
        selectedVendor={selectedVendor}
        isTransitioning={!!transitionConfig} 
        windowWidth={windowWidth}
      />
      {isLoading && <LoadingAnimation message={loadingMessage} />}
      {showSuccess && (
        <SuccessAnimation 
          {...successConfig} 
          onClose={() => { 
            setShowSuccess(false); 
            if (successConfig.onClose) successConfig.onClose(); 
          }} 
        />
      )}
      {orderConfirmed && ( <WaitingPage onClose={handleCloseWaitingPage} currentOrder={currentOrder} /> )}
      {selectedImage && ( <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} /> )}
      {showScanConfirmation && ( <ScanConfirmationModal scannedData={scannedData} onConfirm={handleScanConfirmation} windowWidth={windowWidth} /> )}
      
      {/* ADD THIS ENTIRE BLOCK */}
      {showEmailModal && (
        <EmailPromptModal
          user={userForEmail}
          onSubmit={handleEmailSubmit}
          onCancel={() => {
            setShowEmailModal(false);
            setOrderConfirmed(true); // User can skip, just show waiting page
          }}
        />
      )}
      <div style={styles.maxWidth}>
        {activeTab === 'student' && ( <StudentTab {...sharedProps} setResetStudentForm={setResetStudentForm} setShowEmailModal={setShowEmailModal} setUserForEmail={setUserForEmail}/> )}
        {activeTab === 'admin' && ( <AdminTab {...sharedProps} isAuthenticated={isAuthenticated} onAuth={handleAuthentication} resetAuth={resetAuth} /> )}
        {activeTab === 'driver' && ( <DriverTab {...sharedProps} isAuthenticated={isAuthenticated} onAuth={handleAuthentication} resetAuth={resetAuth} /> )}
      </div>
    </div>
  );
}

export default App;