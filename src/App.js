import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import logoForAnimation from './assets/logo(1).png';
import * as firebaseService from './services/firebase';
import { checkIfSpecialOrderDay } from './services/firebase';
import { db } from './services/firebase'; // We need direct db access
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
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
import ImageCarousel from './components/ImageCarousel';
import UserGuideTab from './components/UserGuideTab';
import FeedbackTab from './components/FeedbackTab';

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
  const [sessionPrompt, setSessionPrompt] = useState(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const [showImageCarousel, setShowImageCarousel] = useState(false);
  const [isCurrentUserEligible, setIsCurrentUserEligible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [allOrders, setAllOrders] = useState([]);
  const [driverCost, setDriverCost] = useState(30);
  const [isSpecialOrder, setIsSpecialOrder] = useState(false);

  const handleDriverCostChange = async (cost) => {
  setDriverCost(cost); // Update the local state immediately for a responsive UI
  try {
    await firebaseService.updateDailyDriverCost(systemAvailability.deliveryDate, cost);
  } catch (error) {
    console.error("Failed to save driver cost to Firebase:", error);
    // Optionally show an error message to the user here
  }
};

  const [dailySettings, setDailySettings] = useState({});
  const [systemAvailability, setSystemAvailability] = useState({ 
  isSystemOpen: true, 
  nextOpenTime: '', 
  malaysiaTime: new Date() 
});
useEffect(() => {
  // Initialize system availability on component mount
  setSystemAvailability(getSystemAvailability());
}, []);


  const ADMIN_PASSCODE = 'byycky';
  const DRIVER_PASSCODE = 'kyuemc2c1234';

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
      boxSizing: 'border-box', 
    }
  };

  const getSystemAvailability = (settings = {}) => {
    const DELIVERY_DAYS = [1, 3, 6]; // Tuesday=2, Friday=5, Saturday=6
    
    let CUTOFF_HOUR = 15; 
    let CUTOFF_MINUTE = 0; 
  
    if (settings.extendedCutoffTime) {
      const [hours, minutes] = settings.extendedCutoffTime.split(':').map(Number);
      CUTOFF_HOUR = hours;
      CUTOFF_MINUTE = minutes;
      console.log(`System extended! New cutoff: ${CUTOFF_HOUR}:${CUTOFF_MINUTE}`);
    }
  
    const now = new Date();
    const malaysiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const currentHour = malaysiaTime.getHours();
    const currentMinute = malaysiaTime.getMinutes();
    const currentDay = malaysiaTime.getDay();
    const todayDateString = malaysiaTime.toLocaleDateString('en-CA');
  
    if (DELIVERY_DAYS.includes(currentDay)) {
      if (currentHour > CUTOFF_HOUR || (currentHour === CUTOFF_HOUR && currentMinute >= CUTOFF_MINUTE)) {
        for (let i = 1; i <= 14; i++) {
          const checkingDate = new Date(malaysiaTime);
          checkingDate.setDate(checkingDate.getDate() + i);
          const checkingDay = checkingDate.getDay();
          
          if (DELIVERY_DAYS.includes(checkingDay)) {
            return {
              isSystemOpen: false,
              deliveryDate: todayDateString,
              nextOpenTime: `Midnight tonight (opens for ${checkingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} delivery)`,
              malaysiaTime,
              earlySystemOpen: settings.earlySystemOpen || false
            };
          }
        }
        return {
          isSystemOpen: false, deliveryDate: todayDateString,
          nextOpenTime: 'No delivery dates scheduled in the next 2 weeks', malaysiaTime,
          earlySystemOpen: settings.earlySystemOpen || false
        };
      }
    }
  
    for (let i = 0; i <= 14; i++) {
      const checkingDate = new Date(malaysiaTime);
      checkingDate.setDate(checkingDate.getDate() + i);
      checkingDate.setHours(0, 0, 0, 0);
      const checkingDay = checkingDate.getDay();
  
      if (DELIVERY_DAYS.includes(checkingDay)) {
        const deliveryDateString = checkingDate.toLocaleDateString('en-CA');
        return { isSystemOpen: true, deliveryDate: deliveryDateString, malaysiaTime,
          earlySystemOpen: settings.earlySystemOpen || false
        };
      }
    }
  
    return {
      isSystemOpen: false, deliveryDate: todayDateString,
      nextOpenTime: 'No delivery dates scheduled', malaysiaTime,
      earlySystemOpen: settings.earlySystemOpen || false 
    };
  };

  useEffect(() => {
    // Initialize system availability on mount, without settings
    setSystemAvailability(getSystemAvailability());
  }, []);

