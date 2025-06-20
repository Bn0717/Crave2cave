import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Receipt, Users, Truck, CheckCircle, Calculator, Camera, Scan, Lock, Eye, EyeOff, QrCode, Search, Loader2, AlertCircle, Clock, TrendingUp, DollarSign, Package, UserCheck, BarChart3, PieChart, Calendar, Save, History, Menu, X, ZoomIn } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, writeBatch} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import qrImage from './assets/qrtng.jpg';
import logo from './assets/logo.png';

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
        const maxWidth = 800;
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
          0.7
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
  const chartHeight = isMobile ? 200 : height;
  
  const styles = {
    container: {
      backgroundColor: 'white',
      padding: isMobile ? '16px' : '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f3f4f6',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    },
    title: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      marginBottom: isMobile ? '16px' : '24px',
      color: '#1f2937',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
      wordBreak: 'break-word'
    },
    chartArea: {
      position: 'relative',
      height: `${chartHeight}px`,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      gap: isMobile ? '4px' : '8px',
      paddingBottom: '50px',
      overflowX: 'auto',
      overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch'
    },
    bar: {
      position: 'relative',
      backgroundColor: '#3b82f6',
      borderRadius: '8px 8px 0 0',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      flex: '0 0 auto',
      width: isMobile ? '30px' : '50px',
      minWidth: isMobile ? '30px' : '50px',
      background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)'
    },
    barLabel: {
      position: 'absolute',
      bottom: '-40px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: isMobile ? '9px' : '11px',
      color: '#6b7280',
      whiteSpace: 'nowrap',
      fontWeight: '500',
      writingMode: isMobile && data.length > 6 ? 'vertical-rl' : 'horizontal-tb',
      textOrientation: 'mixed'
    },
    barValue: {
      position: 'absolute',
      top: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: isMobile ? '10px' : '12px',
      fontWeight: 'bold',
      color: '#1f2937',
      backgroundColor: '#f3f4f6',
      padding: '1px 4px',
      borderRadius: '4px',
      whiteSpace: 'nowrap'
    },
    pieContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '20px' : '40px',
      flexWrap: 'wrap',
      flexDirection: isMobile ? 'column' : 'row'
    },
    pieChart: {
      width: isMobile ? '150px' : '200px',
      height: isMobile ? '150px' : '200px',
      position: 'relative'
    },
    legend: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '6px' : '10px',
      fontSize: isMobile ? '11px' : '13px',
      maxWidth: isMobile ? '100%' : '200px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexWrap: 'wrap'
    },
    legendColor: {
      width: isMobile ? '14px' : '18px',
      height: isMobile ? '14px' : '18px',
      borderRadius: '4px',
      flexShrink: 0
    }
  };

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
                <span style={{ color: '#4b5563' }}>{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
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
              height: `${(item.value / maxValue) * (chartHeight - 70)}px`,
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
    if (!showOkButton && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500);
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

// Enhanced Image Modal Component
const ImageModal = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
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

  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
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
      touchAction: 'none' // Prevent default touch behavior
    },
    container: {
      position: 'relative',
      maxWidth: '90vw',
      maxHeight: '90vh',
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      touchAction: 'none'
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
      backdropFilter: 'blur(10px)'
    },
    zoomControls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    zoomButton: {
      backgroundColor: '#f3f4f6',
      border: 'none',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
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
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    imageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '60px',
      minHeight: '200px', 
      overflow: 'hidden',
      position: 'relative',
      touchAction: 'none'
    },
    image: {
      maxWidth: '100%',
      maxHeight: 'calc(90vh - 100px)', 
      height: 'auto',
      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease',
      userSelect: 'none',
      touchAction: 'none',
      objectFit: 'contain' 
    },
    instructions: {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      pointerEvents: 'none'
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
              <span style={{ fontSize: '20px' }}>−</span>
            </button>
            <span style={modalStyles.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button style={modalStyles.zoomButton} onClick={handleZoomIn}>
              <span style={{ fontSize: '20px' }}>+</span>
            </button>
            <button 
              style={{...modalStyles.zoomButton, width: 'auto', padding: '8px 12px'}} 
              onClick={handleZoomReset}
            >
              Reset
            </button>
          </div>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <X size={16} style={{ display: 'inline', marginRight: '4px' }} /> Close
          </button>
        </div>
        <div 
          style={modalStyles.imageContainer}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
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

// Enhanced Table Component
const ResponsiveTable = ({ headers, data, onImageClick }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tableStyles = {
    container: {
      overflowX: 'auto',
      width: '100%',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: '-ms-autohiding-scrollbar'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: isMobile ? '500px' : '600px'
    },
    th: {
      backgroundColor: '#f9fafb',
      padding: isMobile ? '10px 8px' : '12px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: isMobile ? '12px' : '14px',
      color: '#4b5563',
      borderBottom: '2px solid #e5e7eb',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: isMobile ? '10px 8px' : '12px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: isMobile ? '12px' : '14px',
      color: '#1f2937',
      wordBreak: 'break-word',
      maxWidth: isMobile ? '150px' : 'none'
    },
    tr: {
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: '#f9fafb'
      }
    },
    image: {
      width: isMobile ? '40px' : '60px',
      height: isMobile ? '40px' : '60px',
      objectFit: 'cover',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.05)'
      }
    },
    mobileHint: {
      fontSize: '11px',
      color: '#6b7280',
      marginTop: '8px',
      textAlign: 'center'
    }
  };

  return (
    <div>
      <div style={tableStyles.container}>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} style={tableStyles.th}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} style={tableStyles.tr}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={tableStyles.td}>
                    {cell.type === 'image' ? (
                      <img
                        src={cell.value}
                        alt="Order"
                        style={tableStyles.image}
                        onClick={() => onImageClick && onImageClick(cell.value)}
                      />
                    ) : cell.type === 'status' ? (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: isMobile ? '11px' : '12px',
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
    <div style={timerStyles.container}>
      <p style={timerStyles.label}>
        {timeLeft.isReady ? '🎉 Ready for pickup!' : '⏰ Time until pickup:'}
      </p>
      <div style={timerStyles.timer}>
        <span style={timerStyles.segment}>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span>:</span>
        <span style={timerStyles.segment}>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span>:</span>
        <span style={timerStyles.segment}>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
      {!timeLeft.isReady && (
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', margin: 0 }}>
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
        padding: '24px',
        backgroundColor: '#f0fdf4',
        borderRadius: '16px',
        border: '2px solid #86efac',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <CheckCircle color="#16a34a" size={36} />
        <p style={{ margin: '12px 0 0 0', fontWeight: '600', color: '#166534', fontSize: '17px' }}>
          No delivery fee for orders under RM50!
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: '#166534' }}>
          Please proceed to upload your order image.
        </p>
      </div>
    );
  }

  if (isFourthUser && isCommitmentFee) {
    return (
      <div style={{
        backgroundColor: '#f0fdf4',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #86efac',
        marginBottom: '24px'
      }}>
        <CheckCircle color="#16a34a" size={32} />
        <p style={{ margin: '12px 0 0 0', fontWeight: '600', color: '#166534', fontSize: '18px' }}>
          Congratulations! You're the 4th registrant!
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: '#166534' }}>
          Your commitment fee is waived. Please proceed to continue.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderRadius: '20px',
      border: '2px solid #7dd3fc',
      marginBottom: '24px',
      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#0369a1',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <QrCode size={28} />
        {isCommitmentFee ? 'Commitment Fee Payment' : 'Delivery Fee Payment'}
      </div>
      
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <img 
          src={qrImage}
          alt="TNG Payment QR Code"
          style={{
            width: '220px',
            height: '220px',
            display: 'block'
          }}
        />
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '16px 32px',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '20px',
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
      }}>
        Amount: RM{displayAmount.toFixed(2)}
      </div>
      
      <p style={{
        fontSize: '15px',
        color: '#64748b',
        marginTop: '16px',
        textAlign: 'center'
      }}>
        Scan with Touch 'n Go eWallet to pay
      </p>
    </div>
  );
};

