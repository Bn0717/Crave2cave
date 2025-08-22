import React, { useState } from 'react';
import { ChevronRight, Truck, UserCog, Shield } from 'lucide-react';
import logo from '../assets/logo(1).png';

const LandingPage = ({ onStart, onNavigateToPortal, windowWidth }) => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);

  const vendors = [
    { id: 'dominos', name: "Domino's Pizza", logo: '🍕', color: '#0078d4' },
    { id: 'ayam_gepuk', name: "Ayam Gepuk Pak Gembus", logo: '🍗', color: '#ffcc02' },
    { id: 'mixue', name: 'MIXUE', logo: '🧋', color: '#ff69b4' }
  ];

  const foodItems = [
    { emoji: '🍔' }, { emoji: '🍕' }, { emoji: '🍟' }, { emoji: '🧋' },
    { emoji: '🌮' }, { emoji: '🍦' }, { emoji: '🥤' }, { emoji: '🍰' },
  ];

  const handleStart = () => {
    if (!selectedVendor) {
      alert('Please select a vendor first!');
      return;
    }
    onStart(selectedVendor);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
    },
    backgroundElements: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', overflow: 'hidden',
    },
    floatingFood: {
      position: 'absolute', animation: 'float 6s ease-in-out infinite', opacity: 0.1,
    },
    centerLogo: {
      position: 'relative', marginBottom: '40px',
      textAlign: 'center', zIndex: 2,
    },
    logoContainer: {
      position: 'relative', width: windowWidth <= 768 ? '150px' : '200px',
      height: windowWidth <= 768 ? '150px' : '200px', margin: '0 auto',
      marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    mainLogo: {
      width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
      filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.3))', animation: 'pulse 3s ease-in-out infinite',
      background: 'rgba(255, 255, 255, 0.95)', padding: '10px',
      border: '3px solid rgba(255,255,255,0.3)',
    },
    title: {
      fontSize: windowWidth <= 768 ? '2.5rem' : '3.5rem',
      fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: '10px', textShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
    subtitle: {
      fontSize: windowWidth <= 768 ? '1rem' : '1.25rem', color: 'rgba(255,255,255,0.9)',
      marginBottom: '40px', textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    vendorContainer: {
      display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
      gap: '16px', maxWidth: '1000px',
      width: '100%', marginBottom: '40px', zIndex: 2, position: 'relative',
    },
    vendorCard: {
      background: 'rgba(255, 255, 255, 0.95)', borderRadius: '24px',
      padding: windowWidth <= 768 ? '20px' : '32px', textAlign: 'center',
      cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '2px solid transparent', position: 'relative', overflow: 'hidden',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    },
    vendorCardSelected: {
      transform: 'scale(1.05)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    },
    vendorLogo: {
      fontSize: windowWidth <= 768 ? '40px' : '56px', marginBottom: '16px',
      display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
    },
    vendorName: {
      fontSize: windowWidth <= 768 ? '1rem' : '1.25rem', fontWeight: '700',
      color: '#1a1a1a',
    },
    startButton: {
      background: selectedVendor ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
      color: 'white', border: 'none', borderRadius: '16px',
      padding: windowWidth <= 768 ? '14px 28px' : '18px 40px',
      fontSize: windowWidth <= 768 ? '1rem' : '1.125rem', fontWeight: '600',
      cursor: selectedVendor ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: selectedVendor ? '0 8px 32px rgba(16, 185, 129, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
      zIndex: 2,
    },
    staffMenuContainer: {
      position: 'absolute',
      top: windowWidth <= 768 ? '20px' : '40px',
      right: windowWidth <= 768 ? '20px' : '40px',
      zIndex: 20,
    },
    staffMenuButton: {
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'rgba(255, 255, 255, 0.9)',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    },
    staffMenuDropdown: {
      position: 'absolute',
      top: '65px',
      right: 0,
      background: 'rgba(25, 25, 45, 0.7)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      opacity: isStaffMenuOpen ? 1 : 0,
      transform: isStaffMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
      visibility: isStaffMenuOpen ? 'visible' : 'hidden',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    staffMenuItem: {
      background: 'none',
      border: 'none',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 15px',
      borderRadius: '10px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background-color 0.2s ease',
      fontSize: '15px',
      fontWeight: '500',
    },
    shimmer: {
      position: 'absolute', top: 0, left: '-100%', width: '100%',
      height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: 'shimmer 2s infinite',
    },
  };

  const generateFloatingElements = () => {
    return Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        style={{
          ...styles.floatingFood,
          fontSize: `${Math.random() * 30 + 20}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 6}s`,
          animationDuration: `${6 + Math.random() * 4}s`,
        }}
      >
        {foodItems[Math.floor(Math.random() * foodItems.length)].emoji}
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      <div style={styles.staffMenuContainer}>
        <button
          className="staff-menu-button"
          style={styles.staffMenuButton}
          onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
        >
          <Shield size={24} />
        </button>
        <div style={styles.staffMenuDropdown}>
          <button
            className="staff-menu-item"
            style={styles.staffMenuItem}
            onClick={() => {
              onNavigateToPortal('driver');
              setIsStaffMenuOpen(false);
            }}
          >
            <Truck size={20} />
            <span>Driver Portal</span>
          </button>
          <button
            className="staff-menu-item"
            style={styles.staffMenuItem}
            onClick={() => {
              onNavigateToPortal('admin');
              setIsStaffMenuOpen(false);
            }}
          >
            <UserCog size={20} />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .staff-menu-button:hover {
          background: rgba(0, 0, 0, 0.3);
          transform: scale(1.05);
        }
        .staff-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div style={styles.backgroundElements}>
        {generateFloatingElements()}
      </div>

      <div style={styles.centerLogo}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="Crave2Cave Logo" style={styles.mainLogo} />
        </div>
        <h1 style={styles.title}>Crave 2 Cave</h1>
        <p style={styles.subtitle}>Choose your favourite restaurant and start ordering!</p>
      </div>

      <div style={styles.vendorContainer}>
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            style={{ ...styles.vendorCard, ...(selectedVendor === vendor.id ? styles.vendorCardSelected : {}), borderColor: selectedVendor === vendor.id ? vendor.color : 'transparent' }}
            onClick={() => setSelectedVendor(vendor.id)}
          >
            {selectedVendor === vendor.id && <div style={styles.shimmer} />}
            <div style={styles.vendorLogo}>{vendor.logo}</div>
            <h3 style={styles.vendorName}>{vendor.name}</h3>
          </div>
        ))}
      </div>

      <button
        style={styles.startButton}
        onClick={handleStart}
        disabled={!selectedVendor}
      >
        <span>Start Ordering</span>
        <ChevronRight size={24} />
      </button>

    </div>
  );
};

export default LandingPage;