const scrollToTop = useCallback(() => {
  // Simple, reliable scroll to top
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  // For iOS devices specifically
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    document.body.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}, []);

// Simple navigation effect
useEffect(() => {
  scrollToTop();
  
  const timeoutId = setTimeout(() => {
    scrollToTop();
  }, 100);
  
  return () => clearTimeout(timeoutId);
}, [activeTab, showMainApp, scrollToTop]);

// Order confirmation effect
useEffect(() => {
  if (orderConfirmed) {
    scrollToTop();
  }
}, [orderConfirmed, scrollToTop]);

// REPLACE your handleTabNavigation function with this:
const handleTabNavigation = (tabName) => {
  if (tabName === 'student' && !selectedVendor) {
    handleNavigationHome();
    return;
  }
  
  scrollToTop();
  setActiveTab(tabName);
};

// REPLACE your handleNavigationHome function with this:
const handleNavigationHome = useCallback(() => {
  const homeConfig = { background: 'linear-gradient(135deg, #667eea 1%, #764ba2 100%)' };
  
  scrollToTop();
  
  handleNavigateWithTransition(homeConfig, () => {
    setShowLandingPage(true);
    setShowMainApp(false);
    setActiveTab('student');
    if (resetStudentForm) {
      resetStudentForm();
    }
  });
}, [resetStudentForm, scrollToTop]);

// REPLACE your handleNavigateWithTransition function with this:
const handleNavigateWithTransition = (config, navigationAction) => {
  scrollToTop();
  
  setTransitionConfig(config);
  setTimeout(() => {
    scrollToTop();
    navigationAction();
    setTransitionConfig(null);
  }, 1600);
};

// Check if current delivery date is a special order day
useEffect(() => {
  const checkSpecialOrder = async () => {
    if (systemAvailability?.deliveryDate) {
      try {
        const isSpecial = await checkIfSpecialOrderDay(systemAvailability.deliveryDate);
        setIsSpecialOrder(isSpecial);
      } catch (error) {
        console.error('Error checking special order day:', error);
        setIsSpecialOrder(false);
      }
    }
  };
  checkSpecialOrder();
}, [systemAvailability.deliveryDate]);

useEffect(() => {
    if (!showMainApp) return;
    
    const targetDeliveryDate = systemAvailability.deliveryDate;
    
    if (!targetDeliveryDate) {
      setLoadingUsers(false);
      setLoadingOrders(false);
      setLoadingHistory(false);
      return;
    }
  
    setLoadingUsers(true);
    setLoadingOrders(true);
    setLoadingHistory(true);
  
    const usersQuery = query(collection(db, "prebookUsers"), where("deliveryDate", "==", targetDeliveryDate));
    const unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
      const users = querySnapshot.docs.map((doc) => ({ id: doc.id, firestoreId: doc.id, ...doc.data() })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setPrebookUsers(users);
      setRegistrationOrder(users.map((user, index) => ({ userId: user.firestoreId, order: index + 1 })));
      setLoadingUsers(false);
    });
  
    const ordersQuery = query(collection(db, "orders"));
    const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllOrders(ordersData);
      setLoadingOrders(false);
    });
    
    const historyQuery = query(collection(db, "history"));
    const unsubscribeHistory = onSnapshot(historyQuery, (querySnapshot) => {
      const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistoryData(history);
      setLoadingHistory(false);
    });
  
    // ==================== NEW DATABASE LISTENER ====================
    const settingsDocRef = doc(db, "dailySettings", targetDeliveryDate);
    const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
      const newSettings = docSnap.exists() ? docSnap.data() : {};
      setDailySettings(newSettings);
      // Re-calculate system availability whenever settings change
      setSystemAvailability(getSystemAvailability(newSettings));
      console.log("Real-time daily settings updated:", newSettings);
    });

  // Cleanup function: This is crucial to prevent memory leaks
  return () => {
    unsubscribeUsers();
    unsubscribeOrders();
    unsubscribeHistory();
    unsubscribeSettings(); 
  };
  
}, [systemAvailability.deliveryDate, showMainApp]); // Re-run this effect if the date or app visibility changes


const handleMultipleImages = (images) => {
  if (Array.isArray(images) && images.length > 0) {
    setSelectedImages(images);
  } else if (typeof images === 'string') {
    setSelectedImages([images]);
  }
};

  const filterTodayData = useCallback(() => {
  const targetDeliveryDate = systemAvailability.deliveryDate;
  
  if (!targetDeliveryDate) {
    setTodayOrders([]);
    setTodayUsers([]);
    setMinOrderReached(false);
    setSystemActivatedToday(false);
    return;
  }
  
  const todayOrdersFiltered = allOrders.filter(order => order.deliveryDate === targetDeliveryDate);
  
  setTodayOrders(todayOrdersFiltered);
  setTodayUsers(prebookUsers);
  
  const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
  
  // MODIFY THIS LOGIC
  const isActivatedToday = paidUsersCount >= 3 || systemAvailability.earlySystemOpen;
  setMinOrderReached(isActivatedToday);
  setSystemActivatedToday(isActivatedToday);
}, [allOrders, prebookUsers, systemAvailability.deliveryDate, systemAvailability.earlySystemOpen]);

// ADD this useEffect right below filterTodayData
useEffect(() => {
  filterTodayData();
}, [allOrders, prebookUsers, filterTodayData]);

  const getProgressText = (step) => {
  if (step === 2) return "Awaiting Base Delivery Fee for first 3 users";
  if (step === 3) return "Awaiting Order Submission"; 
  if (step === 'order_submitted') return "Email Required";
  if (step === 'completed') return "Order Confirmed";
  return "Registered";
};

  const showSuccessAnimation = useCallback((title, message, additionalInfo = null, duration = 2000, showOkButton = true, onCloseCallback = null) => {
  setSuccessConfig({ title, message, additionalInfo, duration, showOkButton, onClose: onCloseCallback });
  setShowSuccess(true);
}, []); // <-- The empty dependency array is key. It tells React this function never needs to be recreated.

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

// In App.js, find the handleRestoreSession function and add this line:

const handleRestoreSession = () => {
  if (!sessionPrompt) return;

  // 1. Immediately set the state needed to navigate
  setSelectedVendor(sessionPrompt.vendor);
  setRememberedStudent({
    ...sessionPrompt.student,
    sessionStep: sessionPrompt.step
  });
  
  // 2. Navigate instantly without waiting for any data
  setSessionPrompt(null);
  setShowLandingPage(false);
  setShowMainApp(true);
  
  // 3. Handle specific "completed" states which don't need eligibility checks
  if (sessionPrompt.step === 'completed') {
    const orderDetailsJSON = localStorage.getItem('activeOrderDetails');
    if (orderDetailsJSON) {
      const orderDetails = JSON.parse(orderDetailsJSON);
      setCurrentOrder(orderDetails);
      setOrderConfirmed(true);
    }
    return;
  }

  if (sessionPrompt.step === 'order_submitted') {
    const pendingOrder = localStorage.getItem('pendingOrderDetails');
    if (pendingOrder) {
      const orderDetails = JSON.parse(pendingOrder);
      setCurrentOrder(orderDetails);
      setUserForEmail({ 
        firestoreId: sessionPrompt.student.firestoreId, 
        name: sessionPrompt.student.name 
      });
      setShowEmailModal(true);
    }
    return;
  }
};

const handleStartNewSession = () => {
  const todayKey = new Date().toLocaleDateString('en-CA');
  localStorage.removeItem(`userSession-${todayKey}`);
  localStorage.removeItem('activeOrderDetails');
  setSessionPrompt(null);
};


  const handleLandingStart = (vendor) => {
  // ADD THIS LINE: Save to localStorage immediately
  localStorage.setItem(`selectedVendor-${new Date().toLocaleDateString('en-CA')}`, vendor);

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


  const handleCloseWaitingPage = () => {
  // ✅ FIX: Keep the session in 'completed' state - DON'T clear it
  setOrderConfirmed(false);
  setCurrentOrder(null);
  
  // Clear the remembered student from memory but keep session data
  setRememberedStudent(null);
  
  if (resetStudentForm) {
    resetStudentForm(false); // Pass false to NOT clear session
  }

  // ✅ KEEP the session data so user can return to timer
  // Don't clear userSession or activeOrderDetails
  // Only clear pendingOrderDetails since order is complete
  localStorage.removeItem('pendingOrderDetails');
};

  const handleEmailSubmit = async (userId, email) => {
  showLoadingAnimation('Saving your email...');
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    await firebaseService.updateUserEmail(userId, email);

    // ✅ FIX: Close email modal FIRST
    setShowEmailModal(false);

    // ✅ FIX: Update session to 'completed' and move order data
    const todayKey = new Date().toLocaleDateString('en-CA');
    const sessionJSON = localStorage.getItem(`userSession-${todayKey}`);
    if (sessionJSON) {
      try {
        const sessionData = JSON.parse(sessionJSON);
        const updatedSession = {
          ...sessionData,
          step: 'completed'
        };
        localStorage.setItem(`userSession-${todayKey}`, JSON.stringify(updatedSession));
        
        // Move order details from pending to active
        const pendingOrder = localStorage.getItem('pendingOrderDetails');
        if (pendingOrder) {
          localStorage.setItem('activeOrderDetails', pendingOrder);
          localStorage.removeItem('pendingOrderDetails');
        }
      } catch (e) {
        console.error('Error updating session after email:', e);
      }
    }

    hideLoadingAnimation();

    // ✅ FIX: Show success message THEN navigate to timer
    showSuccessAnimation(
  'Order Confirmed!',
  'Your order has been submitted successfully. You will receive a confirmation email once the driver starts delivering your order.',
  <a 
    href="https://chat.whatsapp.com/CUZ0DJ698Sp2A5vTxzwZ3I" 
    target="_blank" 
    rel="noopener noreferrer"
    style={{
      display: 'block',
      marginTop: '12px',
      color: '#25D366',
      textDecoration: 'underline',
      fontWeight: '500',
      fontSize: '15px'
    }}
  >
    📱 Join our WhatsApp group for live updates
  </a>,
  0,
  true,
  () => {
    setOrderConfirmed(true);
  }
);
  } catch (error) {
    hideLoadingAnimation();
    console.error('Failed to save email:', error);
    showSuccessAnimation(
      'Email Save Failed',
      `Failed to save your email: ${error.message}`,
      null,
      3000,
      true
    );
  }
};


