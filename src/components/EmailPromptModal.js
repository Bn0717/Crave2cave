// src/components/EmailPromptModal.js
import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';

const EmailPromptModal = ({ user, onSubmit, onCancel }) => {
  const [email, setEmail] = useState('');

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    modal: {
      background: 'white', borderRadius: '20px', padding: '32px',
      width: '90%', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      textAlign: 'center',
    },
    title: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' },
    subtitle: { fontSize: '16px', color: '#64748b', margin: '0 0 24px 0' },
    inputContainer: { position: 'relative', marginBottom: '24px' },
    input: {
      width: '100%', padding: '14px 14px 14px 45px',
      borderRadius: '12px', border: '2px solid #e2e8f0',
      fontSize: '16px', boxSizing: 'border-box',
    },
    icon: { position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#94a3b8' },
    button: {
      width: '100%', padding: '16px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white', border: 'none', borderRadius: '12px',
      fontSize: '16px', fontWeight: '600', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!user || !user.firestoreId) {
    console.error('Invalid user data in EmailPromptModal', { user });
    alert('Error: User data is missing. Please try again.');
    return;
  }
  if (!email.includes('@') || !email.includes('.')) {
    alert('Please enter a valid email address.');
    return;
  }
  console.log('Submitting email:', { userId: user.firestoreId, email });
  onSubmit(user.firestoreId, email);
};

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>One Last Step!</h2>
        <p style={styles.subtitle}>
          Enter your email to receive a notification when your order is on its way. (Check your spam email!)
        </p>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputContainer}>
            <Mail size={20} style={styles.icon} />
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button}>
            <Send size={18} />
            Confirm and Track Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailPromptModal;