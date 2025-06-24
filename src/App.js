import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Receipt, Users, Truck, CheckCircle, Calculator, Camera, Scan, Lock, Eye, EyeOff, QrCode, Search, Loader2, AlertCircle, Clock, TrendingUp, DollarSign, Package, UserCheck, BarChart3, PieChart, Calendar, Save, History, Menu, X, ZoomIn } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, writeBatch} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import qrImage from './assets/qrtng.jpg';
import logo from './assets/logo(1).png';

const firebaseConfig = {
  apiKey: "AIzaSyBg56oKPkkQBHZYlqDe86gNKuM6CU9o0no",
  authDomain: "crave-2-cave.firebaseapp.com",
  projectId: "crave-2-cave",
  storageBucket: "crave-2-cave.firebasestorage.app",
  messagingSenderId: "328846262825",
  appId: "1:328846262825:web:149f44152723bdc62d9238"
};  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Modern Navigation Component
const Navigation = ({ activeTab, setActiveTab, setIsAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navStyles = {
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '70px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
      color: '#1f2937',
      cursor: 'pointer' 
    },
    logoImage: {
      height: '70px',
      width: 'auto',
      objectFit: 'contain',
      maxWidth: '200px',
      '@media (max-width: 480px)': {
        height: '45px',
        maxWidth: '150px'
      }
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      '@media (max-width: 480px)': {
        display: 'none'
      }
    },
    mobileMenuButton: {
      background: 'none',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      color: '#1f2937'
    },
    mobileMenu: {
      position: 'fixed',
      top: '70px',
      right: 0,
      backgroundColor: 'white',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      display: isMobileMenuOpen ? 'block' : 'none',
      animation: isMobileMenuOpen ? 'slideDown 0.3s ease' : 'none',
      borderRadius: '0 0 0 20px',
      minWidth: '250px'
    },
    mobileMenuItem: {
      display: 'block',
      width: '100%',
      padding: '16px',
      marginBottom: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      textAlign: 'left',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  const handleLogoClick = () => {
    // Reset to home state
    setActiveTab('student');
    setIsAuthenticated(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav style={navStyles.navbar}>
        <div style={navStyles.container}>
          <div style={navStyles.logo} onClick={handleLogoClick}>
            <img src={logo} alt="Crave 2 Cave" style={navStyles.logoImage} />
            <span style={navStyles.logoText}>Crave 2 Cave</span>
          </div>

          {/* Mobile Menu Button - Always visible */}
          <button
            style={navStyles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={navStyles.mobileMenu}>
          <button
            onClick={() => {
              setActiveTab('student');
              setIsAuthenticated(false);
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...navStyles.mobileMenuItem,
              backgroundColor: activeTab === 'student' ? '#eff6ff' : 'transparent',
              color: activeTab === 'student' ? '#3b82f6' : '#4b5563'
            }}
          >
            <Users size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Student Portal
          </button>
          <button
            onClick={() => {
              setActiveTab('driver');
              setIsAuthenticated(false);
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...navStyles.mobileMenuItem,
              backgroundColor: activeTab === 'driver' ? '#eff6ff' : 'transparent',
              color: activeTab === 'driver' ? '#3b82f6' : '#4b5563'
            }}
          >
            <Truck size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Driver Portal
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setIsAuthenticated(false);
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...navStyles.mobileMenuItem,
              backgroundColor: activeTab === 'admin' ? '#eff6ff' : 'transparent',
              color: activeTab === 'admin' ? '#3b82f6' : '#4b5563'
            }}
          >
            <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Admin Dashboard
          </button>
        </div>
      )}
    </>
  );
};


const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 801;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          },
          'image/jpeg',
          1.0
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const calculateDeliveryFee = (amount) => {
  if (amount < 50) return 10;
  if (amount >= 50 && amount < 100) return 17;
  if (amount >= 100 && amount < 150) return 25;
  if (amount >= 150 && amount < 200) return 30;
  return Math.min(amount * 0.15, 55);
};

  const FeeBreakdown = ({ orderTotal, userIndex, isCommitmentFeePaid, registrationOrder, selectedUserId }) => {
  const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
  const isFourthOrLaterUser = userOrder ? userOrder.order >= 4 : userIndex >= 3;
  
  const deliveryFee = calculateDeliveryFee(orderTotal);
  // Only deduct RM10 if user is in first 3 AND paid commitment fee
  const commitmentFeeDeducted = (!isFourthOrLaterUser && userIndex < 3 && isCommitmentFeePaid && deliveryFee > 0) ? 10 : 0;
  const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      padding: '24px',
      borderRadius: '16px',
      border: '2px solid #fbbf24',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#92400e', fontSize: '18px' }}>Fee Breakdown</h4>
      <p style={{ margin: '6px 0' }}>Order Total: RM{orderTotal.toFixed(2)}</p>
      <p style={{ margin: '6px 0' }}>Delivery Fee: RM{deliveryFee.toFixed(2)}</p>
      {commitmentFeeDeducted > 0 && (
        <p style={{ margin: '6px 0', color: '#059669' }}>Commitment Fee Deduction: -RM{commitmentFeeDeducted.toFixed(2)}</p>
      )}
      <hr style={{ margin: '12px 0', borderColor: '#fbbf24' }} />
      <p style={{ margin: '6px 0', fontSize: '18px' }}>
        <strong>Amount to Pay: RM{actualDeliveryFee.toFixed(2)}</strong>
      </p>
    </div>
  );
};