useEffect(() => {
  const checkSystemAvailability = () => {
    setSystemAvailability(getSystemAvailability());
  };
  
  // Check every minute
  const interval = setInterval(checkSystemAvailability, 60000);
  
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const todayKey = new Date().toLocaleDateString('en-CA');
  const lastAccessDate = localStorage.getItem('lastAccessDate');

  if (lastAccessDate !== todayKey) {
    console.log("New day detected. Clearing old session data.");
    localStorage.clear();
    localStorage.setItem('lastAccessDate', todayKey);
  }

  const sessionJSON = localStorage.getItem(`userSession-${todayKey}`);
  if (sessionJSON) {
    try {
      const sessionData = JSON.parse(sessionJSON);
      
      // ✅ FIX: Always show session prompt for meaningful sessions
      if (sessionData.step && sessionData.student) {
        setSessionPrompt(sessionData);
      }
    } catch (e) {
      console.error("Error parsing session data", e);
      localStorage.removeItem(`userSession-${todayKey}`);
    }
  }
  

  

  // Other setups remain the same...
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  const adminAuth = localStorage.getItem('isAdminAuthenticated');
  if (adminAuth === 'true') setIsAdminAuthenticated(true);
  const driverAuth = localStorage.getItem('isDriverAuthenticated');
  if (driverAuth === 'true') setIsDriverAuthenticated(true);

  return () => window.removeEventListener('resize', handleResize);
}, []);


useEffect(() => {
    const dailyResetInterval = setInterval(() => {
      const todayString = new Date().toLocaleDateString('en-CA');
      
      // Check if the date has changed since the last check
      if (todayString !== currentDate) {
        console.log("Midnight crossed! Resetting app for the new day.");

        // Update the state to the new date
        setCurrentDate(todayString);
        
        // Show a helpful message to the user
        showSuccessAnimation(
          "It's a New Day!",
          "The system has been reset for today's orders.",
          null, 4000
        );

        // Reset all the daily data states to their initial values
        setPrebookUsers([]);
        setTodayUsers([]);
        setTodayOrders([]);
        setMinOrderReached(false);
        setSystemActivatedToday(false);
        setRememberedStudent(null);
        setSelectedVendor(''); // Also reset the vendor
        
        // Clear old session data from the browser
        const oldDateKey = new Date();
        oldDateKey.setDate(oldDateKey.getDate() - 1);
        const yesterdayKey = oldDateKey.toLocaleDateString('en-CA');
        localStorage.removeItem(`userSession-${yesterdayKey}`);
        localStorage.removeItem('activeOrderDetails');
        
        // Go back to the landing page to start fresh
        handleNavigationHome();
      }
    }, 60000); // Check every 60 seconds (1 minute)

    // Cleanup function to stop the timer when the component unmounts
    return () => clearInterval(dailyResetInterval);
  }, [currentDate, showSuccessAnimation, handleNavigationHome]); // Dependencies for the hook

  useEffect(() => {
    // Check if a driverCost is defined in the settings for the current delivery date
    if (dailySettings.driverCost !== undefined) {
      setDriverCost(dailySettings.driverCost);
    } else {
      // If no cost is saved, default back to 30 or a calculated suggestion
      setDriverCost(30);
    }
  }, [dailySettings]); // This runs whenever dailySettings are fetched or updated

    useEffect(() => {
    const fetchEligibilityForRestoredSession = async () => {
      // Only run if there's a remembered student and the main data has loaded.
      if (rememberedStudent && prebookUsers.length > 0) {
        const user = prebookUsers.find(u => u.firestoreId === rememberedStudent.firestoreId);
        if (user) {
          setIsCurrentUserEligible(user.eligibleForDeduction || false);
        }
      }
    };
  
    fetchEligibilityForRestoredSession();
  }, [rememberedStudent, prebookUsers, setIsCurrentUserEligible]); // It's good practice to include the setter function here

  useEffect(() => {
  filterTodayData(allOrders, prebookUsers);
}, [allOrders, prebookUsers, filterTodayData]);

