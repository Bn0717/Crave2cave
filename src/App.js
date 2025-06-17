import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Receipt, Users, Truck, CheckCircle, Calculator, Camera, Scan, Lock, Eye, EyeOff, QrCode, Search, Loader2, AlertCircle, Clock, TrendingUp, DollarSign, Package, UserCheck, BarChart3, PieChart, Calendar, Save, History } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import qrImage from './assets/qrtng.jpg';

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

// Chart Component
const SimpleChart = ({ data, type = 'bar', title, height = 300 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  const styles = {
    container: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#1f2937'
    },
    chartArea: {
      position: 'relative',
      height: `${height}px`
    },
    bar: {
      position: 'absolute',
      bottom: 0,
      backgroundColor: '#3b82f6',
      borderRadius: '4px 4px 0 0',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    barLabel: {
      position: 'absolute',
      bottom: '-25px',
      fontSize: '12px',
      color: '#6b7280',
      whiteSpace: 'nowrap',
      transform: 'translateX(-50%)',
      left: '50%'
    },
    barValue: {
      position: 'absolute',
      top: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    pieContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '40px'
    },
    pieChart: {
      width: '200px',
      height: '200px',
      position: 'relative'
    },
    pieLegend: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    legendColor: {
      width: '16px',
      height: '16px',
      borderRadius: '4px'
    }
  };

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    let currentAngle = -90;

    return (
      <div style={styles.container}>
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
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div style={styles.pieLegend}>
            {data.map((item, index) => (
              <div key={index} style={styles.legendItem}>
                <div style={{
                  ...styles.legendColor,
                  backgroundColor: colors[index % colors.length]
                }}></div>
                <span>{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const barWidth = 60;
  const gap = 20;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.chartArea}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.bar,
              left: `${index * (barWidth + gap) + gap}px`,
              width: `${barWidth}px`,
              height: `${(item.value / maxValue) * (height - 40)}px`,
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
      backgroundColor: '#fff7ed',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      marginTop: '16px'
    },
    label: {
      fontSize: '14px',
      color: '#92400e',
      marginBottom: '8px',
      fontWeight: '600'
    },
    timer: {
      fontSize: '32px',
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
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px', margin: 0 }}>
          Please arrive at the main gate by 7:00 PM
        </p>
      )}
    </div>
  );
};

// Loading Animation Component
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
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      maxWidth: '320px',
      width: '90%'
    },
    spinner: {
      width: '64px',
      height: '64px',
      margin: '0 auto 20px',
      animation: 'spin 1s linear infinite'
    },
    dots: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '16px'
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
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
          {message}
        </h3>
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

// Success Animation Component
const SuccessAnimation = ({ title, message, onClose, additionalInfo, duration = 3000, showOkButton = false }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0 && !showOkButton) {
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
      width: '100%'
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
    additionalInfo: {
      backgroundColor: '#fef3c7',
      padding: '20px',
      borderRadius: '16px',
      border: '2px solid #fbbf24',
      marginTop: '20px',
      animation: 'slideInUp 0.6s ease-out 0.4s both'
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
          <div style={successStyles.additionalInfo}>
            {additionalInfo}
          </div>
        )}
        {showOkButton && (
        <button
          onClick={handleClose}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            marginTop: '20px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          OK
        </button>
      )}
      </div>
      <style jsx>{`
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

const UnifiedQRCodeDisplay = ({ amount, isCommitmentFee = false }) => {
  const needsPayment = amount > 0;
  const displayAmount = isCommitmentFee ? 10 : amount;

  const qrStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      borderRadius: '16px',
      border: '2px dashed #e5e7eb',
      marginBottom: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    qrWrapper: {
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    qrImage: {
      width: '200px',
      height: '200px',
      display: 'block'
    },
    amountBadge: {
      marginTop: '16px',
      padding: '12px 24px',
      backgroundColor: '#065f46',
      color: 'white',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    instructions: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '12px',
      textAlign: 'center'
    },
    noteText: {
      fontSize: '13px',
      color: '#6b7280',
      marginTop: '8px',
      fontStyle: 'italic'
    },
    noPaymentContainer: {
      padding: '20px',
      backgroundColor: '#f0fdf4',
      borderRadius: '12px',
      border: '2px solid #86efac',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }
  };

  if (!needsPayment && !isCommitmentFee) {
    return (
      <div style={qrStyles.noPaymentContainer}>
        <CheckCircle color="#16a34a" size={32} />
        <p style={{ margin: 0, fontWeight: '600', color: '#166534' }}>
          No additional payment needed!
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
          Your RM10 commitment fee covers the delivery cost
        </p>
      </div>
    );
  }

  return (
    <div style={qrStyles.container}>
      <div style={qrStyles.title}>
        <QrCode size={24} />
        {isCommitmentFee ? 'Commitment Fee Payment' : 'Delivery Fee Payment'}
      </div>
      
      <div style={qrStyles.qrWrapper}>
        <img 
          src={qrImage}
          alt="TNG Payment QR Code"
          style={qrStyles.qrImage}
        />
      </div>
      
      <div style={qrStyles.amountBadge}>
        Amount: RM{displayAmount.toFixed(2)}
      </div>
      
      <p style={qrStyles.instructions}>
        Scan with Touch 'n Go eWallet to pay
      </p>
      
      {!isCommitmentFee && (
        <p style={qrStyles.noteText}>
          (After deducting RM10 commitment fee)
        </p>
      )}
    </div>
  );
};

// Waiting Page Component
const WaitingPage = ({ onClose }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const sevenPM = new Date();
    sevenPM.setHours(19, 0, 0, 0);
    
    if (now > sevenPM) {
      return { 
        hours: 0,
        minutes: 0,
        seconds: 0,
        text: "Ready for pickup!", 
        isReady: true 
      };
    }
    
    const diff = sevenPM - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return { 
      hours,
      minutes,
      seconds,
      text: `${hours}h ${minutes}m ${seconds}s`, 
      isReady: false 
    };
  };
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
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
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      maxWidth: '480px',
      width: '100%',
      animation: 'slideUp 0.5s ease-out'
    },
    iconContainer: {
      width: '80px',
      height: '80px',
      margin: '0 auto 24px',
      borderRadius: '50%',
      backgroundColor: timeLeft.isReady ? '#10b981' : '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 2s infinite'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#1e40af'
    },
    timerDisplay: {
      backgroundColor: '#fef3c7',
      padding: '24px',
      borderRadius: '16px',
      margin: '20px 0',
      border: '2px solid #fbbf24'
    },
    timer: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: timeLeft.isReady ? '#10b981' : '#dc2626',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.05em'
    },
    timerLabel: {
      fontSize: '14px',
      color: '#92400e',
      marginBottom: '8px',
      fontWeight: '600'
    },
    message: {
      fontSize: '16px',
      color: '#4b5563',
      marginBottom: '24px',
      lineHeight: '1.6'
    },
    button: {
      padding: '14px 32px',
      backgroundColor: '#1e40af',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#1e3a8a',
        transform: 'translateY(-1px)'
      }
    },
    locationInfo: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          {timeLeft.isReady ? (
            <CheckCircle size={48} color="white" />
          ) : (
            <Clock size={48} color="white" />
          )}
        </div>
        
        <h2 style={styles.title}>
          {timeLeft.isReady ? 'Order Ready!' : 'Your Order is Being Prepared'}
        </h2>
        
        <div style={styles.timerDisplay}>
          <p style={styles.timerLabel}>
            {timeLeft.isReady ? '🎉 Ready for pickup!' : '⏰ Time until pickup:'}
          </p>
          <div style={styles.timer}>
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>
        
        <div style={styles.locationInfo}>
          <MapPin size={20} color="#6b7280" />
          <span style={{ fontWeight: '600', color: '#374151' }}>
            Pickup Location: Main Gate
          </span>
        </div>
        
        <p style={styles.message}>
          {timeLeft.isReady 
            ? 'Please head to the main gate now to receive your order!'
            : 'Please arrive at the main gate by 7:00 PM to receive your order'}
        </p>
        
        <button 
          style={styles.button}
          onClick={onClose}
        >
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
      transition: 'all 0.2s'
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
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '12px',
      fontSize: '15px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px'
    },
    button: {
      flex: 1,
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    primaryButton: {
      backgroundColor: '#059669',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white'
    }
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={onToggle}
        style={styles.toggleButton}
      >
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
            style={{
              ...styles.button,
              ...styles.primaryButton
            }}
          >
            Retrieve Registration
          </button>
          <button
            onClick={handleReset}
            style={{
              ...styles.button,
              ...styles.secondaryButton
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const ADMIN_PASSCODE = 'YIEK';

  useEffect(() => {
    const isAuthenticatedFromStorage = localStorage.getItem('isAdminAuthenticated');
    if (isAuthenticatedFromStorage === 'true') {
      setIsAuthenticated(true);
    }

    getPrebookUsers();
    getOrders();
    getHistoryData();
  }, []);

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const filterTodayData = (orders, users) => {
    const todayOrdersFiltered = orders.filter(order => isToday(order.timestamp));
    const todayUserIds = new Set(todayOrdersFiltered.map(order => order.userId));
    const todayUsersFiltered = users.filter(user => 
      isToday(user.timestamp) || todayUserIds.has(user.firestoreId)
    );
    
    setTodayOrders(todayOrdersFiltered);
    setTodayUsers(todayUsersFiltered);
  };

  const getProgressMax = () => {
    const paidUsersCount = prebookUsers.filter(u => u.commitmentPaid).length;
    return Math.max(3, paidUsersCount);
  };

  const showSuccessAnimation = (title, message, additionalInfo = null, duration = 3000, showOkButton = false, onCloseCallback = null) => {
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
      console.log('Document written with ID: ', docRef.id);
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
      console.log("File uploaded successfully. File URL:", fileURL);
      return fileURL;
    } catch (e) {
      console.error("Error uploading file to Firebase Storage:", e);
      throw e;
    }
  };

  const updatePrebookUser = async (userId, updates) => {
    try {
      const userRef = doc(db, 'prebookUsers', userId);
      await updateDoc(userRef, updates);
      console.log('User updated successfully');
    } catch (e) {
      console.error('Error updating user: ', e);
      throw e;
    }
  };

  const getPrebookUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'prebookUsers'));
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, firestoreId: doc.id, ...doc.data() }));
      setPrebookUsers(users);

      const paidUsers = users.filter(u => u.commitmentPaid);
      setMinOrderReached(paidUsers.length >= 3);
      
      // Filter today's data after getting all data
      if (orders.length > 0) {
        filterTodayData(orders, users);
      }
    } catch (e) {
      console.error('Error getting users: ', e);
    }
  };

  const saveOrder = async (order) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log('Order saved with ID: ', docRef.id);
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
      
      // Filter today's data after getting all data
      if (prebookUsers.length > 0) {
        filterTodayData(allOrders, prebookUsers);
      }
    } catch (e) {
      console.error('Error getting orders: ', e);
    }
  };

  const saveToHistory = async () => {
    showLoadingAnimation('Saving to history...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                          todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
      const driverCost = 30;
      const todayProfit = todayRevenue - driverCost;
      
      const historyEntry = {
        date: today,
        timestamp: new Date().toISOString(),
        orders: todayOrders,
        users: todayUsers,
        totalOrders: todayOrders.length,
        totalUsers: todayUsers.length,
        paidUsers: todayUsers.filter(u => u.commitmentPaid).length,
        totalRevenue: todayRevenue,
        driverCost: driverCost,
        profit: todayProfit,
        commitmentFees: todayUsers.filter(u => u.commitmentPaid).length * 10,
        deliveryFees: todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)
      };

      await addDoc(collection(db, 'history'), historyEntry);
      await getHistoryData();
      
      hideLoadingAnimation();
      showSuccessAnimation(
        'Saved to History!',
        `Today's data has been saved to history. Profit: RM${todayProfit.toFixed(2)}`,
        null,
        3000,
        false
      );
    } catch (error) {
      hideLoadingAnimation();
      alert('Error saving to history. Please try again.');
      console.error('History save error:', error);
    }
  };

  const getHistoryData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'history'));
      const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistoryData(history.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (e) {
      console.error('Error getting history: ', e);
    }
  };

  const calculateMonthProfit = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate from history
    const monthHistory = historyData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    const historyProfit = monthHistory.reduce((sum, entry) => sum + (entry.profit || 0), 0);
    
    // Add today's profit if not already in history
    const todayString = new Date().toISOString().split('T')[0];
    const todayInHistory = monthHistory.some(entry => entry.date === todayString);
    
    if (!todayInHistory && todayOrders.length > 0) {
      const todayRevenue = todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                          todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
      const todayProfit = todayRevenue - 30;
      return historyProfit + todayProfit;
    }
    
    return historyProfit;
  };

  const calculateTotalProfit = () => {
    // Calculate from history
    const historyProfit = historyData.reduce((sum, entry) => sum + (entry.profit || 0), 0);
    
    // Add today's profit if not already in history
    const todayString = new Date().toISOString().split('T')[0];
    const todayInHistory = historyData.some(entry => entry.date === todayString);
    
    if (!todayInHistory && todayOrders.length > 0) {
      const todayRevenue = todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                          todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
      const todayProfit = todayRevenue - 30;
      return historyProfit + todayProfit;
    }
    
    return historyProfit;
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
    } else if (foundUser.commitmentPaid) {
      if (minOrderReached) {
        showSuccessAnimation(
          `Welcome back ${foundUser.name}!`,
          'Your payment has been confirmed. You can now submit your order.',
          null,
          2500,
          false
        );
        setUserStep(3);
      } else {
        showSuccessAnimation(
          `Welcome back ${foundUser.name}!`,
          'Your payment has been confirmed.',
          <p>Waiting for minimum 3 paid users before order submission opens.</p>,
          3000,
          false
        );
        setUserStep(3);
      }
    } else {
      showSuccessAnimation(
        `Welcome back ${foundUser.name}!`,
        'Please complete your commitment fee payment to continue.',
        null,
        2500,
        false
      );
      setUserStep(2);
    }

    setShowRetrieve(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    },
    header: {
      background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      color: 'white',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '24px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      '@media (max-width: 768px)': {
        padding: '20px'
      }
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '8px',
      margin: 0,
      '@media (max-width: 768px)': {
        fontSize: '24px'
      }
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.9)',
      margin: 0,
      fontSize: '16px',
      '@media (max-width: 768px)': {
        fontSize: '14px'
      }
    },
    navigation: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      '@media (max-width: 480px)': {
        gap: '8px'
      }
    },
    navButton: {
      padding: '14px 28px',
      borderRadius: '12px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '15px',
      flex: '1',
      minWidth: '140px',
      '@media (max-width: 480px)': {
        padding: '12px 16px',
        fontSize: '14px',
        minWidth: '100px'
      }
    },
    navButtonActive: {
      backgroundColor: '#2563eb',
      color: 'white',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
    },
    navButtonInactive: {
      backgroundColor: 'white',
      color: '#374151',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      marginBottom: '24px',
      '@media (max-width: 768px)': {
        padding: '20px'
      }
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    },
    cardTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      margin: 0,
      '@media (max-width: 768px)': {
        fontSize: '20px'
      }
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '16px'
      }
    },
    progressBar: {
      marginBottom: '20px'
    },
    progressText: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    progressTrack: {
      width: '100%',
      height: '14px',
      backgroundColor: '#e5e7eb',
      borderRadius: '7px',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      transition: 'width 0.5s ease',
      borderRadius: '7px',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      marginBottom: '12px',
      fontSize: '15px',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none'
      },
      '@media (max-width: 768px)': {
        fontSize: '16px',
        padding: '16px'
      }
    },
    inputError: {
      borderColor: '#ef4444'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '13px',
      marginTop: '-8px',
      marginBottom: '8px'
    },
    hint: {
      color: '#6b7280',
      fontSize: '13px',
      marginTop: '-8px',
      marginBottom: '8px'
    },
    button: {
      width: '100%',
      padding: '14px 28px',
      borderRadius: '12px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
      },
      '&:active': {
        transform: 'translateY(0)'
      },
      '@media (max-width: 768px)': {
        padding: '16px 28px'
      }
    },
    buttonGreen: {
      backgroundColor: '#059669',
      color: 'white'
    },
    buttonBlue: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    buttonOrange: {
      backgroundColor: '#ea580c',
      color: 'white'
    },
    authContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px'
    },
    passcodeInput: {
      position: 'relative',
      marginBottom: '16px',
      width: '100%',
      maxWidth: '300px'
    },
    toggleButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '8px'
    },
    orderItem: {
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      backgroundColor: '#f9fafb',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db'
      }
    },
    orderImage: {
      maxWidth: '200px',
      maxHeight: '200px',
      borderRadius: '8px',
      marginTop: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      '@media (max-width: 768px)': {
        maxWidth: '100%',
        height: 'auto'
      }
    },
    feeBreakdown: {
      backgroundColor: '#fef3c7',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #fbbf24',
      marginBottom: '16px'
    },
    mobileOnly: {
      '@media (min-width: 769px)': {
        display: 'none'
      }
    },
    desktopOnly: {
      '@media (max-width: 768px)': {
        display: 'none'
      }
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.2s',
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      }
    },
    statIcon: {
      width: '56px',
      height: '56px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statContent: {
      flex: 1
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937'
    }
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

    const nameExists = prebookUsers.some(user => user.name && user.name.toLowerCase() === studentName.toLowerCase());
    const idExists = prebookUsers.some(user => user.studentId === studentId);

    if (nameExists && idExists) {
      alert('This name AND student ID are already registered. Please use different details.');
      return;
    }
    if (nameExists) {
      alert('This name is already registered. Please use a different name.');
      return;
    }
    if (idExists) {
      alert('This student ID is already registered. Please use a different ID.');
      return;
    }

    showLoadingAnimation('Registering...');

    try {
      const newUser = {
        name: studentName,
        studentId: studentId,
        timestamp: new Date().toISOString(),
        hasOrdered: false,
        commitmentPaid: false,
        orderTotal: 0,
        orderSubmitted: false
      };

      const firestoreId = await savePrebookUser(newUser);
      const userWithId = { ...newUser, id: firestoreId, firestoreId };

      setPrebookUsers(prev => [...prev, userWithId]);
      setSelectedUserId(firestoreId);
      
      hideLoadingAnimation();
      
      showSuccessAnimation(
        'Registration Successful!',
        'You have been registered for the food delivery service.',
        <p>Please proceed to pay the RM10 commitment fee.</p>,
        0,
        true,
        () => setUserStep(2)
      );

    } catch (error) {
      hideLoadingAnimation();
      alert('Error registering user. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const handleCommitmentPayment = async () => {
    if (!receiptFile) {
      alert('Please upload payment receipt');
      return;
    }

    showLoadingAnimation('Uploading receipt...');

    try {
      const receiptURL = await uploadFileToStorage(receiptFile);

      await updatePrebookUser(selectedUserId, {
        commitmentPaid: true,
        paymentReceiptUploaded: true,
        receiptURL: receiptURL
      });

      setPrebookUsers(prev => prev.map(user =>
        user.firestoreId === selectedUserId
          ? { ...user, commitmentPaid: true, receiptURL: receiptURL }
          : user
      ));

      await getPrebookUsers();
      
      hideLoadingAnimation();
      
      const additionalInfo = minOrderReached ? 
        <p>You can now submit your order!</p> :
        <p>Waiting for minimum 3 users before orders open.</p>;
      
      showSuccessAnimation(
        'Payment Confirmed!',
        'Your RM10 commitment fee has been received.',
        additionalInfo,
        0,
        true,
        () => {
          if (minOrderReached) {
            setUserStep(3);
          }
        }
      );
      
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
    if (isNaN(totalAmount) || totalAmount <= 0) {
      alert('Please enter a valid order total');
      return;
    }

    const originalDeliveryFee = calculateDeliveryFee(totalAmount);
    const actualDeliveryFee = Math.max(0, originalDeliveryFee - 10);

    // Only require image if there's a delivery fee
    if (actualDeliveryFee > 0 && !orderImage) {
      alert('Please upload image of your order');
      return;
    }

    showLoadingAnimation('Processing order...');

    try {
      const selectedUser = prebookUsers.find(u => u.firestoreId === selectedUserId);
      
      const orderData = {
        userId: selectedUserId,
        userName: selectedUser.name,
        studentId: selectedUser.studentId,
        orderTotal: totalAmount,
        originalDeliveryFee: originalDeliveryFee,
        deliveryFee: actualDeliveryFee,
        commitmentFeeDeducted: 10,
        totalWithDelivery: totalAmount + actualDeliveryFee,
        timestamp: new Date().toISOString(),
        orderImageURL: null,
        orderNumber: `ORD-${Date.now()}`,
        status: 'pending'
      };

      // Only upload image if provided
      if (orderImage) {
        const orderImageURL = await uploadFileToStorage(orderImage);
        orderData.orderImageURL = orderImageURL;
      }

      setCurrentOrder(orderData);
      
      await saveOrder(orderData);
      await updatePrebookUser(selectedUserId, {
        orderTotal: orderData.orderTotal,
        orderSubmitted: true,
        hasOrdered: true,
        orderImageURL: orderData.orderImageURL
      });

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
  };

  const calculateDeliveryFee = (amount) => {
    if (amount < 50) return 10;
    if (amount >= 50 && amount < 100) return 17;
    if (amount >= 100 && amount < 150) return 25;
    if (amount >= 150 && amount < 200) return 30;
    return Math.min(amount * 0.15, 55);
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
        <Lock size={48} color="#6b7280" style={{ marginBottom: '24px' }} />
        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>{title}</h2>
        <p style={{ marginBottom: '24px', color: '#6b7280', textAlign: 'center' }}>
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
            maxWidth: '300px'
          }}
        >
          Access {title}
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
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
      
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Crave 2 Cave Delivery System</h1>
          <p style={styles.headerSubtitle}>Remote Area Food Delivery Service (19km from town)</p>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <button
            onClick={() => {
              setActiveTab('student');
              setIsAuthenticated(false);
            }}
            style={{
              ...styles.navButton,
              ...(activeTab === 'student' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Student Portal
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setIsAuthenticated(false);
            }}
            style={{
              ...styles.navButton,
              ...(activeTab === 'admin' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('driver');
              setIsAuthenticated(false);
            }}
            style={{
              ...styles.navButton,
              ...(activeTab === 'driver' ? styles.navButtonActive : styles.navButtonInactive)
            }}
          >
            Driver Portal
          </button>
        </div>

        {/* Student Portal */}
        {activeTab === 'student' && (
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Users color="#059669" size={24} />
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
                  <span>{prebookUsers.filter(u => u.commitmentPaid).length}/{getProgressMax()}</span>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min((prebookUsers.filter(u => u.commitmentPaid).length / getProgressMax()) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Step 1: Registration */}
              {userStep === 1 && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Step 1: Register</h3>
                  <input
                    type="text"
                    placeholder="Enter your full name (e.g., John Doe)"
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
                  {!idError && studentId.length === 0 && (
                    <p style={styles.hint}>Format example: 0469/24, 1234/23</p>
                  )}
                  
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
                  <h3 style={{ marginBottom: '16px' }}>Step 2: Pay Commitment Fee</h3>
                  
                  <UnifiedQRCodeDisplay amount={10} isCommitmentFee={true} />
                  
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <p><strong>Name:</strong> {studentName}</p>
                    <p><strong>Student ID:</strong> {studentId}</p>
                    <p><strong>Commitment Fee:</strong> RM10</p>
                  </div>

                  <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                    Upload proof of payment (RM10 commitment fee):
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setReceiptFile(e.target.files[0]);
                      console.log('Selected receipt file:', e.target.files[0]);
                    }}
                    style={styles.input}
                  />

                  {receiptFile && (
                    <div style={{ marginBottom: '16px' }}>
                      <img
                        src={URL.createObjectURL(receiptFile)}
                        alt="Payment Receipt"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
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
                        backgroundColor: '#6b7280',
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
                  <h3 style={{ marginBottom: '16px' }}>Step 3: Submit Your Order</h3>

                  <div style={{
                    backgroundColor: '#ecfdf5',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #10b981'
                  }}>
                    <CheckCircle color="#059669" size={20} style={{ marginRight: '8px', display: 'inline' }} />
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
                    <div style={styles.feeBreakdown}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#92400e' }}>Fee Breakdown</h4>
                      <p style={{ margin: '4px 0' }}>Order Total: RM{orderTotal}</p>
                      <p style={{ margin: '4px 0' }}>Original Delivery Fee: RM{calculateDeliveryFee(parseFloat(orderTotal) || 0)}</p>
                      <p style={{ margin: '4px 0', color: '#059669' }}>Commitment Fee Deduction: -RM10</p>
                      <hr style={{ margin: '8px 0', borderColor: '#fbbf24' }} />
                      <p style={{ margin: '4px 0' }}>
                        <strong>Final Delivery Fee: RM{Math.max(0, calculateDeliveryFee(parseFloat(orderTotal) || 0) - 10)}</strong>
                      </p>
                    </div>
                  )}

                  {orderTotal && (
                    <UnifiedQRCodeDisplay 
                      amount={Math.max(0, calculateDeliveryFee(parseFloat(orderTotal) || 0) - 10)} 
                    />
                  )}

                  <p style={{ marginBottom: '8px', color: '#6b7280' }}>
                    Upload image of your order {Math.max(0, calculateDeliveryFee(parseFloat(orderTotal) || 0) - 10) === 0 ? '(optional)' : ''}:
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setOrderImage(e.target.files[0])}
                    style={styles.input}
                  />

                  {orderImage && (
                    <div style={{ marginBottom: '16px' }}>
                      <img
                        src={URL.createObjectURL(orderImage)}
                        alt="Order"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleOrderSubmission}
                    disabled={!orderTotal || (Math.max(0, calculateDeliveryFee(parseFloat(orderTotal) || 0) - 10) > 0 && !orderImage)}
                    style={{
                      ...styles.button,
                      ...styles.buttonOrange,
                      opacity: (!orderTotal || (Math.max(0, calculateDeliveryFee(parseFloat(orderTotal) || 0) - 10) > 0 && !orderImage)) ? 0.5 : 1,
                      cursor: (!orderTotal || (Math.max(0, calculateDeliveryFee(parseFloat(orderTotal) || 0) - 10) > 0 && !orderImage)) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Submit Order
                  </button>
                </div>
              )}

              {/* Show message if minimum order not reached */}
              {userStep === 3 && !minOrderReached && (
                <div>
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #10b981'
                  }}>
                    <CheckCircle color="#059669" size={20} style={{ marginRight: '8px', display: 'inline' }} />
                    Payment confirmed! Thank you for your commitment.
                  </div>

                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '2px solid #f59e0b',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px'
                    }}>
                      ⏳
                    </div>
                    <h3 style={{ 
                      margin: '0 0 12px 0', 
                      color: '#92400e',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      Waiting for More Orders
                    </h3>
                    <p style={{ 
                      margin: '8px 0 16px 0', 
                      color: '#92400e',
                      fontSize: '16px'
                    }}>
                      We need at least 3 paid users before order submission opens.
                    </p>
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937'
                      }}>
                        Current Progress: {prebookUsers.filter(u => u.commitmentPaid).length}/3 users
                      </p>
                    </div>
                    <p style={{ 
                      margin: '0', 
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      You'll be able to submit your order once we reach the minimum requirement.
                      Please check back later or wait for a notification.
                    </p>
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
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                      Today's Data - {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={saveToHistory}
                      disabled={todayOrders.length === 0}
                      style={{
                        ...styles.button,
                        width: 'auto',
                        backgroundColor: todayOrders.length === 0 ? '#9ca3af' : '#10b981',
                        color: 'white',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: todayOrders.length === 0 ? 0.5 : 1,
                        cursor: todayOrders.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Save size={18} />
                      Save to History
                    </button>
                    <button
                      onClick={resetAuth}
                      style={{
                        ...styles.button,
                        width: 'auto',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '12px 24px'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px',
                  marginBottom: '32px' 
                }}>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#dbeafe' }}>
                      <Users size={28} color="#3b82f6" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Today's Registered</p>
                      <p style={styles.statValue}>{todayUsers.length}</p>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#d1fae5' }}>
                      <UserCheck size={28} color="#10b981" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Today's Paid Users</p>
                      <p style={styles.statValue}>{todayUsers.filter(u => u.commitmentPaid).length}</p>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#fee2e2' }}>
                      <Package size={28} color="#ef4444" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Today's Orders</p>
                      <p style={styles.statValue}>{todayOrders.length}</p>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7' }}>
                      <DollarSign size={28} color="#f59e0b" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Today's Revenue</p>
                      <p style={styles.statValue}>
                        RM{(todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                          todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#e0e7ff' }}>
                      <TrendingUp size={28} color="#6366f1" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Month Profit</p>
                      <p style={styles.statValue}>
                        RM{calculateMonthProfit().toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#fce7f3' }}>
                      <TrendingUp size={28} color="#ec4899" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Total Profit</p>
                      <p style={styles.statValue}>
                        RM{calculateTotalProfit().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profit Breakdown */}
                <div style={styles.card}>
                  <h3>Today's Profit Calculation</h3>
                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '20px', 
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Commitment Fees ({todayUsers.filter(u => u.commitmentPaid).length} × RM10):</span>
                      <span style={{ fontWeight: 'bold' }}>
                        +RM{(todayUsers.filter(u => u.commitmentPaid).length * 10).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Delivery Fees:</span>
                      <span style={{ fontWeight: 'bold' }}>
                        +RM{todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '12px',
                      marginTop: '12px' 
                    }}>
                      <span>Total Revenue:</span>
                      <span style={{ fontWeight: 'bold' }}>
                        RM{(todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                          todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginTop: '12px'
                    }}>
                      <span>Driver Cost:</span>
                      <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
                        -RM30.00
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      borderTop: '2px solid #e5e7eb',
                      paddingTop: '12px',
                      marginTop: '12px'
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Today's Profit:</span>
                      <span style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: (todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                               todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) - 30) >= 0 
                               ? '#059669' : '#dc2626' 
                      }}>
                        RM{((todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                            todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) - 30).toFixed(2))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
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
                  <h3>Today's Orders</h3>
                  {todayOrders.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <AlertCircle size={48} style={{ marginBottom: '16px' }} />
                      <p>No orders for today yet.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Order #</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Order Total</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Delivery Fee</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todayOrders.map((order, index) => (
                            <tr key={order.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '12px' }}>{order.orderNumber}</td>
                              <td style={{ padding: '12px' }}>{order.userName}</td>
                              <td style={{ padding: '12px' }}>{order.studentId}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>RM{order.orderTotal}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>RM{order.deliveryFee}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                                RM{order.totalWithDelivery}
                              </td>
                              <td style={{ padding: '12px' }}>{new Date(order.timestamp).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <h2 style={{ margin: 0 }}>Driver Portal</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                      Pickup Date: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={resetAuth}
                    style={{
                      ...styles.button,
                      width: 'auto',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '12px 24px'
                    }}
                  >
                    Logout
                  </button>
                </div>

                {/* Summary Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '20px',
                  marginBottom: '32px' 
                }}>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#fee2e2' }}>
                      <Package size={28} color="#ef4444" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Total Orders</p>
                      <p style={styles.statValue}>{todayOrders.length}</p>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#dbeafe' }}>
                      <Clock size={28} color="#3b82f6" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Pickup Time</p>
                      <p style={styles.statValue}>7:00 PM</p>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#d1fae5' }}>
                      <Calendar size={28} color="#10b981" />
                    </div>
                    <div style={styles.statContent}>
                      <p style={styles.statLabel}>Date</p>
                      <p style={styles.statValue}>{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <Truck color="#ea580c" size={24} />
                    <h2 style={styles.cardTitle}>Today's Orders Summary</h2>
                  </div>

                  {todayOrders.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <Clock size={48} style={{ marginBottom: '16px' }} />
                      <p>No orders for today yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {todayOrders.map((order, index) => (
                        <div key={order.id || index} style={{
                          ...styles.orderItem,
                          border: '2px solid #e5e7eb'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            <h4 style={{ margin: 0, fontSize: '18px' }}>Order #{index + 1}</h4>
                            <span style={{
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '6px 16px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              {order.orderNumber}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '12px',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <p style={{ margin: '4px 0', color: '#6b7280' }}>Customer</p>
                              <p style={{ margin: '0', fontWeight: '600' }}>{order.userName}</p>
                            </div>
                            <div>
                              <p style={{ margin: '4px 0', color: '#6b7280' }}>Student ID</p>
                              <p style={{ margin: '0', fontWeight: '600' }}>{order.studentId}</p>
                            </div>
                          </div>
                          
                          <div style={{
                            backgroundColor: '#f0fdf4',
                            padding: '16px',
                            borderRadius: '8px'
                          }}>
                            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Order Details:</p>
                            <p style={{ margin: '0', fontWeight: '600', fontSize: '16px' }}>
                              Food Order - RM{order.orderTotal}
                            </p>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              borderTop: '2px solid #10b981',
                              paddingTop: '8px',
                              marginTop: '8px'
                            }}>
                              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Amount:</span>
                              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                                RM{order.orderTotal}
                              </span>
                            </div>
                          </div>
                          
                          {order.orderImageURL && (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                              <img
                                src={order.orderImageURL}
                                alt="Order"
                                style={styles.orderImage}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Crave2CaveSystem;