// Waiting Page Component
const WaitingPage = ({ onClose }) => {
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
      zIndex: 1000,
      padding: '20px',
      textAlign: 'center'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '32px',
      padding: '48px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      maxWidth: '520px',
      width: '100%',
      animation: 'slideUp 0.5s ease-out'
    },
    iconContainer: {
      width: '96px',
      height: '96px',
      margin: '0 auto 32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 2s infinite',
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#1e293b'
    },
    locationInfo: {
      backgroundColor: '#f8fafc',
      padding: '20px',
      borderRadius: '16px',
      marginBottom: '28px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    message: {
      fontSize: '17px',
      color: '#64748b',
      marginBottom: '32px',
      lineHeight: '1.6'
    },
    button: {
      padding: '16px 40px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '17px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <CheckCircle size={56} color="white" />
        </div>
        
        <h2 style={styles.title}>Your Order is Being Prepared</h2>
        
        <CountdownTimer targetTime="19:00" />
        
        <div style={styles.locationInfo}>
          <MapPin size={22} color="#64748b" />
          <span style={{ fontWeight: '600', color: '#475569', fontSize: '16px' }}>
            Pickup Location: Main Gate
          </span>
        </div>
        
        <p style={styles.message}>
          Please arrive at the main gate by 7:00 PM to receive your order
        </p>
        
        <button style={styles.button} onClick={onClose}>
          Close
        </button>
      </div>
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

// Retrieve Registration Component
const RetrieveRegistration = ({ onRetrieve, isVisible, onToggle }) => {
  const [retrieveName, setRetrieveName] = useState('');
  const [retrieveId, setRetrieveId] = useState('');

  const handleRetrieve = () => {
    if (!retrieveName.trim() || !retrieveId.trim()) {
      alert('Please enter both name and student ID');
      return;
    }
    onRetrieve(retrieveName.trim(), retrieveId.trim());
  };

  const handleReset = () => {
    setRetrieveName('');
    setRetrieveId('');
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
      padding: '16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#2563eb'
      }
    },
    content: {
      padding: isVisible ? '24px' : '0',
      maxHeight: isVisible ? '400px' : '0',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1e40af',
      marginBottom: '12px'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      marginBottom: '16px',
      fontSize: '15px',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    button: {
      flex: 1,
      padding: '14px 20px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '15px',
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
        <Search size={18} />
        {isVisible ? 'Hide' : 'Already Registered? Retrieve Your Registration'}
      </button>
      
      <div style={styles.content}>
        <h3 style={styles.title}>Retrieve Your Registration</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
          Enter your name and student ID to continue where you left off.
        </p>
        
        <input
          type="text"
          placeholder="Enter your full name"
          value={retrieveName}
          onChange={(e) => setRetrieveName(e.target.value)}
          style={styles.input}
        />
        
        <input
          type="text"
          placeholder="Enter your student ID (e.g., 0469/24)"
          value={retrieveId}
          onChange={(e) => setRetrieveId(e.target.value)}
          style={styles.input}
        />
        
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

  const ADMIN_PASSCODE = 'YIEK';
  const isFourthUser = currentOrder ? (currentOrder.order === 4) : (currentUserIndex === 3);

  useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

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
  // Check if it's a new day
  const lastAccessDate = localStorage.getItem('lastAccessDate');
  const today = new Date().toDateString();
  
  if (lastAccessDate !== today) {
    // Reset registration data for a new day
    localStorage.setItem('lastAccessDate', today);
    setPrebookUsers([]);
    setTodayUsers([]);
    setTodayOrders([]);
    setMinOrderReached(false);
  }
  
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
}, []);

  const canRegisterToday = (user) => {
    if (!user.lastOrderDate) return true;
    
    const lastOrder = new Date(user.lastOrderDate);
    const today = new Date();
    
    // Allow registration if last order was on a different day
    return lastOrder.toDateString() !== today.toDateString();
  };

  const filterTodayData = (orders = [], users = []) => {
    const todayOrdersFiltered = orders.filter(order => isToday(order.timestamp));
    const todayUserIds = new Set(todayOrdersFiltered.map(order => order.userId));
    const todayUsersFiltered = users.filter(user => 
      isToday(user.timestamp) || todayUserIds.has(user.firestoreId)
    );
    
    setTodayOrders(todayOrdersFiltered);
    setTodayUsers(todayUsersFiltered);
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

  // Firebase functions
  const savePrebookUser = async (user) => {
    try {
      const docRef = await addDoc(collection(db, 'prebookUsers'), user);
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
      const querySnapshot = await getDocs(collection(db, 'prebookUsers'));
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
      const docRef = await addDoc(collection(db, 'orders'), order);
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
    
    const date = new Date(dateString);
    const today = new Date();
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
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
  
  const foundUser = prebookUsers.find(user => 
    user.name && user.name.toLowerCase() === name.toLowerCase() && 
    user.studentId === id
  );

  if (!foundUser) {
    setRetrieveError('No registration found with this name and student ID combination.');
    alert('Registration not found. Please check your name and student ID or register as a new user.');
    return;
  }

  // Check if user has already ordered today
  if (foundUser.orderSubmitted && isToday(foundUser.timestamp)) {
    alert('You have already submitted an order today. Please try again tomorrow.');
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
      2000,
      false
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
      false
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
        false
      );
      setUserStep(2);
    } else {
      showSuccessAnimation(
        `Welcome back ${foundUser.name}!`,
        'Please complete your commitment fee payment to continue.',
        <p>We still need {3 - paidUsersCount} more paid users before order submission opens.</p>,
        2500,
        false
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
  const isNameValid = validateName(studentName);
  const isIdValid = validateStudentId(studentId);

  if (!isNameValid || !isIdValid) {
    return;
  }

  const existingUser = prebookUsers.find(user => 
    isToday(user.timestamp) && (
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

    alert(`${message} Please try again tomorrow.`);
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
        false,
        () => setUserStep(3) // Go directly to order submission
      );
    } else {
      // First 3 users - need to pay commitment fee
      showSuccessAnimation(
        'Registration Successful!',
        'You have been registered for the food delivery service.',
        <p>Please proceed to pay the RM10 commitment fee.</p>,
        1500,
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
        ? { ...user, commitmentPaid: true, receiptURL: receiptURL, wasFourthUser: isFourthUser }
        : user
    ));

    const currentPaidUsers = prebookUsers.filter(u => u.commitmentPaid).length + 1;
    
    hideLoadingAnimation();
    
    // Check if minimum is reached (3 paid users OR we're at 4+ users)
    const isMinimumMet = currentPaidUsers >= 3 || prebookUsers.length >= 3;
    
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
  if (!orderTotal) {
    alert('Please enter order total');
    return;
  }

  const totalAmount = parseFloat(orderTotal);
  if (isNaN(totalAmount)) {
    alert('Please enter a valid order total');
    return;
  }

  if (!orderImage) {
    alert('Please upload image of your order');
    return;
  }
  
  const deliveryFee = calculateDeliveryFee(totalAmount);

  // Only require payment proof if delivery fee > 0
  if (deliveryFee > 0 && !paymentProof) {
    alert('Please upload payment proof for delivery fee');
    return;
  }

  // Check if user is among first 3 or 4th+ user
  const userIndex = prebookUsers.findIndex(u => u.firestoreId === selectedUserId);
  const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
  const isFourthOrLaterUser = userIndex >= 3; // Define this variable here
  
  // Only first 3 users who paid commitment fee get RM10 deduction
  const commitmentFeeDeducted = (currentUserIndex < 3 && prebookUsers.find(u => u.firestoreId === selectedUserId)?.commitmentPaid) ? 10 : 0;
  const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);


  // Only require payment proof if actual delivery fee > 0
  if (actualDeliveryFee > 0 && !paymentProof) {
    alert('Please upload payment proof for delivery fee');
    return;
  }

  showLoadingAnimation('Processing order...');

  try {
    // Compress images in parallel
    const compressionPromises = [compressImage(orderImage)];
    if (paymentProof) {
      compressionPromises.push(compressImage(paymentProof));
    }
    
    const compressedImages = await Promise.all(compressionPromises);
    const compressedOrderImage = compressedImages[0];
    const compressedPaymentProof = compressedImages[1] || null;

    // Upload files in parallel
    const uploadPromises = [uploadFileToStorage(compressedOrderImage)];
    if (compressedPaymentProof) {
      uploadPromises.push(uploadFileToStorage(compressedPaymentProof));
    }
    
    const uploadedFiles = await Promise.all(uploadPromises);
    const orderImageURL = uploadedFiles[0];
    const paymentProofURL = uploadedFiles[1] || null;

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
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
      userPosition: userIndex + 1,
      wasFourthUser: isFourthOrLaterUser
    };

    // Save order
    await saveOrder(orderData);
    
    // Update user
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
        <WaitingPage onClose={handleCloseWaitingPage} />
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
                  <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Step 1: Register</h3>
                  <input
                    type="text"
                    placeholder="Enter your full name (e.g., Lim Ethan)"
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      validateName(e.target.value);
                    }}
                    style={{
                      ...styles.input,
                      ...(nameError ? styles.inputError : {})
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
                      ...(idError ? styles.inputError : {})
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
                  <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Step 3: Submit Your Order</h3>

                  <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid #86efac'
                  }}>
                    <CheckCircle color="#16a34a" size={24} style={{ marginRight: '8px', display: 'inline' }} />
                    Payment confirmed! You can now submit your order.
                  </div>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter your order total (RM)"
                    value={orderTotal}
                    onChange={(e) => setOrderTotal(e.target.value)}
                    style={styles.input}
                  />

                  {orderTotal && (
                    <>
                      <FeeBreakdown
                        orderTotal={parseFloat(orderTotal) || 0}
                        userIndex={currentUserIndex}
                        isCommitmentFeePaid={prebookUsers.find(u => u.firestoreId === selectedUserId)?.commitmentPaid}
                        registrationOrder={registrationOrder}
                        selectedUserId={selectedUserId}
                      />

                      {/* Calculate fees here */}
                      {(() => {
                        const deliveryFee = calculateDeliveryFee(parseFloat(orderTotal));
                        const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
                        const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
                        const isFourthOrLaterUser = userOrder ? userOrder.order >= 4 : currentUserIndex >= 3;
                        const commitmentFeeDeducted = (!isFourthOrLaterUser && currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
                        const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

                        return (
                          <>
                            {/* Payment proof section only if actual delivery fee > 0 */}
                            {actualDeliveryFee > 0 && (
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
                                  Payment Proof
                                </h4>

                                <UnifiedQRCodeDisplay amount={actualDeliveryFee} />

                                <p style={{ marginBottom: '12px', color: '#64748b' }}>
                                  Upload proof of payment:
                                </p>

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setPaymentProof(e.target.files[0])}
                                  style={styles.input}
                                />

                                {paymentProof && (
                                  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                    <img
                                      src={URL.createObjectURL(paymentProof)}
                                      alt="Payment Proof"
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
                              </div>
                            )}

                            {/* Show message when no payment is needed */}
                            {actualDeliveryFee === 0 && (
                              <UnifiedQRCodeDisplay amount={0} />
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}

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
                      Upload Order Image
                    </h4>
                    
                    <p style={{ marginBottom: '12px', color: '#64748b' }}>
                      Upload image of your order:
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setOrderImage(e.target.files[0])}
                      style={styles.input}
                    />
                  </div>

                  {orderTotal && (() => {
                    const deliveryFee = calculateDeliveryFee(parseFloat(orderTotal));
                    const user = prebookUsers.find(u => u.firestoreId === selectedUserId);
                    const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
                    const isFourthOrLaterUser = userOrder ? userOrder.order >= 4 : currentUserIndex >= 3;
                    const commitmentFeeDeducted = (!isFourthOrLaterUser && currentUserIndex < 3 && user?.commitmentPaid && deliveryFee > 0) ? 10 : 0;
                    const actualDeliveryFee = Math.max(0, deliveryFee - commitmentFeeDeducted);

                    return (
                      <button
                        onClick={handleOrderSubmission}
                        disabled={!orderImage || (actualDeliveryFee > 0 && !paymentProof)}
                        style={{
                          ...styles.button,
                          ...styles.buttonOrange,
                          opacity: (!orderImage || (actualDeliveryFee > 0 && !paymentProof)) ? 0.5 : 1,
                          cursor: (!orderImage || (actualDeliveryFee > 0 && !paymentProof)) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Submit Order
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* Show message if minimum order not reached */}
              {userStep === 3 && !minOrderReached && (
                <div>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid #86efac'
                  }}>
                    <CheckCircle color="#16a34a" size={24} style={{ marginRight: '8px', display: 'inline' }} />
                    Payment confirmed! Thank you for your commitment.
                  </div>

                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '32px',
                    borderRadius: '20px',
                    border: '2px solid #fbbf24',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '56px',
                      marginBottom: '20px'
                    }}>
                      ⏳
                    </div>
                    <h3 style={{ 
                      margin: '0 0 16px 0', 
                      color: '#92400e',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      Waiting for More Orders
                    </h3>
                    <p style={{ 
                      margin: '8px 0 20px 0', 
                      color: '#92400e',
                      fontSize: '17px'
                    }}>
                      We need at least 3 paid users before order submission opens.
                    </p>
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '16px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>
                        Current Progress: {prebookUsers.filter(u => u.commitmentPaid).length}/3 users
                      </p>
                    </div>
                    <p style={{ 
                      margin: '0 0 24px 0', 
                      color: '#64748b',
                      fontSize: '15px'
                    }}>
                      You'll be able to submit your order once we reach the minimum requirement.
                      Please check back later or wait for a notification.
                    </p>
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
                        width: 'auto',
                        padding: '14px 32px'
                      }}
                    >
                      Return to Home
                    </button>
                  </div>
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

                      {/* Profit Breakdown */}
                      <div style={styles.card}>
                        <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Today's Profit Calculation</h3>
                        <div style={{ 
                          backgroundColor: '#f8fafc', 
                          padding: '24px', 
                          borderRadius: '16px',
                          marginBottom: '24px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '16px' }}>Commitment Fees ({todayUsers.filter(u => u.commitmentPaid).length} × RM10):</span>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              +RM{(todayUsers.filter(u => u.commitmentPaid).length * 10).toFixed(2)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '16px' }}>Delivery Fees:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              +RM{todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0).toFixed(2)}
                            </span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            borderTop: '2px solid #e2e8f0',
                            paddingTop: '16px',
                            marginTop: '16px' 
                          }}>
                            <span style={{ fontSize: '16px' }}>Total Revenue:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              RM{(todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                                todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)).toFixed(2)}
                            </span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginTop: '16px'
                          }}>
                            <span style={{ fontSize: '16px' }}>Driver Cost:</span>
                            <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '16px' }}>
                              -RM{todayOrders.length > 0 ? '30.00' : '0.00'}
                            </span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            borderTop: '2px solid #1e293b',
                            paddingTop: '16px',
                            marginTop: '16px'
                          }}>
                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Today's Profit:</span>
                            <span style={{ 
                              fontSize: '20px', 
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

                      {/* Charts */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                        gap: '24px', 
                        marginBottom: '40px' 
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
                            headers={['Order #', 'Customer', 'Student ID', 'Order Total', 'Delivery Fee', 'Total', 'Time']}
                            data={todayOrders.map((order, index) => [
                              order.orderNumber,
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

                      {/* History Statistics */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                        gap: '24px',
                        marginBottom: '40px' 
                      }}>
                        <div style={styles.statCard}>
                          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
                            <Users size={32} color="#3b82f6" />
                          </div>
                          <div style={styles.statContent}>
                            <p style={styles.statLabel}>Total Registered</p>
                            <p style={styles.statValue}>{getTotalHistoryStats().totalRegistered}</p>
                          </div>
                        </div>

                        <div style={styles.statCard}>
                          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
                            <Package size={32} color="#ef4444" />
                          </div>
                          <div style={styles.statContent}>
                            <p style={styles.statLabel}>Total Orders</p>
                            <p style={styles.statValue}>{getTotalHistoryStats().totalOrders}</p>
                          </div>
                        </div>

                        <div style={styles.statCard}>
                          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                            <DollarSign size={32} color="#f59e0b" />
                          </div>
                          <div style={styles.statContent}>
                            <p style={styles.statLabel}>Total Revenue</p>
                            <p style={styles.statValue}>
                              RM{getTotalHistoryStats().totalRevenue.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div style={styles.statCard}>
                          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>
                            <TrendingUp size={32} color="#10b981" />
                          </div>
                          <div style={styles.statContent}>
                            <p style={styles.statLabel}>Total Profit</p>
                            <p style={styles.statValue}>
                              RM{getTotalHistoryStats().totalProfit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* History Charts */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                        gap: '24px', 
                        marginBottom: '40px' 
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                        gap: '24px', 
                        marginBottom: '40px' 
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