// Enhanced Chart Component
// Enhanced Chart Component with better mobile responsiveness
const SimpleChart = ({ data, type = 'bar', title, height = 300 }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setIsMobile(window.innerWidth <= 768);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = isMobile ? 180 : height;
  
  const styles = {
    container: {
      backgroundColor: 'white',
      padding: isMobile ? '12px' : '20px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f3f4f6',
      width: '100%',
      maxWidth: '100%', // Ensure it doesn't exceed container
      boxSizing: 'border-box',
      overflow: 'hidden'
    },
    title: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '600',
      marginBottom: isMobile ? '12px' : '20px',
      color: '#1f2937',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    chartArea: {
      position: 'relative',
      height: `${chartHeight}px`,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      gap: isMobile ? '2px' : '6px',
      paddingBottom: '40px',
      width: '100%',
      overflow: 'hidden' // Remove scroll
    },
    bar: {
      position: 'relative',
      backgroundColor: '#3b82f6',
      borderRadius: '6px 6px 0 0',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      flex: '1',
      maxWidth: isMobile ? '25px' : '40px',
      minWidth: isMobile ? '20px' : '30px',
      background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)'
    },
    barLabel: {
      position: 'absolute',
      bottom: '-35px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: isMobile ? '8px' : '10px',
      color: '#6b7280',
      whiteSpace: 'nowrap',
      fontWeight: '500',
      writingMode: isMobile && data.length > 4 ? 'vertical-rl' : 'horizontal-tb',
      textOrientation: 'mixed',
      maxWidth: '40px',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    barValue: {
      position: 'absolute',
      top: '-18px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: isMobile ? '9px' : '11px',
      fontWeight: 'bold',
      color: '#1f2937',
      backgroundColor: '#f3f4f6',
      padding: '1px 3px',
      borderRadius: '3px',
      whiteSpace: 'nowrap'
    },
    pieContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '16px' : '32px',
      flexWrap: 'wrap',
      flexDirection: isMobile ? 'column' : 'row'
    },
    pieChart: {
      width: isMobile ? '120px' : '160px',
      height: isMobile ? '120px' : '160px',
      position: 'relative'
    },
    legend: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '4px' : '8px',
      fontSize: isMobile ? '10px' : '12px',
      maxWidth: '100%'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      flexWrap: 'wrap'
    },
    legendColor: {
      width: isMobile ? '12px' : '16px',
      height: isMobile ? '12px' : '16px',
      borderRadius: '3px',
      flexShrink: 0
    }
  };

  // Rest of the component remains the same...
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    let currentAngle = -90;

    return (
      <div ref={containerRef} style={styles.container}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.pieContainer}>
          <svg viewBox="0 0 200 200" style={styles.pieChart}>
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const startX = 100 + 80 * Math.cos(startAngle * Math.PI / 180);
              const startY = 100 + 80 * Math.sin(startAngle * Math.PI / 180);
              const endX = 100 + 80 * Math.cos(endAngle * Math.PI / 180);
              const endY = 100 + 80 * Math.sin(endAngle * Math.PI / 180);
              
              currentAngle = endAngle;
              
              return (
                <path
                  key={index}
                  d={`M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="3"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              );
            })}
          </svg>
          <div style={styles.legend}>
            {data.map((item, index) => (
              <div key={index} style={styles.legendItem}>
                <div style={{
                  ...styles.legendColor,
                  backgroundColor: colors[index % colors.length]
                }}></div>
                <span style={{ color: '#4b5563', fontSize: 'inherit' }}>
                  {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.chartArea}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.bar,
              height: `${(item.value / maxValue) * (chartHeight - 60)}px`,
              backgroundColor: item.color || '#3b82f6'
            }}
          >
            <span style={styles.barValue}>{item.value}</span>
            <span style={styles.barLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Success Animation Component
const SuccessAnimation = ({ title, message, additionalInfo, duration = 2000, showOkButton = true, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // This will now ALWAYS set a timer to close the modal
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose(); // Use handleClose to ensure smooth fade-out
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [onClose, duration, showOkButton]);

  const successStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '16px',
      backdropFilter: 'blur(8px)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease-in-out'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '32px',
      textAlign: 'center',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
      transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      maxWidth: '420px',
      width: '100%',
      animation: visible ? 'modalSlideIn 0.5s ease-out' : 'none'
    },
    iconContainer: {
      width: '88px',
      height: '88px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto 24px',
      animation: 'successPulse 0.8s ease-out',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px',
      animation: 'slideInUp 0.6s ease-out 0.2s both'
    },
    message: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '24px',
      lineHeight: '1.6',
      animation: 'slideInUp 0.6s ease-out 0.3s both'
    },
    button: {
      padding: '12px 32px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      '&:hover': {
        backgroundColor: '#2563eb',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
      }
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 500);
  };

  return (
    <div style={successStyles.overlay}>
      <div style={successStyles.modal}>
        <div style={successStyles.iconContainer}>
          <CheckCircle size={48} color="white" strokeWidth={3} />
        </div>
        <h2 style={successStyles.title}>{title}</h2>
        <p style={successStyles.message}>{message}</p>
        {additionalInfo && (
          <div style={{ marginBottom: '24px' }}>
            {additionalInfo}
          </div>
        )}
        {showOkButton && (
          <button onClick={handleClose} style={successStyles.button}>
            OK
          </button>
        )}
      </div>
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes successPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Enhanced Loading Animation Component
const LoadingAnimation = ({ message = "Processing..." }) => {
  const loadingStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    },
    container: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      maxWidth: '320px',
      width: '90%'
    },
    spinner: {
      width: '64px',
      height: '64px',
      margin: '0 auto 24px',
      animation: 'spin 1s linear infinite'
    },
    message: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px'
    },
    dots: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px'
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      animation: 'bounce 1.4s infinite ease-in-out'
    }
  };

  return (
    <div style={loadingStyles.overlay}>
      <div style={loadingStyles.container}>
        <div style={loadingStyles.spinner}>
          <Loader2 size={64} color="#3b82f6" />
        </div>
        <h3 style={loadingStyles.message}>{message}</h3>
        <div style={loadingStyles.dots}>
          <div style={{ ...loadingStyles.dot, animationDelay: '-0.32s' }}></div>
          <div style={{ ...loadingStyles.dot, animationDelay: '-0.16s' }}></div>
          <div style={loadingStyles.dot}></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Enhanced Image Modal Component with pinch-to-zoom
const ImageModal = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  // Mouse drag
  const handleMouseDown = (e) => {
    if (scale > 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pinch-to-zoom
  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      setInitialDistance(getDistance(e.touches));
      setInitialScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch drag
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      // Pinch zoom
      const currentDistance = getDistance(e.touches);
      const scaleChange = currentDistance / initialDistance;
      const newScale = initialScale * scaleChange;
      setScale(Math.min(Math.max(newScale, 0.5), 5));
    } else if (e.touches.length === 1 && isDragging) {
      // Single touch drag
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialDistance(0);
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000,
      padding: '20px',
      cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      touchAction: 'none'
    },
    container: {
      position: 'relative',
      maxWidth: '90vw',
      maxHeight: '90vh',
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      touchAction: 'none'
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
      backdropFilter: 'blur(10px)'
    },
    zoomControls: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    zoomButton: {
      backgroundColor: '#f3f4f6',
      border: 'none',
      padding: '8px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    zoomLevel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      minWidth: '60px',
      textAlign: 'center'
    },
    closeButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    imageContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginTop: '50px', // Account for header
      position: 'relative'
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease',
      userSelect: 'none',
      touchAction: 'none',
      pointerEvents: 'auto'
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      style={modalStyles.overlay} 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={modalStyles.container}>
        <div style={modalStyles.header}>
          <div style={modalStyles.zoomControls}>
            <button style={modalStyles.zoomButton} onClick={handleZoomOut}>
              <ZoomIn size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span style={modalStyles.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button style={modalStyles.zoomButton} onClick={handleZoomIn}>
              <ZoomIn size={16} />
            </button>
            <button style={modalStyles.zoomButton} onClick={handleZoomReset}>
              Reset
            </button>
          </div>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <X size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Close
          </button>
        </div>
        <div 
          ref={containerRef}
          style={modalStyles.imageContainer}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            ref={imageRef}
            src={imageUrl} 
            alt="Order" 
            style={modalStyles.image}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

// Beautiful Message Component
const BeautifulMessage = ({ type = 'info', title, message, icon, children, onClose }) => {
  const getMessageStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '2px solid #10b981',
          iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          iconColor: 'white',
          textColor: '#047857'
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          iconColor: 'white',
          textColor: '#92400e'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '2px solid #ef4444',
          iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          iconColor: 'white',
          textColor: '#991b1b'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '2px solid #3b82f6',
          iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          iconColor: 'white',
          textColor: '#1e40af'
        };
    }
  };

  const messageStyles = getMessageStyles();

  return (
    <div style={{
      background: messageStyles.background,
      border: messageStyles.border,
      borderRadius: '20px',
      padding: window.innerWidth <= 480 ? '20px' : '28px',
      marginBottom: '24px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative pattern */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: window.innerWidth <= 480 ? '12px' : '16px'
      }}>
        {icon && (
          <div style={{
            width: window.innerWidth <= 480 ? '48px' : '56px',
            height: window.innerWidth <= 480 ? '48px' : '56px',
            borderRadius: '16px',
            background: messageStyles.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}>
            {React.cloneElement(icon, { 
              size: window.innerWidth <= 480 ? 24 : 28, 
              color: messageStyles.iconColor 
            })}
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: window.innerWidth <= 480 ? '16px' : '18px',
              fontWeight: 'bold',
              color: messageStyles.textColor
            }}>
              {title}
            </h4>
          )}
          
          <p style={{
            margin: '0 0 12px 0',
            fontSize: window.innerWidth <= 480 ? '14px' : '15px',
            color: messageStyles.textColor,
            lineHeight: '1.5'
          }}>
            {message}
          </p>
          
          {children}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: messageStyles.textColor,
              transition: 'all 0.2s ease'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Enhanced Responsive Table Component
const ResponsiveTable = ({ headers, data, onImageClick }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    // Mobile card layout
    return (
      <div style={{ width: '100%' }}>
        {data.map((row, rowIndex) => (
          <div key={rowIndex} style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: cellIndex < row.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '13px',
                  flex: '0 0 auto',
                  marginRight: '12px'
                }}>
                  {headers[cellIndex]}:
                </span>
                <div style={{ flex: '1', textAlign: 'right' }}>
                  {cell.type === 'image' ? (
                    <img
                      src={cell.value}
                      alt="Order"
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => onImageClick && onImageClick(cell.value)}
                    />
                  ) : cell.type === 'status' ? (
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor: cell.value >= 0 ? '#d1fae5' : '#fee2e2',
                      color: cell.value >= 0 ? '#065f46' : '#991b1b'
                    }}>
                      {cell.display}
                    </span>
                  ) : (
                    <span style={{ 
                      fontSize: '13px', 
                      color: '#1f2937',
                      wordBreak: 'break-word'
                    }}>
                      {cell}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div style={{
      overflowX: 'auto',
      width: '100%',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      WebkitOverflowScrolling: 'touch'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '600px'
      }}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={{
                backgroundColor: '#f9fafb',
                padding: '12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#4b5563',
                borderBottom: '2px solid #e5e7eb',
                whiteSpace: 'nowrap'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} style={{
              transition: 'background-color 0.2s ease',
              '&:hover': { backgroundColor: '#f9fafb' }
            }}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{
                  padding: '12px',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {cell.type === 'image' ? (
                    <img
                      src={cell.value}
                      alt="Order"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => onImageClick && onImageClick(cell.value)}
                    />
                  ) : cell.type === 'status' ? (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: cell.value >= 0 ? '#d1fae5' : '#fee2e2',
                      color: cell.value >= 0 ? '#065f46' : '#991b1b',
                      whiteSpace: 'nowrap'
                    }}>
                      {cell.display}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ targetTime = "19:00" }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const target = new Date();
    const [targetHour, targetMinute] = targetTime.split(':');
    target.setHours(parseInt(targetHour), parseInt(targetMinute), 0, 0);

    if (now > target) {
      return { hours: 0, minutes: 0, seconds: 0, isReady: true };
    }
    
    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return { hours, minutes, seconds, isReady: false };
  };
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const timerStyles = {
    container: {
      backgroundColor: '#fef3c7',
      padding: '24px',
      borderRadius: '16px',
      textAlign: 'center',
      marginTop: '20px',
      border: '2px solid #fbbf24'
    },
    label: {
      fontSize: '16px',
      color: '#92400e',
      marginBottom: '12px',
      fontWeight: '600'
    },
    timer: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: timeLeft.isReady ? '#059669' : '#dc2626',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.025em'
    },
    segment: {
      display: 'inline-block',
      minWidth: '2.5ch',
      textAlign: 'center'
    }
  };

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      padding: '24px',
      borderRadius: '16px',
      textAlign: 'center',
      margin: '20px 0',
      border: '2px solid #fbbf24',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    }}>
      <p style={{ 
        margin: '0 0 12px 0', 
        fontSize: '18px',
        fontWeight: '600',
        color: '#92400e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        {timeLeft.isReady ? (
          <><CheckCircle size={20} color="#059669" /> Ready for pickup!</>
        ) : (
          <><Clock size={20} color="#dc2626" /> Time until pickup:</>
        )}
      </p>
      
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: timeLeft.isReady ? '#059669' : '#dc2626',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.025em',
        display: 'flex',
        justifyContent: 'center',
        gap: '4px'
      }}>
        {['hours', 'minutes', 'seconds'].map((unit, index) => (
          <div key={unit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '8px 12px',
              borderRadius: '8px',
              minWidth: '60px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {String(timeLeft[unit]).padStart(2, '0')}
            </div>
            <span style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
              {unit.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      
      {!timeLeft.isReady && (
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <MapPin size={16} color="#64748b" />
          Please arrive at the main gate by 7:00 PM
        </p>
      )}
    </div>
  );
};

const UnifiedQRCodeDisplay = ({ amount, isCommitmentFee = false, userIndex = 0, registrationOrder = [], selectedUserId = '' }) => {
  const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
  const isFourthUser = userOrder ? userOrder.order === 4 : userIndex === 3;
  const displayAmount = isCommitmentFee ? (isFourthUser ? 0 : 10) : amount;
  
  // For delivery fee, show "No payment needed" if amount is 0
  if (!isCommitmentFee && amount === 0) {
    return (
      <div style={{
        padding: window.innerWidth <= 480 ? '16px' : '24px',
        backgroundColor: '#f0fdf4',
        borderRadius: '16px',
        border: '2px solid #86efac',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <CheckCircle color="#16a34a" size={window.innerWidth <= 480 ? 28 : 36} />
        <p style={{ 
          margin: '12px 0 0 0', 
          fontWeight: '600', 
          color: '#166534', 
          fontSize: window.innerWidth <= 480 ? '15px' : '17px' 
        }}>
          No delivery fee for orders under RM50!
        </p>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: window.innerWidth <= 480 ? '13px' : '15px', 
          color: '#166534' 
        }}>
          Please proceed to upload your order image.
        </p>
      </div>
    );
  }

  if (isFourthUser && isCommitmentFee) {
    return (
      <div style={{
        backgroundColor: '#f0fdf4',
        padding: window.innerWidth <= 480 ? '16px' : '20px',
        borderRadius: '12px',
        border: '2px solid #86efac',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <CheckCircle color="#16a34a" size={window.innerWidth <= 480 ? 24 : 32} />
        <p style={{ 
          margin: '12px 0 0 0', 
          fontWeight: '600', 
          color: '#166534', 
          fontSize: window.innerWidth <= 480 ? '16px' : '18px' 
        }}>
          Congratulations! You're the 4th registrant!
        </p>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: window.innerWidth <= 480 ? '13px' : '15px', 
          color: '#166534' 
        }}>
          Your commitment fee is waived. Please proceed to continue.
        </p>
      </div>
    );
  }

  // Calculate responsive QR code size
  const getQRSize = () => {
    if (window.innerWidth <= 480) return '180px';
    if (window.innerWidth <= 768) return '200px';
    return '220px';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: window.innerWidth <= 480 ? '20px' : '32px',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderRadius: '20px',
      border: '2px solid #7dd3fc',
      marginBottom: '24px',
      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        fontSize: window.innerWidth <= 480 ? '16px' : '20px',
        fontWeight: 'bold',
        color: '#0369a1',
        marginBottom: window.innerWidth <= 480 ? '16px' : '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textAlign: 'center'
      }}>
        <QrCode size={window.innerWidth <= 480 ? 20 : 28} />
        {isCommitmentFee ? 'Commitment Fee Payment' : 'Delivery Fee Payment'}
      </div>
      
      <div style={{
        padding: window.innerWidth <= 480 ? '16px' : '20px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img 
          src={qrImage}
          alt="TNG Payment QR Code"
          style={{
            width: getQRSize(),
            height: getQRSize(),
            display: 'block',
            objectFit: 'contain' // Prevent squeezing
          }}
        />
      </div>
      
      <div style={{
        marginTop: window.innerWidth <= 480 ? '16px' : '20px',
        padding: window.innerWidth <= 480 ? '12px 24px' : '16px 32px',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: window.innerWidth <= 480 ? '16px' : '20px',
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
      }}>
        Amount: RM{displayAmount.toFixed(2)}
      </div>
      
      <p style={{
        fontSize: window.innerWidth <= 480 ? '13px' : '15px',
        color: '#64748b',
        marginTop: '16px',
        textAlign: 'center',
        margin: '16px 0 0 0'
      }}>
        Scan to pay
      </p>
    </div>
  );
};

// Waiting Page Component
const WaitingPage = ({ onClose, currentOrder }) => {
  const [showImage, setShowImage] = useState(false);
  
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px',
      textAlign: 'center',
      overflowY: 'auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '32px',
      padding: '48px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      maxWidth: '520px',
      width: '100%',
      position: 'relative',
      animation: 'slideUp 0.5s ease-out'
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: '#f1f5f9',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      ':hover': {
        backgroundColor: '#e2e8f0',
        transform: 'scale(1.1)'
      }
    },
    iconContainer: {
      width: '88px',
      height: '88px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto 24px',
      animation: 'successPulse 0.8s ease-out',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px'
    },
    locationInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      backgroundColor: '#f0f9ff',
      padding: '12px 24px',
      borderRadius: '12px',
      margin: '20px 0',
      border: '1px solid #bfdbfe'
    },
    orderBox: {
      padding: '24px',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      backgroundColor: '#f8fafc',
      margin: '24px 0',
      textAlign: 'left'
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '8px'
    },
    orderGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
      marginBottom: '16px'
    },
    orderLabel: {
      margin: '0',
      color: '#64748b',
      fontSize: '14px',
      fontWeight: '500'
    },
    orderValue: {
      margin: '0',
      fontWeight: '600',
      fontSize: '16px'
    },
    viewPhotoButton: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      width: '100%',
      marginTop: '16px',
      ':hover': {
        backgroundColor: '#2563eb',
        transform: 'translateY(-2px)'
      }
    },
    message: {
      fontSize: '16px',
      color: '#64748b',
      lineHeight: '1.6',
      margin: '24px 0'
    },
    button: {
      padding: '16px 40px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
      ':hover': {
        backgroundColor: '#2563eb',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button style={styles.closeButton} onClick={onClose}>
          <X size={24} color="#64748b" />
        </button>
        
        <div style={styles.iconContainer}>
          <CheckCircle size={48} color="white" strokeWidth={3} />
        </div>
        
        <h2 style={styles.title}>Your Order is Being Prepared</h2>
        
        <CountdownTimer targetTime="19:00" />
        
        <div style={styles.locationInfo}>
          <MapPin size={20} color="#3b82f6" />
          <span style={{ fontWeight: '600', color: '#1e40af' }}>
            Pickup Location: Main Gate
          </span>
        </div>

        {currentOrder && (
          <div style={styles.orderBox}>
            <div style={styles.orderHeader}>
              <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                Your Order Details
              </h4>
              <span style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {currentOrder.orderNumber}
              </span>
            </div>
            
            <div style={styles.orderGrid}>
              <div>
                <p style={styles.orderLabel}>Order Total</p>
                <p style={{ ...styles.orderValue, color: '#059669' }}>
                  RM{currentOrder.orderTotal}
                </p>
              </div>
              <div>
                <p style={styles.orderLabel}>Delivery Fee</p>
                <p style={styles.orderValue}>
                  RM{currentOrder.deliveryFee}
                </p>
              </div>
              <div>
                <p style={styles.orderLabel}>Total Amount</p>
                <p style={{ ...styles.orderValue, color: '#dc2626' }}>
                  RM{currentOrder.totalWithDelivery}
                </p>
              </div>
              <div>
                <p style={styles.orderLabel}>Student ID</p>
                <p style={styles.orderValue}>{currentOrder.studentId}</p>
              </div>
            </div>
            
            {currentOrder.orderImageURL && (
              <button
                onClick={() => setShowImage(true)}
                style={styles.viewPhotoButton}
              >
                <Camera size={20} />
                View Order Photo
              </button>
            )}
          </div>
        )}
        
        <p style={styles.message}>
          Please arrive at the main gate by 7:00 PM to receive your order
        </p>
        
        <button style={styles.button} onClick={onClose}>
          Close
        </button>
      </div>
      
      {showImage && currentOrder?.orderImageURL && (
        <ImageModal 
          imageUrl={currentOrder.orderImageURL} 
          onClose={() => setShowImage(false)} 
        />
      )}
      
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes successPulse {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Retrieve Registration Component
const RetrieveRegistration = ({ onRetrieve, isVisible, onToggle, windowWidth }) => {
  const [retrieveName, setRetrieveName] = useState('');
  const [retrieveId, setRetrieveId] = useState('');
  const [retrieveNameError, setRetrieveNameError] = useState('');
  const [retrieveIdError, setRetrieveIdError] = useState('');

  const isSmallScreen = windowWidth <= 480;
  const isMediumScreen = windowWidth <= 768;

  // Validation function for the name
  const validateRetrieveName = (name) => {
    if (!name.trim()) {
      setRetrieveNameError('Name is required');
      return false;
    }
    if (name.trim().split(' ').length < 2) {
      setRetrieveNameError('Please enter your full name (first and last name)');
      return false;
    }
    setRetrieveNameError('');
    return true;
  };

  // Validation function for the student ID
  const validateRetrieveId = (id) => {
    if (!id.trim()) {
      setRetrieveIdError('Student ID is required');
      return false;
    }
    if (id.length < 4) {
      setRetrieveIdError('Student ID must be at least 4 characters');
      return false;
    }
    if (!/\d{4}\/\d{2}$/.test(id)) {
      setRetrieveIdError('Student ID format should be like 0469/24');
      return false;
    }
    setRetrieveIdError('');
    return true;
  };

  // Handle the retrieve button click
  const handleRetrieve = () => {
    const isNameValid = validateRetrieveName(retrieveName);
    const isIdValid = validateRetrieveId(retrieveId);

    if (isNameValid && isIdValid) {
      onRetrieve(retrieveName.trim(), retrieveId.trim());
    }
  };

  // Handle the reset/clear button click
  const handleReset = () => {
    setRetrieveName('');
    setRetrieveId('');
    setRetrieveNameError('');
    setRetrieveIdError('');
  };

  const styles = {
    container: {
      backgroundColor: '#f0f9ff',
      border: '2px solid #3b82f6',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '24px',
      transition: 'all 0.3s ease'
    },
    toggleButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: isSmallScreen ? '12px' : isMediumScreen ? '14px' : '16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: isSmallScreen ? '13px' : isMediumScreen ? '14px' : '15px',
      fontWeight: '600',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#2563eb'
      }
    },
    content: {
      padding: isVisible ? (isSmallScreen ? '16px' : isMediumScreen ? '20px' : '24px') : '0',
      maxHeight: isVisible ? '400px' : '0',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: isSmallScreen ? '16px' : '18px',
      fontWeight: 'bold',
      color: '#1e40af',
      marginBottom: '12px'
    },
    input: {
      width: '100%',
      padding: isSmallScreen ? '12px 14px' : '14px 18px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      marginBottom: '16px',
      fontSize: isSmallScreen ? '14px' : '15px',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    },
    inputError: {
      borderColor: '#ef4444'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '13px',
      marginTop: '-12px',
      marginBottom: '12px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    button: {
      flex: 1,
      padding: isSmallScreen ? '12px 16px' : '14px 20px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: isSmallScreen ? '14px' : '15px',
      fontWeight: '600',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    primaryButton: {
      backgroundColor: '#059669',
      color: 'white',
      '&:hover': {
        backgroundColor: '#047857'
      }
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white',
      '&:hover': {
        backgroundColor: '#4b5563'
      }
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onToggle} style={styles.toggleButton}>
        <Search size={isSmallScreen ? 16 : 18} />
        {isVisible ? 'Hide' : 'Already Registered? Retrieve Your Registration'}
      </button>

      <div style={styles.content}>
        <h3 style={styles.title}>Retrieve Your Registration</h3>
        <p style={{
          color: '#6b7280', 
          fontSize: isSmallScreen ? '13px' : '14px',
          marginBottom: '20px' 
        }}>
          Enter your name and student ID to continue where you left off.
        </p>

        <input
          type="text"
          placeholder="Enter your full name (Bryan Ngu)"
          value={retrieveName}
          onChange={(e) => {
            setRetrieveName(e.target.value);
            validateRetrieveName(e.target.value);
          }}
          style={{ ...styles.input, ...(retrieveNameError && styles.inputError) }}
        />
        {retrieveNameError && <p style={styles.errorText}>{retrieveNameError}</p>}

        <input
          type="text"
          placeholder="Enter your student ID (0469/24)"
          value={retrieveId}
          onChange={(e) => {
            setRetrieveId(e.target.value);
            validateRetrieveId(e.target.value);
          }}
          style={{ ...styles.input, ...(retrieveIdError && styles.inputError) }}
        />
        {retrieveIdError && <p style={styles.errorText}>{retrieveIdError}</p>}

        <div style={styles.buttonGroup}>
          <button
            onClick={handleRetrieve}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            Retrieve Registration
          </button>
          <button
            onClick={handleReset}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const Crave2CaveSystem = () => {
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
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
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
  const [retrieveError, setRetrieveError] = useState('');
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
  const [scannedOrderNumber, setScannedOrderNumber] = useState('');
  const [finalOrderNumber, setFinalOrderNumber] = useState(''); // This will hold the value to be submitted
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isScanComplete, setIsScanComplete] = useState(false);
  const [scanMode, setScanMode] = useState('scanning'); // 'scanning', 'confirm', 'manual'
  const [scannedData, setScannedData] = useState({ orderNumber: '', orderTotal: '' });
  const [showScanConfirmation, setShowScanConfirmation] = useState(false);
  

  const ADMIN_PASSCODE = 'byyc';
  const isFourthUser = currentOrder ? (currentOrder.order === 4) : (currentUserIndex === 3);

  useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Add global styles
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.5;
      }
      
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* Responsive styles */
      @media (max-width: 1024px) {
        .grid {
          grid-template-columns: 1fr !important;
        }
      }
      
      @media (max-width: 768px) {
        html {
          font-size: 14px;
        }
        
        .card {
          padding: 20px !important;
        }
        
        .stat-card {
          padding: 20px !important;
        }
        
        h1, h2 {
          font-size: 1.5rem !important;
        }
        
        h3 {
          font-size: 1.25rem !important;
        }
        
        .chart-container {
          height: 250px !important;
        }
      }
      
      @media (max-width: 480px) {
        html {
          font-size: 12px;
        }
        
        .container {
          padding: 10px !important;
        }
        
        .card {
          padding: 16px !important;
          border-radius: 12px !important;
        }
        
        .button {
          padding: 12px 20px !important;
          font-size: 14px !important;
        }
        
        .input {
          padding: 12px 16px !important;
          font-size: 14px !important;
        }
        
        .stat-value {
          font-size: 1.5rem !important;
        }
        
        table {
          font-size: 12px !important;
        }
        
        th, td {
          padding: 8px !important;
        }
      }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      }
      70% {
        box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
      }
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes successPulse {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 768px) {
      html {
        font-size: 14px;
      }
    }
    
    @media (max-width: 480px) {
      html {
        font-size: 12px;
      }
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
}, []);

useEffect(() => {
  // Function to check if it's a new day in Malaysia time
  const checkForNewDay = () => {
    const now = new Date();
    const malaysiaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"}));
    const lastAccessDate = localStorage.getItem('lastAccessDate');
    const todayMalaysia = malaysiaTime.toDateString();
    
    if (lastAccessDate !== todayMalaysia) {
      // It's a new day in Malaysia - reset today's data
      localStorage.setItem('lastAccessDate', todayMalaysia);
      
      // Clear today's data
      setTodayOrders([]);
      setTodayUsers([]);
      setPrebookUsers([]);
      setMinOrderReached(false);
      setSystemActivatedToday(false);
      
      // Reset user state
      setUserStep(1);
      setStudentName('');
      setStudentId('');
      setSelectedUserId('');
      setOrderTotal('');
      setOrderImage(null);
      setReceiptFile(null);
      setPaymentProof(null);
      setOrderConfirmed(false);
      setCurrentOrder(null);
      
      // Refetch data for the new day
      fetchAllData();
      console.log('New day detected - data reset at', malaysiaTime);
    }
  };

  // Calculate time until next midnight in Malaysia
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const malaysiaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"}));
    const tomorrow = new Date(malaysiaTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return tomorrow.getTime() - malaysiaTime.getTime();
  };

  // Check immediately on mount
  checkForNewDay();

  // Set timeout for next midnight
  let midnightTimeout = setTimeout(() => {
    checkForNewDay();
    // After midnight, set up daily interval
    const dailyInterval = setInterval(checkForNewDay, 24 * 60 * 60 * 1000); // Check every 24 hours
    
    // Store interval ID for cleanup
    window.dailyInterval = dailyInterval;
  }, getTimeUntilMidnight());

  // Also check every minute in case user's computer time changes
  const minuteInterval = setInterval(checkForNewDay, 60000);
  
  // Beautiful Message Component
  const BeautifulMessage = ({ type = 'info', title, message, icon, children, onClose }) => {
    const getMessageStyles = () => {
      switch (type) {
        case 'success':
          return {
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '2px solid #10b981',
            iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            iconColor: 'white',
            textColor: '#047857'
          };
        case 'warning':
          return {
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            iconColor: 'white',
            textColor: '#92400e'
          };
        case 'error':
          return {
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #ef4444',
            iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            iconColor: 'white',
            textColor: '#991b1b'
          };
        default:
          return {
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '2px solid #3b82f6',
            iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            iconColor: 'white',
            textColor: '#1e40af'
          };
      }
    };

    const messageStyles = getMessageStyles();

    return (
      <div style={{
        background: messageStyles.background,
        border: messageStyles.border,
        borderRadius: '20px',
        padding: window.innerWidth <= 480 ? '20px' : '28px',
        marginBottom: '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative pattern */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: window.innerWidth <= 480 ? '12px' : '16px'
        }}>
          {icon && (
            <div style={{
              width: window.innerWidth <= 480 ? '48px' : '56px',
              height: window.innerWidth <= 480 ? '48px' : '56px',
              borderRadius: '16px',
              background: messageStyles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              {React.cloneElement(icon, { 
                size: window.innerWidth <= 480 ? 24 : 28, 
                color: messageStyles.iconColor 
              })}
            </div>
          )}
          
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: window.innerWidth <= 480 ? '16px' : '18px',
                fontWeight: 'bold',
                color: messageStyles.textColor
              }}>
                {title}
              </h4>
            )}
            
            <p style={{
              margin: '0 0 12px 0',
              fontSize: window.innerWidth <= 480 ? '14px' : '15px',
              color: messageStyles.textColor,
              lineHeight: '1.5'
            }}>
              {message}
            </p>
            
            {children}
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: messageStyles.textColor,
                transition: 'all 0.2s ease'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const isAuthenticatedFromStorage = localStorage.getItem('isAdminAuthenticated');
  if (isAuthenticatedFromStorage === 'true') {
    setIsAuthenticated(true);
  }

  const fetchAllData = async () => {
    try {
      setLoadingUsers(true);
      setLoadingOrders(true);
      setLoadingHistory(true);
      
      const [users, orders, history] = await Promise.all([
        getPrebookUsers(),
        getOrders(),
        getHistoryData()
      ]);
      
      filterTodayData(orders, users);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingUsers(false);
      setLoadingOrders(false);
      setLoadingHistory(false);
    }
  };

  fetchAllData();

  // Cleanup
  return () => {
    clearTimeout(midnightTimeout);
    clearInterval(minuteInterval);
    if (window.dailyInterval) {
      clearInterval(window.dailyInterval);
    }
  };
}, []);

const canRegisterToday = (user) => {
  if (!user.lastOrderDate) return true;
  
  const lastOrder = new Date(user.lastOrderDate);
  const today = new Date();
  
  // Allow registration if last order was on a different day
  return lastOrder.toDateString() !== today.toDateString();
};

const filterTodayData = (orders = [], users = []) => {
  // Get today's date in Malaysia timezone
  const now = new Date();
  const malaysiaDateStr = now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
  const malaysiaDate = new Date(malaysiaDateStr);
  const todayString = malaysiaDate.toISOString().split('T')[0];

  // Filter today's orders - check timestamp starts with today's date
  const todayOrdersFiltered = orders.filter(order => {
    if (!order.timestamp) return false;
    const orderDate = new Date(order.timestamp);
    const orderDateStr = orderDate.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
    const orderMalaysiaDate = new Date(orderDateStr);
    const orderDateString = orderMalaysiaDate.toISOString().split('T')[0];
    return orderDateString === todayString;
  });
  
  // Get today's users - filter by registration date OR timestamp
  const todayUsersFiltered = users.filter(user => {
    // Check if user registered today
    if (user.registrationDate === todayString) return true;
    
    // Also check timestamp in case registrationDate is missing
    if (user.timestamp) {
      const userDate = new Date(user.timestamp);
      const userDateStr = userDate.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
      const userMalaysiaDate = new Date(userDateStr);
      const userDateString = userMalaysiaDate.toISOString().split('T')[0];
      return userDateString === todayString;
    }
    
    return false;
  });
  
  setTodayOrders(todayOrdersFiltered);
  setTodayUsers(todayUsersFiltered);
  
  // Check if today's users have paid commitment fee today
  const todayPaidUsers = todayUsersFiltered.filter(u => u.commitmentPaid);
  
  const isActivatedToday = todayPaidUsers.length >= 3;
  setMinOrderReached(isActivatedToday);
  setSystemActivatedToday(isActivatedToday);
  
  console.log(`Today (${todayString}): ${todayUsersFiltered.length} users, ${todayPaidUsers.length} paid, ${todayOrdersFiltered.length} orders`);
};
  
  

  const showSuccessAnimation = (title, message, additionalInfo = null, duration = 2000, showOkButton = true, onCloseCallback = null) => {
    setSuccessConfig({ 
      title, 
      message, 
      additionalInfo, 
      duration,
      showOkButton,
      onClose: onCloseCallback 
    });
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

  const scanReceipt = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await fetch('http://localhost:3001/api/scan', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('API or Server Error:', data);
      throw new Error(data.message || 'Failed to process receipt via proxy.');
    }

    // The server now does the parsing, so we just return the clean data
    return {
      orderNumber: data.orderNumber,
      orderTotal: data.orderTotal,
    };

  } catch (error) {
    console.error("Error calling backend for scanning:", error);
    throw error;
  }
};

  // Firebase functions
  const savePrebookUser = async (user) => {
  try {
    // Get Malaysia timezone date
    const now = new Date();
    const malaysiaDateStr = now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
    const malaysiaDate = new Date(malaysiaDateStr);
    const todayString = malaysiaDate.toISOString().split('T')[0];
    
    const userWithDate = {
      ...user,
      registrationDate: todayString,
      timestamp: new Date().toISOString() // Keep original timestamp for reference
    };
    
    const docRef = await addDoc(collection(db, 'prebookUsers'), userWithDate);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

  const uploadFileToStorage = async (file) => {
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);
      return fileURL;
    } catch (e) {
      console.error("Error uploading file:", e);
      throw e;
    }
  };

  const updatePrebookUser = async (userId, updates) => {
    try {
      const userRef = doc(db, 'prebookUsers', userId);
      await updateDoc(userRef, updates);
    } catch (e) {
      console.error('Error updating user: ', e);
      throw e;
    }
  };

  const getPrebookUsers = async () => {
  try {
    // Get today's date in Malaysia timezone
    const now = new Date();
    const malaysiaDateStr = now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
    const malaysiaDate = new Date(malaysiaDateStr);
    const todayString = malaysiaDate.toISOString().split('T')[0];

    // Query for today's users
    const usersQuery = query(
      collection(db, 'prebookUsers'), 
      where("registrationDate", "==", todayString)
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      firestoreId: doc.id, 
      ...doc.data() 
    }));
    
    // Sort users by timestamp to maintain registration order
    const sortedUsers = users.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    setPrebookUsers(sortedUsers);
    
    // Create registration order array
    const orderArray = sortedUsers.map((user, index) => ({
      userId: user.firestoreId,
      order: index + 1
    }));
    setRegistrationOrder(orderArray);

    // Check paid users for today only
    const paidUsers = sortedUsers.filter(u => u.commitmentPaid);
    const newMinOrderReached = paidUsers.length >= 3;
    setMinOrderReached(newMinOrderReached);
    
    return sortedUsers;
  } catch (e) {
    console.error('Error getting users: ', e);
    return [];
  }
};

  const saveOrder = async (order) => {
  try {
    // Ensure order has proper timestamp
    const orderWithTimestamp = {
      ...order,
      timestamp: new Date().toISOString(),
      orderDate: new Date().toLocaleDateString("en-US", {timeZone: "Asia/Kuala_Lumpur"})
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    await updateDailyHistory();
    return docRef.id;
  } catch (e) {
    console.error('Error saving order: ', e);
    throw e;
  }
};

  const getOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const allOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(allOrders);
      return allOrders;
    } catch (e) {
      console.error('Error getting orders: ', e);
      return [];
    }
  };

  const updateDailyHistory = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const usersSnapshot = await getDocs(collection(db, 'prebookUsers'));
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, firestoreId: doc.id, ...doc.data() }));
      const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const todayOrdersTemp = allOrders.filter(order => isToday(order.timestamp));
      const todayUserIds = new Set(todayOrdersTemp.map(order => order.userId));
      const todayUsersTemp = allUsers.filter(user => 
        isToday(user.timestamp) || todayUserIds.has(user.firestoreId)
      );
      
      const todayRevenue = todayUsersTemp.filter(u => u.commitmentPaid).length * 10 + 
                          todayOrdersTemp.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
      const driverCost = todayOrdersTemp.length > 0 ? 30 : 0;
      const todayProfit = todayRevenue - driverCost;
      
      const historyQuery = query(collection(db, 'history'), where('date', '==', today));
      const historySnapshot = await getDocs(historyQuery);
      
      const historyData = {
        date: today,
        timestamp: new Date().toISOString(),
        orders: todayOrdersTemp,
        users: todayUsersTemp,
        totalOrders: todayOrdersTemp.length,
        totalUsers: todayUsersTemp.length,
        registeredUsers: todayUsersTemp.filter(u => isToday(u.timestamp)).length,
        paidUsers: todayUsersTemp.filter(u => u.commitmentPaid).length,
        totalRevenue: todayRevenue,
        driverCost: driverCost,
        profit: todayProfit,
        commitmentFees: todayUsersTemp.filter(u => u.commitmentPaid).length * 10,
        deliveryFees: todayOrdersTemp.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)
      };
      
      if (historySnapshot.empty) {
        await addDoc(collection(db, 'history'), historyData);
      } else {
        const docId = historySnapshot.docs[0].id;
        await updateDoc(doc(db, 'history', docId), historyData);
      }
      
      await getPrebookUsers();
      await getOrders();
      await getHistoryData();
    } catch (error) {
      console.error('Error updating daily history:', error);
    }
  };

  const getHistoryData = async () => {
    setLoadingHistory(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'history'));
      const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistoryData(history.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (e) {
      console.error('Error getting history: ', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isToday = (dateString) => {
  if (!dateString) return false;
  
  // Parse the date
  const date = new Date(dateString);
  const dateMalaysiaStr = date.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
  const dateMalaysia = new Date(dateMalaysiaStr);
  
  // Get today in Malaysia timezone
  const now = new Date();
  const todayMalaysiaStr = now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
  const todayMalaysia = new Date(todayMalaysiaStr);
  
  return (
    dateMalaysia.getDate() === todayMalaysia.getDate() &&
    dateMalaysia.getMonth() === todayMalaysia.getMonth() &&
    dateMalaysia.getFullYear() === todayMalaysia.getFullYear()
  );
};

  const getTotalHistoryStats = () => {
    const totalRegistered = historyData.reduce((sum, entry) => sum + (entry.registeredUsers || 0), 0);
    const totalRevenue = historyData.reduce((sum, entry) => sum + (entry.totalRevenue || 0), 0);
    const totalProfit = historyData.reduce((sum, entry) => sum + (entry.profit || 0), 0);
    const totalOrders = historyData.reduce((sum, entry) => sum + (entry.totalOrders || 0), 0);
    
    const todayString = new Date().toISOString().split('T')[0];
    const todayInHistory = historyData.some(entry => entry.date === todayString);
    
    if (!todayInHistory) {
      const todayRegistered = todayUsers.filter(u => isToday(u.timestamp)).length;
      const todayRevenue = todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                          todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
      const todayProfit = todayRevenue - (todayOrders.length > 0 ? 30 : 0);
      
      return {
        totalRegistered: totalRegistered + todayRegistered,
        totalRevenue: totalRevenue + todayRevenue,
        totalProfit: totalProfit + todayProfit,
        totalOrders: totalOrders + todayOrders.length
      };
    }
    
    return { totalRegistered, totalRevenue, totalProfit, totalOrders };
  };

  // Handle retrieve registration
  const handleRetrieveRegistration = (name, id) => {
  setRetrieveError('');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Find user registered TODAY with matching name and ID
  const foundUser = prebookUsers.find(user => 
    user.name && 
    user.name.toLowerCase() === name.toLowerCase() && 
    user.studentId === id &&
    user.timestamp && 
    user.timestamp.startsWith(todayString) // Check if registered today
  );

  if (!foundUser) {
    showSuccessAnimation(
      "Registration Not Found",
      `We couldn't find your registration details for today (${todayString})`,
      <BeautifulMessage
        type="warning"
        title="Daily Registration Required"
        message={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px',
            marginTop: '12px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <Clock size={18} color="#3b82f6" />
              <span style={{ color: '#1e40af' }}>
                Registrations are only valid for the current day
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <Users size={18} color="#3b82f6" />
              <span style={{ color: '#1e40af' }}>
                Please register again for today's delivery
              </span>
            </div>
          </div>
        }
        icon={<Calendar />}
      />,
      0,
      true
    );
    return;
  }

  const userTodayOrder = todayOrders.find(order => 
    order.userId === foundUser.firestoreId
  );

  if (userTodayOrder) {
    setCurrentOrder(userTodayOrder);
  }

  // Check if user has already ordered today
  if (foundUser.orderSubmitted && isToday(foundUser.lastOrderDate)) {
    showSuccessAnimation(
      "Order Already Submitted",
      `Hi ${foundUser.name}, you have already submitted your order today.`,
      <BeautifulMessage
        type="info"
        title="Daily Order Limit"
        message="You can only submit one order per day."
        icon={<Package />}
        onClose={() => setOrderConfirmed(true)}
      >
        <p style={{ margin: "8px 0 0", color: "#3b82f6", fontWeight: 500 }}>
          Redirecting to your order status...
        </p>
      </BeautifulMessage>,
      3000,
      true,
      () => setOrderConfirmed(true)
    );
    return;
  }
  
  // Find the user's registration order
  const userOrder = registrationOrder.find(order => order.userId === foundUser.firestoreId);
  const userIndex = userOrder ? userOrder.order - 1 : prebookUsers.findIndex(u => u.firestoreId === foundUser.firestoreId);
  setCurrentUserIndex(userIndex);

  // Check current system status
  const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
  const isSystemActivated = paidUsersCount >= 3;

  setStudentName(foundUser.name);
  setStudentId(foundUser.studentId);
  setSelectedUserId(foundUser.firestoreId);

  if (foundUser.orderSubmitted) {
    showSuccessAnimation(
      `Welcome back ${foundUser.name}!`,
      'Your order has already been submitted.',
      <p>Redirecting to order status page...</p>,
      2500,
      true
    );
    setTimeout(() => setOrderConfirmed(true), 1500);
  } else if (foundUser.commitmentPaid || (isSystemActivated && userIndex >= 3)) {
    // User paid commitment fee OR is 4th+ user with system activated
    showSuccessAnimation(
      `Welcome back ${foundUser.name}!`,
      isSystemActivated && userIndex >= 3 
        ? 'System is active! You can proceed directly to order submission.' 
        : 'Your payment has been confirmed. You can now submit your order.',
      null,
      2500,
      true
    );
    setUserStep(3);
  } else {
    // First 3 users who haven't paid yet
    if (isSystemActivated) {
      // Shouldn't happen, but if system is activated and they're in first 3 without payment
      showSuccessAnimation(
        `Welcome back ${foundUser.name}!`,
        'Please complete your commitment fee payment to continue.',
        null,
        2500,
        true
      );
      setUserStep(2);
    } else {
      showSuccessAnimation(
        `Welcome back ${foundUser.name}!`,
        'Please complete your commitment fee payment to continue.',
        <p>We still need {3 - paidUsersCount} more paid users before order submission opens.</p>,
        5000,
        true,
        () => setUserStep(2)
      );
      setUserStep(2);
    }
  }

  setShowRetrieve(false);
};

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingTop: '90px'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      width: '100%',
      boxSizing: 'border-box'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      marginBottom: '24px',
      border: '1px solid #f1f5f9',
      '@media (max-width: 768px)': {
        padding: '24px'
      }
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    cardTitle: {
      fontSize: '24px',
      fontWeight: '700',
      margin: 0,
      color: '#1e293b'
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      },
      '@media (max-width: 480px)': {
        gap: '16px'
      }
    },
    progressBar: {
      marginBottom: '28px'
    },
    progressText: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '10px',
      fontWeight: '500'
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
      padding: '16px 20px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      marginBottom: '16px',
      fontSize: '16px',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      backgroundColor: '#f8fafc',
      '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      },
      '@media (max-width: 768px)': {
        padding: '14px 18px',
        fontSize: '15px'
      },
      '@media (max-width: 480px)': {
        padding: '12px 14px',
        fontSize: '14px'
      }
    },
    button: {
      width: '100%',
      padding: '16px 32px',
      borderRadius: '12px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
      },
      '&:active': {
        transform: 'translateY(0)'
      },
      '@media (max-width: 768px)': {
        padding: '14px 24px',
        fontSize: '15px'
      },
      '@media (max-width: 480px)': {
        padding: '12px 16px',
        fontSize: '14px'
      }
    },
    inputError: {
      borderColor: '#ef4444'
    },
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
    authContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '500px'
    },
    passcodeInput: {
      position: 'relative',
      marginBottom: '20px',
      width: '100%',
      maxWidth: '320px'
    },
    toggleButton: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '8px'
    },
    orderItem: {
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
        transform: 'translateY(-2px)'
      }
    },
    orderImage: {
      maxWidth: '200px',
      maxHeight: '200px',
      borderRadius: '12px',
      marginTop: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.05)'
      }
    },
    feeBreakdown: {
      backgroundColor: '#fef3c7',
      padding: '24px',
      borderRadius: '16px',
      border: '2px solid #fbbf24',
      marginBottom: '20px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '28px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid #f1f5f9',
      '@media (max-width: 768px)': {
        padding: '16px',
        gap: '12px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      },
      '@media (max-width: 480px)': {
        padding: '12px',
        gap: '10px',
        borderRadius: '10px',
        minHeight: 'auto'
      },
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        transform: 'translateY(-4px)'
      }
    },
    statIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      '@media (max-width: 768px)': {
        width: '48px',
        height: '48px',
        borderRadius: '12px'
      },
      '@media (max-width: 480px)': {
        width: '40px',
        height: '40px',
        borderRadius: '10px'
      }
    },
    statContent: {
      flex: 1,
      minWidth: 0
    },
    statLabel: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '4px',
      fontWeight: '500',
      '@media (max-width: 768px)': {
        fontSize: '12px',
        marginBottom: '2px'
      },
      '@media (max-width: 480px)': {
        fontSize: '11px',
        marginBottom: '1px',
        lineHeight: '1.3'
      }
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1e293b',
      lineHeight: '1.2',
      '@media (max-width: 768px)': {
        fontSize: '20px'
      },
      '@media (max-width: 480px)': {
        fontSize: '18px',
        lineHeight: '1.1'
      }
    },
    formSection: {
        backgroundColor: '#f8fafc',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
    },
    formSectionTitle: {
        margin: '0 0 16px 0',
        color: '#1e293b',
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
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

  const handlePrebook = async () => {
  const todayString = new Date().toISOString().split('T')[0];
  const isNameValid = validateName(studentName);
  const isIdValid = validateStudentId(studentId);
  const paidCount = todayUsers.filter(u => u.commitmentPaid).length;
  const todayPaidUsersCount = todayUsers.filter(u => u.commitmentPaid).length;
  const isSystemActivated = todayPaidUsersCount >= 3;

  if (!isNameValid || !isIdValid) {
    return;
  }

  const existingUser = prebookUsers.find(user => 
    user.timestamp && user.timestamp.startsWith(todayString) && (
      user.studentId === studentId || 
      user.name.toLowerCase() === studentName.toLowerCase()
    )
  );

  if (existingUser) {
    // Determine what exactly is duplicated
    let message = 'You have already registered today.';
    
    if (existingUser.studentId === studentId && 
        existingUser.name.toLowerCase() === studentName.toLowerCase()) {
      message = `Both your name (${studentName}) and student ID (${studentId}) have been used for registration today.`;
    } else if (existingUser.studentId === studentId) {
      message = `Student ID ${studentId} has already been used for registration today.`;
    } else if (existingUser.name.toLowerCase() === studentName.toLowerCase()) {
      message = `Name "${studentName}" has already been used for registration today.`;
    }

    showSuccessAnimation(
      'Registration Already Exists',
      message,
      <BeautifulMessage
        type="error"
        message="Please try again tomorrow."
        icon={<AlertCircle />}
      />,
      1500,
      true
    );
    return;
  }

  showLoadingAnimation('Registering...');

  try {
    // Check how many users have paid commitment fee
    const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
    const isSystemActivated = paidUsersCount >= 3;
    const registrationIndex = prebookUsers.length;
    const isFourthOrLaterUser = isSystemActivated || registrationIndex >= 3;
    
    const newUser = {
      name: studentName,
      studentId: studentId,
      timestamp: new Date().toISOString(),
      hasOrdered: false,
      commitmentPaid: isFourthOrLaterUser, // Auto-paid if 4th+ user or system activated
      orderTotal: 0,
      orderSubmitted: false,
      wasFourthUser: isFourthOrLaterUser,
      registrationOrder: registrationIndex + 1
    };

    const firestoreId = await savePrebookUser(newUser);
    const userWithId = { ...newUser, id: firestoreId, firestoreId };

    setPrebookUsers(prev => [...prev, userWithId]);
    setSelectedUserId(firestoreId);
    setCurrentUserIndex(registrationIndex);
    
    hideLoadingAnimation();
    
    if (isFourthOrLaterUser) {
      // 4th user onwards - skip commitment fee, go directly to order
      showSuccessAnimation(
        'Registration Successful!',
        'You have been registered for the food delivery service.',
        <p style={{ color: '#059669', fontWeight: '600', fontSize: '18px' }}>
          🎉 System is active! You can proceed directly to order submission.
        </p>,
        2500,
        true,
        () => setUserStep(3) // Go directly to order submission
      );
    } else {
      // First 3 users - need to pay commitment fee
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

  const handleOrderImageSelect = async (file) => {
  if (!file) return;

  // Reset state for a new scan
  setOrderImage(file);
  setScanError('');
  setScannedData({ orderNumber: '', orderTotal: '' });
  setScanMode('scanning');
  setShowScanConfirmation(false);
  setIsScanning(true);

  try {
    const compressedFile = await compressImage(file);
    const scanResult = await scanReceipt(compressedFile);

    // Store scanned data
    const scannedOrderNumber = scanResult.orderNumber || '';
    const scannedOrderTotal = scanResult.orderTotal || '';
    
    setScannedData({
      orderNumber: scannedOrderNumber,
      orderTotal: scannedOrderTotal
    });

    // Check if we got both values
    if (scannedOrderNumber && scannedOrderTotal) {
      setScanMode('confirm');
      setShowScanConfirmation(true);
    } else {
      // Missing data - show manual entry option
      setScanMode('manual');
      let errorMessage = 'Some information could not be detected:\n';
      if (!scannedOrderNumber) {
        errorMessage += '• Order number not found\n';
      }
      if (!scannedOrderTotal) {
        errorMessage += '• Order total not found\n';
      }
      errorMessage += '\nPlease enter the missing information manually.';
      setScanError(errorMessage);
      
      // Pre-fill any successfully scanned values
      if (scannedOrderTotal) setOrderTotal(scannedOrderTotal);
      if (scannedOrderNumber) setFinalOrderNumber(scannedOrderNumber);
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
    // User confirmed the scanned data
    setOrderTotal(scannedData.orderTotal);
    setFinalOrderNumber(scannedData.orderNumber);
    setShowScanConfirmation(false);
    setScanMode('manual'); // Allow editing if needed
    showSuccessAnimation(
      'Scan Successful!',
      'Order details have been filled automatically.',
      null,
      1500,
      true
    );
  } else {
    // User wants to rescan or enter manually
    setShowScanConfirmation(false);
    setScanMode('manual');
    setScanError('Please upload a clearer image or enter the details manually.');
  }
  setIsScanComplete(true);
};

// Add this component for the scan confirmation modal
const ScanConfirmationModal = ({ scannedData, onConfirm, onReject, orderImage }) => {
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: windowWidth <= 480 ? '24px' : '32px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
    },
    header: {
      fontSize: windowWidth <= 480 ? '20px' : '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#1e293b',
      textAlign: 'center'
    },
    dataSection: {
      backgroundColor: '#f8fafc',
      padding: windowWidth <= 480 ? '16px' : '20px',
      borderRadius: '12px',
      marginBottom: '20px'
    },
    dataRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: windowWidth <= 480 ? '10px 0' : '12px 0',
      borderBottom: '1px solid #e2e8f0',
      gap: '8px'
    },
    label: {
      fontWeight: '600',
      color: '#64748b',
      fontSize: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '14px' : '16px',
      flexShrink: 0,
      minWidth: 0
    },
    value: {
      fontWeight: 'bold',
      fontSize: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '14px' : '18px',
      color: '#1e293b',
      textAlign: 'right',
      wordBreak: 'break-all',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      flex: 1,
      minWidth: 0
    },
    imagePreview: {
      width: '100%',
      maxHeight: windowWidth <= 480 ? '150px' : '200px',
      objectFit: 'contain',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0'
    },
    buttonGroup: {
      display: 'flex',
      gap: windowWidth <= 480 ? '8px' : '12px',
      marginTop: windowWidth <= 480 ? '20px' : '24px',
      flexWrap: windowWidth <= 360 ? 'wrap' : 'nowrap'
    },
    button: {
      flex: windowWidth <= 360 ? '1 1 100%' : 1,
      padding: windowWidth <= 480 ? '10px 16px' : '14px 24px',
      borderRadius: '10px',
      border: 'none',
      fontSize: windowWidth <= 480 ? '13px' : windowWidth <= 768 ? '14px' : '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h3 style={modalStyles.header}>
          <Scan size={windowWidth <= 480 ? 24 : 28} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Confirm Scanned Details
        </h3>

        {orderImage && (
          <img 
            src={URL.createObjectURL(orderImage)} 
            alt="Scanned receipt" 
            style={modalStyles.imagePreview}
          />
        )}

        <div style={modalStyles.dataSection}>
          <div style={modalStyles.dataRow}>
            <span style={modalStyles.label}>
              {windowWidth <= 360 ? 'Order #:' : 'Order Number:'}
            </span>
            <span style={modalStyles.value} title={scannedData.orderNumber}>
              {scannedData.orderNumber}
            </span>
          </div>
          <div style={{ ...modalStyles.dataRow, borderBottom: 'none' }}>
            <span style={modalStyles.label}>
              {windowWidth <= 360 ? 'Total:' : 'Order Total:'}
            </span>
            <span style={modalStyles.value}>
              RM {scannedData.orderTotal}
            </span>
          </div>
        </div>

        <p style={{ 
          textAlign: 'center', 
          color: '#64748b', 
          marginBottom: '20px',
          fontSize: windowWidth <= 480 ? '13px' : windowWidth <= 768 ? '14px' : '15px'
        }}>
          Are these details correct?
        </p>

        <div style={modalStyles.buttonGroup}>
          <button
            onClick={() => onConfirm(true)}
            style={{
              ...modalStyles.button,
              backgroundColor: '#10b981',
              color: 'white'
            }}
          >
            <CheckCircle size={windowWidth <= 480 ? 16 : 18} style={{ flexShrink: 0 }} />
            <span>{windowWidth <= 360 ? 'Yes' : 'Yes, Correct'}</span>
          </button>
          <button
            onClick={() => onConfirm(false)}
            style={{
              ...modalStyles.button,
              backgroundColor: '#ef4444',
              color: 'white'
            }}
          >
            <X size={windowWidth <= 480 ? 16 : 18} style={{ flexShrink: 0 }} />
            <span>{windowWidth <= 360 ? 'No' : 'No, Re-enter'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

  const handleCommitmentPayment = async () => {
  const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
  const isFourthUser = userOrder ? userOrder.order === 4 : currentUserIndex === 3;
  // Update to check today's users for system activation
  const currentTodayPaidUsers = todayUsers.filter(u => u.commitmentPaid).length + 1;
  const isMinimumMet = currentTodayPaidUsers >= 3;
  setMinOrderReached(isMinimumMet);
  setSystemActivatedToday(isMinimumMet);
  
  if (!isFourthUser && !receiptFile) {
    alert('Please upload payment receipt');
    return;
  }

  showLoadingAnimation(isFourthUser ? 'Processing...' : 'Uploading receipt...');

  try {
    let receiptURL = null;
    
    if (!isFourthUser) {
      receiptURL = await uploadFileToStorage(receiptFile);
    }

    // Update the user directly without batch
    await updatePrebookUser(selectedUserId, {
      commitmentPaid: true,
      paymentReceiptUploaded: !isFourthUser,
      receiptURL: receiptURL,
      wasFourthUser: isFourthUser
    });

    // Update local state
    setPrebookUsers(prev => prev.map(user =>
      user.firestoreId === selectedUserId
        ? { ...user, commitmentPaid: true }
        : user
    ));
    

    const currentPaidUsers = prebookUsers.filter(u => u.commitmentPaid).length + 1;
    
    hideLoadingAnimation();
    
    // Check if minimum is reached (3 paid users OR we're at 4+ users)
    const paidCount = todayUsers.filter(u => u.commitmentPaid).length;
    const isMinimumMet = paidCount >= 3;
    setSystemActivatedToday(isMinimumMet);
    const minOrderReached = systemActivatedToday;
    
    if (isMinimumMet) {
      showSuccessAnimation(
        isFourthUser ? 'Processing Complete!' : 'Payment Confirmed!',
        isFourthUser ? 'As the 4th registrant, you can proceed without payment!' : 'Your RM10 commitment fee has been received.',
        <p>You can now submit your order!</p>,
        1500,
        true,
        () => setUserStep(3)
      );
    } else {
      const remainingUsers = 3 - currentPaidUsers;
      showSuccessAnimation(
        isFourthUser ? 'Processing Complete!' : 'Payment Confirmed!',
        isFourthUser ? 'As the 4th registrant, you can proceed without payment!' : 'Your RM10 commitment fee has been received.',
        <p>We need {remainingUsers} more paid user{remainingUsers > 1 ? 's' : ''} before order submission opens. Please check back later!</p>,
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

  const handleOrderSubmission = async () => {
  // --- Validations ---
  if (!orderTotal) {
    alert('Please enter order total or scan a receipt.');
    return;
  }
  if (!finalOrderNumber || !finalOrderNumber.trim()) {
    alert('Please provide the order number from your receipt.');
    return;
  }
  const totalAmount = parseFloat(orderTotal);
  if (isNaN(totalAmount)) {
    alert('Please enter a valid order total.');
    return;
  }
  if (!orderImage) {
    alert('Please upload an image of your order receipt.');
    return;
  }

  // --- Fee Calculation ---
  const deliveryFee = calculateDeliveryFee(totalAmount);
  const userIndex = prebookUsers.findIndex(u => u.firestoreId === selectedUserId);
  const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
  const commitmentFeeDeducted = (userIndex < 3 && user?.commitmentPaid) ? 10 : 0;
  const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);
  const isFourthOrLaterUser = userIndex >= 3;

  // --- Delivery Fee Payment Proof Check ---
  if (actualDeliveryFee > 0 && !paymentProof) {
    showSuccessAnimation(
      'Payment Receipt Required',
      'Please upload your payment receipt to continue.',
      <BeautifulMessage
        type="warning"
        message={`Your delivery fee is RM${actualDeliveryFee.toFixed(2)}. Please upload proof of payment.`}
        icon={<Receipt />}
      />,
      3000,
      true
    );
    return;
  }

  showLoadingAnimation('Processing order...');

  try {
    // --- Image Processing and Uploading ---
    const compressionPromises = [compressImage(orderImage)];
    if (paymentProof) {
      compressionPromises.push(compressImage(paymentProof));
    }
    const compressedImages = await Promise.all(compressionPromises);
    const compressedOrderImage = compressedImages[0];
    const compressedPaymentProof = compressedImages[1] || null;

    const uploadPromises = [uploadFileToStorage(compressedOrderImage)];
    if (compressedPaymentProof) {
      uploadPromises.push(uploadFileToStorage(compressedPaymentProof));
    }
    const uploadedFiles = await Promise.all(uploadPromises);
    const orderImageURL = uploadedFiles[0];
    const paymentProofURL = uploadedFiles[1] || null;

    // --- Create Final Order Data Object ---
    // This object now contains the orderTotal and finalOrderNumber from the state,
    // which were populated by the scanning process.
    const orderData = {
      userId: selectedUserId,
      userName: studentName,
      studentId: studentId,
      orderTotal: totalAmount,
      originalDeliveryFee: deliveryFee,
      deliveryFee: actualDeliveryFee,
      commitmentFeeDeducted: commitmentFeeDeducted,
      totalWithDelivery: totalAmount + actualDeliveryFee,
      timestamp: new Date().toISOString(),
      orderImageURL: orderImageURL,
      paymentProofURL: paymentProofURL,
      orderNumber: finalOrderNumber.trim(),
      status: 'pending',
      userPosition: userIndex + 1,
      wasFourthUser: isFourthOrLaterUser
    };

    // --- Save Data to Firestore ---
    await saveOrder(orderData);
    await updatePrebookUser(selectedUserId, {
      orderTotal: orderData.orderTotal,
      orderSubmitted: true,
      hasOrdered: true,
      orderImageURL: orderData.orderImageURL,
      lastOrderDate: new Date().toISOString(),
      wasFourthUser: isFourthOrLaterUser
    });

    setCurrentOrder(orderData);
    hideLoadingAnimation();

    // --- Show Success Confirmation ---
    showSuccessAnimation(
      'Order Confirmed!',
      'Your order has been successfully submitted.',
      (
        <div>
          <Truck size={32} color="#ea580c" style={{ marginBottom: '8px' }} />
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#92400e', fontWeight: '600' }}>
            Driver Pickup at 7:00 PM
          </p>
          <CountdownTimer targetTime="19:00" />
        </div>
      ),
      0,
      true,
      () => setOrderConfirmed(true)
    );

  } catch (error) {
    hideLoadingAnimation();
    alert('Error submitting order. Please try again.');
    console.error('Order submission error:', error);
  }
};


  const handleCloseWaitingPage = () => {
    setOrderConfirmed(false);
    setUserStep(1);
    setSelectedUserId('');
    setStudentName('');
    setStudentId('');
    setOrderTotal('');
    setOrderImage(null);
    setReceiptFile(null);
    setPaymentProof(null); 
  };

  const handleAuthentication = () => {
    if (passcode === ADMIN_PASSCODE) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      setIsAuthenticated(true);
      setPasscode('');
    } else {
      alert('Invalid passcode');
    }
  };

  const resetAuth = () => {
    setIsAuthenticated(false);
    setPasscode('');
    localStorage.removeItem('isAdminAuthenticated');
  };

  const AuthScreen = ({ title }) => (
    <div style={styles.card}>
      <div style={styles.authContainer}>
        <Lock size={56} color="#64748b" style={{ marginBottom: '32px' }} />
        <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '28px' }}>{title}</h2>
        <p style={{ marginBottom: '32px', color: '#64748b', textAlign: 'center', fontSize: '16px' }}>
          Enter the passcode to access {title.toLowerCase()}
        </p>
        <div style={styles.passcodeInput}>
          <input
            type={showPasscode ? 'text' : 'password'}
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPasscode(!showPasscode)}
            style={styles.toggleButton}
          >
            {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          onClick={handleAuthentication}
          style={{
            ...styles.button,
            ...styles.buttonBlue,
            width: '100%',
            maxWidth: '320px'
          }}
        >
          Access {title}
        </button>
      </div>
    </div>
  );

  const usersAwaitingOrder = todayUsers.filter(
        user => user.commitmentPaid && !user.orderSubmitted
      );

  return (
    <div style={styles.container}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} setIsAuthenticated={setIsAuthenticated} />
      
      {isLoading && <LoadingAnimation message={loadingMessage} />}
      
      {showSuccess && (
        <SuccessAnimation
          title={successConfig.title}
          message={successConfig.message}
          additionalInfo={successConfig.additionalInfo}
          duration={successConfig.duration}
          showOkButton={successConfig.showOkButton}
          onClose={() => {
            setShowSuccess(false);
            if (successConfig.onClose) {
              successConfig.onClose();
            }
          }}
        />
      )}

      {orderConfirmed && (
        <WaitingPage 
          onClose={handleCloseWaitingPage} 
          currentOrder={currentOrder || null}
        />
      )}

      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
      
      <div style={styles.maxWidth}>
        {/* Student Portal */}
        {activeTab === 'student' && (
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Users color="#3b82f6" size={28} />
                <h2 style={styles.cardTitle}>Food Delivery Registration</h2>
              </div>

              <RetrieveRegistration
                onRetrieve={handleRetrieveRegistration}
                isVisible={showRetrieve}
                onToggle={() => setShowRetrieve(!showRetrieve)}
                windowWidth={windowWidth}  // Pass windowWidth as prop
              />

              {/* Progress Bar */}
              <div style={styles.progressBar}>
                <div style={styles.progressText}>
                  <span>Minimum 3 paid users required</span>
                  <span>
                    {todayUsers.filter(u => u.commitmentPaid).length}/
                    {Math.max(3, todayUsers.filter(u => u.commitmentPaid).length)}
                  </span>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(
                        (todayUsers.filter(u => u.commitmentPaid).length / 
                        Math.max(3, todayUsers.filter(u => u.commitmentPaid).length)) * 100, 
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Step 1: Registration */}
              {userStep === 1 && (
                <div>
                  <h3 style={{ marginBottom: '20px', color: '#1e293b' , fontSize: windowWidth <= 480 ? '16px' : '18px'}}>Step 1: Register</h3>
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
                      ...(nameError ? styles.inputError : {}),
                      padding: windowWidth <= 480 ? '12px 14px' : '16px 20px',  // Responsive padding
                      fontSize: windowWidth <= 480 ? '14px' : '16px'
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
                      ...(idError ? styles.inputError : {}),
                      padding: windowWidth <= 480 ? '12px 14px' : '16px 20px', 
                      fontSize: windowWidth <= 480 ? '14px' : '16px'
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
                  <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>
                    Step 2: {currentUserIndex === 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4) ? 'Confirm Registration' : 'Pay Commitment Fee'}
                  </h3>
                  
                  <UnifiedQRCodeDisplay 
                    amount={isFourthUser ? 0 : 10} 
                    isCommitmentFee={true} 
                    userIndex={currentUserIndex}
                    registrationOrder={registrationOrder}
                    selectedUserId={selectedUserId}
                  />
                  
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {studentName}</p>
                    <p style={{ margin: '0 0 8px 0' }}><strong>Student ID:</strong> {studentId}</p>
                    <p style={{ margin: 0 }}>
                      <strong>Commitment Fee:</strong> {
                        currentUserIndex === 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4) 
                          ? 'FREE (4th user!)' 
                          : 'RM10'
                      }
                    </p>
                  </div>

                  {!(currentUserIndex === 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && (
                    <>
                      <p style={{ marginBottom: '16px', color: '#64748b' }}>
                        Upload proof of payment (RM10 commitment fee):
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setReceiptFile(e.target.files[0]);
                        }}
                        style={styles.input}
                      />

                      {receiptFile && (
                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                          <img
                            src={URL.createObjectURL(receiptFile)}
                            alt="Payment Receipt"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '12px',
                              border: '2px solid #e2e8f0',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleCommitmentPayment}
                      disabled={!(currentUserIndex === 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && !receiptFile}
                      style={{
                        ...styles.button,
                        ...styles.buttonBlue,
                        fontSize: windowWidth <= 480 ? '14px' : '16px',  // Responsive font size
                        padding: windowWidth <= 480 ? '12px 16px' : '16px 32px',  // Responsive padding
                        opacity: (!(currentUserIndex === 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && !receiptFile) ? 0.5 : 1,
                        cursor: (!(currentUserIndex === 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) && !receiptFile) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {(currentUserIndex === 3 || (registrationOrder.find(o => o.userId === selectedUserId)?.order === 4)) ? 'Continue (Free)' : 'Submit Payment'}
                    </button>
                    <button
                      onClick={() => {
                        setUserStep(1);
                        setSelectedUserId('');
                        setReceiptFile(null);
                      }}
                      style={{
                        ...styles.button,
                        backgroundColor: '#64748b',
                        color: 'white'
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
    <h3 style={{ marginBottom: '20px', color: '#1e293b', fontSize: windowWidth <= 480 ? '18px' : '20px' }}>
      Step 3: Submit Your Order
    </h3>

    {/* Confirmation message that payment was successful */}
    <div style={{
      backgroundColor: '#f0fdf4',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #86efac',
      display: 'flex',
      alignItems: 'center'
    }}>
      <CheckCircle color="#16a34a" size={24} style={{ marginRight: '8px' }} />
      Payment confirmed! You can now submit your order.
    </div>

    {/* Section for Uploading Order Image */}
<div style={{
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '16px',
  marginBottom: '24px',
  border: '2px solid #e2e8f0'
}}>
  <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{
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
    }}>1</span>
    Upload Order Receipt
  </h4>

  <p style={{ marginBottom: '12px', color: '#64748b' }}>
    <Camera size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
    Take a clear photo of your receipt for automatic scanning, or enter details manually below.
  </p>

  {/* Toggle between scan and manual entry */}
  <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
    <button
      onClick={() => setScanMode('scanning')}
      style={{
        flex: 1,
        padding: '12px',
        backgroundColor: scanMode === 'scanning' ? '#3b82f6' : '#e5e7eb',
        color: scanMode === 'scanning' ? 'white' : '#6b7280',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <Scan size={18} />
      Scan Receipt
    </button>
    <button
      onClick={() => {
        setScanMode('manual');
        setOrderImage(null);
        setIsScanning(false);
      }}
      style={{
        flex: 1,
        padding: '12px',
        backgroundColor: scanMode === 'manual' ? '#3b82f6' : '#e5e7eb',
        color: scanMode === 'manual' ? 'white' : '#6b7280',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <Calculator size={18} />
      Enter Manually
    </button>
  </div>

  {/* Show file input only if in scanning mode */}
  {scanMode === 'scanning' && (
    <>
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

      {/* Scanning Status */}
      {isScanning && (
        <div style={{
          marginTop: '16px',
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: '#e0f2fe',
          border: '1px solid #7dd3fc',
          textAlign: 'center'
        }}>
          <Loader2 size={32} color="#0369a1" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: '12px 0 0 0', color: '#0369a1', fontWeight: '600' }}>
            Scanning receipt...
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#0369a1', fontSize: '14px' }}>
            This may take up to 30 seconds. Alternatively, you can enter details manually.
          </p>
          <button
            onClick={() => {
              setIsScanning(false);
              setScanMode('manual');
              setScanError('Cancelled scanning. Please enter details manually.');
            }}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel & Enter Manually
          </button>
        </div>
      )}
    </>
  )}

  {/* Manual entry notice */}
  {scanMode === 'manual' && !orderImage && (
    <div style={{
      padding: '16px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #bfdbfe',
      marginTop: '16px'
    }}>
      <p style={{ margin: 0, color: '#1e40af', fontSize: '14px' }}>
        <AlertCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        Please upload a photo of your receipt and enter the order details below.
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setOrderImage(e.target.files[0])}
        style={{
          ...styles.input,
          marginTop: '12px',
          marginBottom: 0
        }}
      />
    </div>
  )}

  {/* Error/Manual Entry Message */}
  {scanError && !isScanning && scanMode === 'manual' && (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fbbf24'
    }}>
      <AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
      {scanError}
    </div>
  )}

  {/* Receipt Preview */}
  {orderImage && !isScanning && (
    <div style={{ marginTop: '16px', textAlign: 'center' }}>
      <img
        src={URL.createObjectURL(orderImage)}
        alt="Uploaded Receipt"
        style={{
          maxWidth: '200px',
          maxHeight: '200px',
          borderRadius: '8px',
          border: '2px solid #e2e8f0',
          cursor: 'pointer'
        }}
        onClick={() => setSelectedImage(URL.createObjectURL(orderImage))}
      />
      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
        Click image to enlarge
      </p>
    </div>
  )}
</div>

    {/* Scan Confirmation Modal */}
    {showScanConfirmation && (
      <ScanConfirmationModal
        scannedData={scannedData}
        onConfirm={handleScanConfirmation}
        orderImage={orderImage}
      />
    )}

    {/* Manual Entry / Editing Section */}
    {(orderImage || scanMode === 'manual') && !showScanConfirmation && (
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: '2px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
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
          }}>2</span>
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
          style={{
            ...styles.input,
            backgroundColor: finalOrderNumber ? '#f0fdf4' : '#fff'
          }}
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
          style={{
            ...styles.input,
            backgroundColor: orderTotal ? '#f0fdf4' : '#fff'
          }}
        />
      </div>
    )}

    {/* Conditionally render Fee Breakdown and Delivery Payment sections ONLY if there is an order total */}
    {orderTotal && (
      <>
        <FeeBreakdown
          orderTotal={parseFloat(orderTotal) || 0}
          userIndex={currentUserIndex}
          isCommitmentFeePaid={prebookUsers.find(u => u.firestoreId === selectedUserId)?.commitmentPaid}
          registrationOrder={registrationOrder}
          selectedUserId={selectedUserId}
        />

        {/* This logic calculates the final delivery fee and shows the payment proof section if needed */}
        {(() => {
          const deliveryFee = calculateDeliveryFee(parseFloat(orderTotal) || 0);
          const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
          const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
          const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

          if (actualDeliveryFee > 0) {
            return (
              <div style={{
                backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px',
                marginBottom: '24px', border: '2px solid #e2e8f0'
              }}>
                <h4 style={{ margin: '0 0 16px 0' }}>Delivery Fee Payment</h4>
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
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <img src={URL.createObjectURL(paymentProof)} alt="Payment Proof" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                  </div>
                )}
              </div>
            );
          }
          return null; // Don't show anything if no delivery fee is required
        })()}

        {/* The final "Submit Order" button */}
        {(() => {
          const deliveryFee = calculateDeliveryFee(parseFloat(orderTotal) || 0);
          const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
          const commitmentFeeDeducted = (currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
          
          // --- THIS IS THE LINE THAT WAS FIXED ---
          const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted); // Corrected variable name
          
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

              {/* Show message if minimum order not reached */}
              {userStep === 3 && !minOrderReached && (
              <div>
                <BeautifulMessage
                  type="success"
                  title="Payment Confirmed!"
                  message="Thank you for your commitment. Your payment has been successfully processed."
                  icon={<CheckCircle />}
                />

                <BeautifulMessage
                  type="warning"
                  title="Waiting for More Orders"
                  message={`We need at least 3 paid users before order submission opens. Current progress: ${prebookUsers.filter(u => u.commitmentPaid).length}/3 users`}
                  icon={<Clock />}
                >
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px',
                    color: '#92400e'
                  }}>
                    You'll be able to submit your order once we reach the minimum requirement.
                    Please check back later!
                  </p>
                </BeautifulMessage>

                <button
                  onClick={() => {
                    setUserStep(1);
                    setStudentName('');
                    setStudentId('');
                    setSelectedUserId('');
                    setReceiptFile(null);
                  }}
                  style={{
                    ...styles.button,
                    backgroundColor: '#64748b',
                    color: 'white',
                    width: '100%'
                  }}
                >
                  Return to Home
                </button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && (
        <>
          {!isAuthenticated ? (
            <AuthScreen title="Admin Dashboard" />
          ) : (
            <div>
              {(loadingUsers || loadingOrders || loadingHistory) ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px',
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  marginBottom: '32px'
                }}>
                  <Loader2 size={56} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '24px', color: '#64748b', fontSize: '18px' }}>Loading dashboard data...</p>
                </div>
              ) : (
                <div>
                  {!showHistory ? (
                    <>
                      {/* Today's View */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '32px', color: '#1e293b' }}>Admin Dashboard</h2>
                          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '16px' }}>
                            Today's Data - {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => setShowHistory(true)}
                            style={{
                              ...styles.button,
                              width: 'auto',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              color: 'white',
                              padding: '14px 28px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <History size={20} />
                            View History
                          </button>
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
              <AuthScreen title="Driver Portal" />
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

export default Crave2CaveSystem;