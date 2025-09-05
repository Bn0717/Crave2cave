import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import ImageCarousel from './components/ImageCarousel';
import UserGuideTab from './components/UserGuideTab';

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
  const [systemAvailability, setSystemAvailability] = useState({ 
  isSystemOpen: true, 
  nextOpenTime: '', 
  malaysiaTime: new Date() 
});
useEffect(() => {
  // Initialize system availability on component mount
  setSystemAvailability(getSystemAvailability());
}, []);


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
      boxSizing: 'border-box', 
    }
  };

  const getSystemAvailability = () => {
  const now = new Date();
  const malaysiaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"}));
  
  const dayOfWeek = malaysiaTime.getDay(); // 0=Sunday, 2=Tuesday, 5=Friday
  const hour = malaysiaTime.getHours();
  const minute = malaysiaTime.getMinutes();
  const currentTime = hour + (minute / 60);
  
  const isAllowedDay = dayOfWeek === 3 || dayOfWeek === 5 || dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6 ; // Tuesday or Friday
  const isAllowedTime = currentTime >= 0 && currentTime <24; // 12 AM to 6 PM
  
  const isSystemOpen = isAllowedDay && isAllowedTime;
  
  let nextOpenTime = '';
  if (!isAllowedDay) {
    // Find next Tuesday or Friday
    const daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const nextDay = daysUntilTuesday <= daysUntilFriday ? daysUntilTuesday : daysUntilFriday;
    const nextDate = new Date(malaysiaTime);
    nextDate.setDate(nextDate.getDate() + (nextDay === 0 ? 7 : nextDay));
    nextOpenTime = nextDate.toLocaleDateString('en-MY', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' at 12:00 AM';
  } else if (currentTime >= 18) {
    // Next allowed day (Tuesday or Friday)
    const daysUntilNext = dayOfWeek === 2 ? 3 : 4; // Friday if Tuesday, Tuesday if Friday
    const nextDate = new Date(malaysiaTime);
    nextDate.setDate(nextDate.getDate() + daysUntilNext);
    nextOpenTime = nextDate.toLocaleDateString('en-MY', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' at 12:00 AM';
  }
  
  return { isSystemOpen, nextOpenTime, malaysiaTime };
};

// 1. Enhanced scrollToTop function specifically for iOS
const scrollToTop = useCallback(() => {
  // Use window.history instead of just 'history' to avoid ESLint no-restricted-globals
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  
  // Reset zoom first (for mobile devices)
  if (window.visualViewport) {
    // Modern approach for devices that support it
    document.querySelector('meta[name="viewport"]')?.setAttribute(
      'content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  }
  
  // Multiple scroll methods with iOS-specific handling
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  // iOS Safari specific fixes
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Force scroll for iOS
    document.body.style.transform = 'translateY(0)';
    document.documentElement.style.transform = 'translateY(0)';
    
    // iOS specific scroll methods
    if (document.body.scrollIntoView) {
      document.body.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    
    // Additional iOS fix - use negative margin trick
    document.body.style.marginTop = '0';
    document.documentElement.style.marginTop = '0';
  }
  
  // Force reflow to ensure scroll happens
  void document.documentElement.offsetHeight;
  
  // Multiple animation frames for iOS
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      // Final iOS fix
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    });
  });
}, []);

// 2. Add a function to reset zoom
const resetZoom = useCallback(() => {
  // Reset viewport meta tag to original scale
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute(
      'content', 
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    );
    
    // Force re-render after a tiny delay
    setTimeout(() => {
      viewportMeta.setAttribute(
        'content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }, 50);
  }
  
  // Additional zoom reset for iOS
  if (window.visualViewport && window.visualViewport.scale !== 1) {
    // Try to reset zoom programmatically
    window.scrollTo(0, 0);
  }
}, []);

// 3. Enhanced navigation effect with zoom reset
useEffect(() => {
  // Reset zoom first, then scroll
  resetZoom();
  
  setTimeout(() => {
    scrollToTop();
  }, 10);
  
  // Additional timeout for stubborn cases
  const timeoutId = setTimeout(() => {
    scrollToTop();
  }, 100);
  
  return () => clearTimeout(timeoutId);
}, [activeTab, showMainApp, scrollToTop, resetZoom]);

// 4. Enhanced order confirmation effect
useEffect(() => {
  if (orderConfirmed) {
    resetZoom();
    scrollToTop();
    
    // Extra timeout for order confirmation
    const timeoutId = setTimeout(() => {
      scrollToTop();
    }, 150);
    
    return () => clearTimeout(timeoutId);
  }
}, [orderConfirmed, scrollToTop, resetZoom]);

// 5. Add focus/blur handlers to manage zoom on form interactions
useEffect(() => {
  const handleFocusOut = () => {
    // When user finishes typing (loses focus), reset zoom after navigation
    setTimeout(() => {
      resetZoom();
    }, 100);
  };
  
  // Add event listeners to all input elements
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('blur', handleFocusOut);
  });
  
  // Cleanup
  return () => {
    inputs.forEach(input => {
      input.removeEventListener('blur', handleFocusOut);
    });
  };
}, [resetZoom]);

// 6. Enhanced tab navigation with zoom reset
const handleTabNavigation = (tabName) => {
  if (tabName === 'student' && !selectedVendor) {
    handleNavigationHome();
    return;
  }
  
  // Reset zoom and scroll before state change
  resetZoom();
  setTimeout(() => {
    scrollToTop();
  }, 10);
  
  setActiveTab(tabName);
  
  // Force scroll after state change with longer delay for iOS
  setTimeout(() => {
    scrollToTop();
  }, 100);
};

// 7. Enhanced navigation home with zoom reset
const handleNavigationHome = useCallback(() => {
  const homeConfig = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
  
  // Reset zoom and scroll immediately
  resetZoom();
  scrollToTop();
  
  handleNavigateWithTransition(homeConfig, () => {
    setShowLandingPage(true);
    setShowMainApp(false);
    setActiveTab('student');
    if (resetStudentForm) {
      resetStudentForm();
    }
    
    // Ensure zoom reset and scroll after transition
    setTimeout(() => {
      resetZoom();
      scrollToTop();
    }, 100);
  });
}, [resetStudentForm, scrollToTop, resetZoom]);

// 8. Enhanced transition handler
const handleNavigateWithTransition = (config, navigationAction) => {
  resetZoom();
  scrollToTop();
  
  setTransitionConfig(config);
  setTimeout(() => {
    resetZoom();
    scrollToTop();
    navigationAction();
    setTransitionConfig(null);
    
    // Final scroll and zoom reset after transition completes
    setTimeout(() => {
      resetZoom();
      scrollToTop();
    }, 100);
  }, 1600);
};

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
    setAllOrders(ordersData); // <-- Store all orders here
    setHistoryData(history);
    const orderArray = users.map((user, index) => ({ userId: user.firestoreId, order: index + 1 }));
    setRegistrationOrder(orderArray);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoadingUsers(false);
    setLoadingOrders(false);
    setLoadingHistory(false);
  }
}, []);

const handleMultipleImages = (images) => {
  if (Array.isArray(images) && images.length > 0) {
    setSelectedImages(images);
  } else if (typeof images === 'string') {
    setSelectedImages([images]);
  }
};

  const filterTodayData = useCallback((ordersData = [], users = []) => {
  const todayOrdersFiltered = ordersData.filter(order => isToday(order.timestamp));
  const todayUsersFiltered = users.filter(user => isToday(user.registrationDate) || isToday(user.timestamp));
  setTodayOrders(todayOrdersFiltered);
  setTodayUsers(todayUsersFiltered);
  
  // Count only users who paid the commitment fee
  const paidUsersCount = todayUsersFiltered.filter(u => u.commitmentPaid).length;
  
  const isActivatedToday = paidUsersCount >= 3;
  setMinOrderReached(isActivatedToday);
  setSystemActivatedToday(isActivatedToday);
}, []);

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
  fetchAllData();

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
      null,
      4000,
      true,
      () => {
        // ✅ Show the timer countdown page after success message
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
    if (showMainApp) {
      fetchAllData();
    }
  }, [fetchAllData, showMainApp]);

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
    fetchAllData,
    setSelectedImage,
    setOrderConfirmed,
    setCurrentOrder,
    selectedVendor,
    setShowEmailModal,
    setUserForEmail,
    rememberedStudent,
  setRememberedStudent,
  systemAvailability,
  setSelectedImages: setSelectedImages,
  handleMultipleImages: handleMultipleImages,
  setShowImageCarousel: setShowImageCarousel,
  isCurrentUserEligible,
  setIsCurrentUserEligible,  
  setSelectedVendor,
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
    <div className="app-container ios-scroll-fix">
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
        <p style={{ margin: '0' }}><strong>Student ID:</strong> {sessionPrompt.student.studentId}</p>
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
            ? 'View Timer'
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
      </div>
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
        {activeTab === 'admin' && <AdminTab {...sharedProps} showSuccessAnimation={showSuccessAnimation} showLoadingAnimation={showLoadingAnimation}  hideLoadingAnimation={hideLoadingAnimation} isAuthenticated={isAdminAuthenticated} onAuth={(passcode) => handleAuthentication(passcode, 'admin')} resetAuth={resetAuth} />}
{activeTab === 'driver' && <DriverTab {...sharedProps} isAuthenticated={isDriverAuthenticated} onAuth={(passcode) => handleAuthentication(passcode, 'driver')} resetAuth={resetAuth} />}
  {activeTab === 'guide' && <UserGuideTab />}
      </div>
    </div>
  );
}

export default App;