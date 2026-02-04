import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Package, Users, TrendingUp, Lock, Loader2 } from 'lucide-react';

const EditHistoryModal = ({ isOpen, onClose, entry, onSave, adminPasscode }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setRegisteredUsers(entry.registeredUsers || 0);
      setTotalOrders(entry.totalOrders || 0);
      setTotalRevenue(entry.totalRevenue || 0);
      setProfit(entry.profit || 0);
      setShowPasswordForm(true);
      setPasswordInput('');
      setPasswordError('');
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handlePasswordCheck = () => {
    if (passwordInput === adminPasscode) {
      setShowPasswordForm(false);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect passcode');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(entry.id, {
      registeredUsers: Number(registeredUsers),
      totalOrders: Number(totalOrders),
      totalRevenue: Number(totalRevenue),
      profit: Number(profit)
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        maxWidth: '550px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '3px solid #3b82f6'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '28px',
          borderBottom: '3px solid #2563eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              color: 'white',
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '4px'
            }}>
              {showPasswordForm ? 'Admin Authentication' : 'Edit History Entry'}
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {new Date(entry.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={24} color="white" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {showPasswordForm ? (
            <>
              <p style={{
                fontSize: '15px',
                color: '#64748b',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                Please enter the admin passcode to edit this entry.
              </p>
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '10px'
                }}>
                  <Lock size={18} color="#dc2626" />
                  Admin Passcode
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordCheck()}
                  placeholder="Enter admin passcode"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: passwordError ? '2px solid #ef4444' : '2px solid #e2e8f0',
                    borderRadius: '12px',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = passwordError ? '#ef4444' : '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = passwordError ? '#ef4444' : '#e2e8f0'}
                />
                {passwordError && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '13px',
                    marginTop: '6px',
                    fontWeight: '500'
                  }}>
                    {passwordError}
                  </p>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '28px'
              }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#64748b',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordCheck}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  Proceed
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Registered Users */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '10px'
                  }}>
                    <Users size={18} color="#3b82f6" />
                    Registered Users
                  </label>
                  <input
                    type="number"
                    value={registeredUsers}
                    onChange={(e) => setRegisteredUsers(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* Total Orders */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '10px'
                  }}>
                    <Package size={18} color="#ef4444" />
                    Total Orders
                  </label>
                  <input
                    type="number"
                    value={totalOrders}
                    onChange={(e) => setTotalOrders(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* Total Revenue */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '10px'
                  }}>
                    <DollarSign size={18} color="#f59e0b" />
                    Total Revenue (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalRevenue}
                    onChange={(e) => setTotalRevenue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* Profit */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '10px'
                  }}>
                    <TrendingUp size={18} color="#10b981" />
                    Profit (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={profit}
                    onChange={(e) => setProfit(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '28px'
              }}>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#64748b',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: 'none',
                    borderRadius: '12px',
                    background: isSaving ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isSaving && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                  {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditHistoryModal;