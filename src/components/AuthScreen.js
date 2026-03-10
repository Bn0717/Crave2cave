import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AuthScreen = ({ title, onAuth }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  // Define styles locally within the component
  const styles = {
    authCard: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f1f5f9',
      maxWidth: '420px',
      width: '100%',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    },
    iconWrapper: {
      backgroundColor: '#f1f5f9',
      padding: '16px',
      borderRadius: '50%',
      marginBottom: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      margin: 0,
      color: '#1e293b',
    },
    prompt: {
      color: '#64748b',
      fontSize: '16px',
      margin: '8px 0 24px 0',
    },
    inputContainer: {
      position: 'relative',
      width: '100%',
    },
    input: {
      width: '100%',
      padding: '16px 50px 16px 20px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '16px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
      backgroundColor: '#f8fafc',
    },
    toggleButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '8px',
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
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      marginTop: '16px',
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
    },
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  // ✅ Save the password in localStorage (use different keys for admin & driver if needed)
  localStorage.setItem('adminPassword', passcode);

  onAuth(passcode); // continue with existing logic
};


  return (
    <div style={styles.authCard}>
      <div style={styles.iconWrapper}>
        <Lock size={32} color="#3b82f6" />
      </div>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.prompt}>Enter the passcode to access the dashboard.</p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={styles.inputContainer}>
          <input
            type={showPasscode ? 'text' : 'password'}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={styles.input}
            placeholder="••••••••"
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            type="button"
            onClick={() => setShowPasscode(!showPasscode)}
            style={styles.toggleButton}
            aria-label="Toggle passcode visibility"
          >
            {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" style={styles.button}>
          Access Dashboard
        </button>
      </form>
    </div>
  );
};

export default AuthScreen;