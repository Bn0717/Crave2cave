import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import logoForAnimation from './assets/logo(1).png';
import * as firebaseService from './services/firebase';
import { isToday } from './utils/isToday';
import Navigation from './components/Navigation';
import LoadingAnimation from './components/LoadingAnimation';
import SuccessAnimation from './components/SuccessAnimation';
import WaitingPage from './components/WaitingPage';
import ImageModal from './components/ImageModal';
import LandingPage from './components/LandingPage';
import EmailPromptModal from './components/EmailPromptModal';
import StudentTab from './components/StudentTab';
import AdminTab from './components/AdminTab';
import DriverTab from './components/DriverTab';

function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
const [isDriverAuthenticated, setIsDriverAuthenticated] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showMainApp, setShowMainApp] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [prebookUsers, setPrebookUsers] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [todayUsers, setTodayUsers] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [minOrderReached, setMinOrderReached] = useState(false);
  const [systemActivatedToday, setSystemActivatedToday] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successConfig, setSuccessConfig] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [registrationOrder, setRegistrationOrder] = useState([]);
  const [transitionConfig, setTransitionConfig] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userForEmail, setUserForEmail] = useState(null);
  const [resetStudentForm, setResetStudentForm] = useState(null);
  const [rememberedStudent, setRememberedStudent] = useState(null);

  const ADMIN_PASSCODE = 'byyc';