useEffect(() => {
  // If the app is NOT in a loading state for users or orders,
  // then we can safely hide any active loading animation.
  if (!loadingUsers && !loadingOrders) {
    hideLoadingAnimation();
  }
}, [loadingUsers, loadingOrders]);

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
    setSelectedImage,
    setOrderConfirmed,
    setCurrentOrder,
    selectedVendor,
    setShowEmailModal,
    setUserForEmail,
    rememberedStudent,
  setRememberedStudent,
  systemAvailability: { ...systemAvailability, isSpecialOrder },
  setSelectedImages: setSelectedImages,
  handleMultipleImages: handleMultipleImages,
  setShowImageCarousel: setShowImageCarousel,
  isCurrentUserEligible,
  setIsCurrentUserEligible,  
  setSelectedVendor,
  dailySettings,
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
        {sessionPrompt && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 10000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white', padding: '24px', borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px',
      textAlign: 'center'
    }}>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>
        {sessionPrompt.step === 'order_submitted' 
          ? `Email Required, ${sessionPrompt.student.name}!`
          : sessionPrompt.step === 'completed'
          ? `Continue Order Tracking?`
          : `Welcome Back, ${sessionPrompt.student.name}!`
        }
      </h3>
      
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', margin: '16px 0', textAlign: 'left', fontSize: '14px' }}>
        <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {sessionPrompt.student.name}</p>
        <p style={{ margin: '0' }}><strong>Contact:</strong> {sessionPrompt.student.contactNumber}</p>
        <p style={{ margin: '8px 0 0 0', color: '#15803d' }}>
          <strong>Progress:</strong> {getProgressText(sessionPrompt.step)}
        </p>
      </div>

      <p style={{ color: '#475569', margin: '8px 0 24px 0' }}>
        {sessionPrompt.step === 'order_submitted' 
          ? 'Your order was submitted but needs an email address for updates.'
          : sessionPrompt.step === 'completed'
          ? 'Your order is being processed. View your order details?'
          : `Continue your session for ${sessionPrompt.vendor}?`
        }
      </p>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={handleStartNewSession} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontWeight: '600' }}>
          Start New
        </button>
        <button onClick={handleRestoreSession} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
          {sessionPrompt.step === 'order_submitted' 
            ? 'Add Email' 
            : sessionPrompt.step === 'completed'
            ? 'View Order Details'
            : 'Yes, Continue'
          }
        </button>
      </div>
    </div>
  </div>
)}
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
  <div style={{...styles.container, position: 'relative', top: 0}} className="app-container ios-scroll-fix">
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
      {orderConfirmed && <WaitingPage onClose={handleCloseWaitingPage} currentOrder={currentOrder} setSelectedImage={setSelectedImage}          // ← Add this
    setShowImageCarousel={setShowImageCarousel}  // ← Add this
    setSelectedImages={setSelectedImages} />}
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
{showImageCarousel && selectedImages && (
  <ImageCarousel 
    images={selectedImages} 
    onClose={() => {
      setShowImageCarousel(false);
      setSelectedImages(null);
    }} 
  />
)}
      {showEmailModal && (
        <EmailPromptModal
          user={userForEmail}
          onSubmit={handleEmailSubmit}
          onClose={() => setShowEmailModal(false)}
          windowWidth={windowWidth}
        />
      )}
      <div id="main-content" style={styles.maxWidth}>
        {activeTab === 'student' && <StudentTab {...sharedProps} setSelectedVendor={setSelectedVendor} setResetStudentForm={setResetStudentForm} />}
        {activeTab === 'admin' && <AdminTab {...sharedProps} driverCost={driverCost} setDriverCost={handleDriverCostChange} showSuccessAnimation={showSuccessAnimation} showLoadingAnimation={showLoadingAnimation}  hideLoadingAnimation={hideLoadingAnimation} isAuthenticated={isAdminAuthenticated} onAuth={(passcode) => handleAuthentication(passcode, 'admin')} resetAuth={resetAuth} />}
{activeTab === 'driver' && <DriverTab {...sharedProps} driverCost={driverCost} isAuthenticated={isDriverAuthenticated} onAuth={(passcode) => handleAuthentication(passcode, 'driver')} resetAuth={resetAuth} />}
  {activeTab === 'guide' && <UserGuideTab />}
  {activeTab === 'feedback' && <FeedbackTab showSuccessAnimation={showSuccessAnimation} windowWidth={windowWidth} />}
      </div>
    </div>
  );
}

export default App;