const DRIVER_PASSCODE = 'kyuem';

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

  const handleNavigateWithTransition = (config, navigationAction) => {
    setTransitionConfig(config);
    setTimeout(() => {
      navigationAction();
      setTransitionConfig(null);
    }, 1600);
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

  const handleAuthentication = (passcodeAttempt, tabType) => {
  if (tabType === 'admin' && passcodeAttempt === ADMIN_PASSCODE) {
    localStorage.setItem('isAdminAuthenticated', 'true');
    setIsAdminAuthenticated(true);
  } else if (tabType === 'driver' && passcodeAttempt === DRIVER_PASSCODE) {
    localStorage.setItem('isDriverAuthenticated', 'true');
    setIsDriverAuthenticated(true);
  } else {
    alert('Invalid passcode');
  }
};

  const resetAuth = () => {
  if (window.confirm("Are you sure you want to log out?")) {
    setIsAdminAuthenticated(false);
    setIsDriverAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('isDriverAuthenticated');
    setActiveTab('student');
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
      setSelectedVendor('');
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

  const handleTabNavigation = (tabName) => {
    if (tabName === 'student' && !selectedVendor) {
      handleNavigationHome();
      return;
    }
    setActiveTab(tabName);
  };

  const handleCloseWaitingPage = () => {
  setOrderConfirmed(false);
  setCurrentOrder(null);
  
  // Clear the student session when order is completed
  localStorage.removeItem('rememberedStudent');
  setRememberedStudent(null);
  
  if (resetStudentForm) {
    resetStudentForm(true); // Pass true to clear session
  }
  fetchAllData();
};

  const handleEmailSubmit = async (userId, email) => {
  showLoadingAnimation('Saving your email...');
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    await firebaseService.updateUserEmail(userId, email);

    setShowEmailModal(false);

    showSuccessAnimation(
      'Order Confirmed!',
      'Your order has been submitted successfully. You will receive a confirmation email once the driver starts delivering your order.',
      null,
      4000,
      true,
      () => {
        setOrderConfirmed(true);
      }
    );
  } catch (error) {
    console.error('Failed to save email:', error);
    showSuccessAnimation(
      'Email Save Failed',
      `Failed to save your email: ${error.message}`,
      null,
      3000,
      true
    );
  } finally {
    hideLoadingAnimation();
  }
};


  useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  // Existing admin/driver auth check
  // Enhanced admin/driver auth check - PERMANENT
  const adminAuth = localStorage.getItem('isAdminAuthenticated');
  const driverAuth = localStorage.getItem('isDriverAuthenticated');
  if (adminAuth === 'true') {
    setIsAdminAuthenticated(true);
    setActiveTab('admin'); // Auto-switch to admin tab
  }
  if (driverAuth === 'true') {
    setIsDriverAuthenticated(true);
    setActiveTab('driver'); // Auto-switch to driver tab
  }
  
  // ADD THIS: Student session check
  const savedStudent = localStorage.getItem('rememberedStudent');
  if (savedStudent) {
    try {
      setRememberedStudent(JSON.parse(savedStudent));
    } catch (error) {
      console.error('Error parsing saved student data:', error);
      localStorage.removeItem('rememberedStudent');
    }
  }
  
  return () => window.removeEventListener('resize', handleResize);
}, []);

  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date();
      const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
      const lastAccessDate = localStorage.getItem('lastAccessDate');
      const todayMalaysia = malaysiaTime.toDateString();
      if (lastAccessDate !== todayMalaysia) {
  localStorage.setItem('lastAccessDate', todayMalaysia);
  localStorage.removeItem(`selectedVendor-${lastAccessDate}`);
  
  
  // Only clear student session on new day
  localStorage.removeItem('rememberedStudent');
  setRememberedStudent(null);
  
  setSelectedVendor('');
  setShowLandingPage(true);
  setShowMainApp(false);
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

  const sharedProps = {
    prebookUsers,
    todayOrders,
    todayUsers,
    historyData,
    minOrderReached,
    systemActivatedToday,
    registrationOrder,
    loadingUsers,
    loadingOrders,
    loadingHistory,
    windowWidth,
    showSuccessAnimation,
    showLoadingAnimation,
    hideLoadingAnimation,
    fetchAllData,
    setSelectedImage,
    setOrderConfirmed,
    setCurrentOrder,
    selectedVendor,
    setShowEmailModal,
    setUserForEmail,
    rememberedStudent,
  setRememberedStudent,
  };

  const gateAnimationStyles = `
    @keyframes gateCloseLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes gateCloseRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes gateOpenLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } }
    @keyframes gateOpenRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
    @keyframes logoFadeIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes logoFadeOut {
      from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
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
    .gate-half {
      position: absolute;
      top: 0;
      width: 50.5%;
      height: 100%;
      background-color: #1f2937;
    }
    .gate-half.left { left: 0; }
    .gate-half.right { right: 0; }
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
      <div className="gate-overlay is-active" style={{ background: config.background }}>
        <div className="gate-half left"></div>
        <div className="gate-half right"></div>
        <div className="gate-logo-container">
          <img src={logoForAnimation} alt="Loading..." className="gate-logo" />
        </div>
      </div>
    );
  };

  if (showLandingPage) {
    return (
      <>
        <style>{gateAnimationStyles}</style>
        <GateTransitionOverlay config={transitionConfig} />
        {isLoading && <LoadingAnimation message={loadingMessage} />}
        {showSuccess && <SuccessAnimation {...successConfig} onClose={() => setShowSuccess(false)} />}
        <LandingPage 
          onStart={handleLandingStart}
          onNavigateToPortal={handleNavigateToPortal} 
          windowWidth={windowWidth}
        />
      </>
    );
  }

  return (
    <div style={styles.container}>
      <style>{gateAnimationStyles}</style>
      <GateTransitionOverlay config={transitionConfig} />
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabNavigation}
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
      {orderConfirmed && <WaitingPage onClose={handleCloseWaitingPage} currentOrder={currentOrder} />}
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      {showEmailModal && (
        <EmailPromptModal
          user={userForEmail}
          onSubmit={handleEmailSubmit}
          onClose={() => setShowEmailModal(false)}
          windowWidth={windowWidth}
        />
      )}
      <div style={styles.maxWidth}>
        {activeTab === 'student' && <StudentTab {...sharedProps} setResetStudentForm={setResetStudentForm} />}
        {activeTab === 'admin' && <AdminTab {...sharedProps} showSuccessAnimation={showSuccessAnimation} showLoadingAnimation={showLoadingAnimation}  hideLoadingAnimation={hideLoadingAnimation} isAuthenticated={isAdminAuthenticated} onAuth={(passcode) => handleAuthentication(passcode, 'admin')} resetAuth={resetAuth} />}
{activeTab === 'driver' && <DriverTab {...sharedProps} isAuthenticated={isDriverAuthenticated} onAuth={(passcode) => handleAuthentication(passcode, 'driver')} resetAuth={resetAuth} />}
      </div>
    </div>
  );
}

export default App;