import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  History, 
  Loader2, 
  AlertCircle,
  UserCheck,
  Camera,
  Image,
  Edit
} from 'lucide-react';

import AuthScreen from './AuthScreen';
import ResponsiveTable from './ResponsiveTable';
import SimpleChart from './SimpleChart';
import { isToday } from '../utils/isToday';
import EditHistoryModal from './EditHistoryModal';
import * as firebaseService from '../services/firebase';

const AdminTab = ({
  prebookUsers,
  todayOrders,
  todayUsers,
  historyData,
  loadingUsers,
  loadingOrders,
  loadingHistory,
  windowWidth,
  setSelectedImage,
  isAuthenticated,
  onAuth,
  resetAuth,
  showSuccessAnimation,    // ADD THIS
  showLoadingAnimation,    // ADD THIS  
  hideLoadingAnimation, 
  setShowImageCarousel,
  setSelectedImages,
  systemAvailability,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const VENDOR_MAP = {
  'mixue': { name: 'Mixue', icon: '🧋' },
  'dominos': { name: 'Dominos', icon: '🍕' },
  'ayam_gepuk': { name: 'Ayam Gepuk', icon: '🍗' },
  'family_mart': { name: 'Family Mart', icon: '🏪' },
};

  const styles = {
    card: { 
      backgroundColor: 'white', 
      borderRadius: '20px', 
      padding: '32px', 
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', 
      marginBottom: '24px', 
      border: '1px solid #f1f5f9' 
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
    button: { 
      width: '100%', 
      padding: '16px 32px', 
      borderRadius: '12px', 
      fontWeight: '600', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: '16px', 
      transition: 'all 0.3s ease', 
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)' 
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
      border: '1px solid #f1f5f9' 
    },
    statIcon: { 
      width: '64px', 
      height: '64px', 
      borderRadius: '16px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexShrink: 0 
    },
    statContent: { flex: 1, minWidth: 0 },
    statLabel: { 
      fontSize: '14px', 
      color: '#64748b', 
      marginBottom: '4px', 
      fontWeight: '500' 
    },
    statValue: { 
      fontSize: '28px', 
      fontWeight: 'bold', 
      color: '#1e293b', 
      lineHeight: '1.2' 
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async (entryId, updatedData) => {
    try {
      showLoadingAnimation('Updating history...');
      await firebaseService.updateHistoryEntry(entryId, updatedData);
      // Refresh data to show changes
      hideLoadingAnimation();
      showSuccessAnimation('Success!', 'History entry has been updated.');
    } catch (error) {
      hideLoadingAnimation();
      alert('Failed to update history. Check console for errors.');
      console.error(error);
    }
  };

  const getTotalHistoryStats = () => {
    // This function now ONLY calculates from the history data provided.
    // It no longer tries to add live "today" data, which was causing the issue.
    const totalRegistered = historyData.reduce((sum, entry) => sum + (entry.registeredUsers || 0), 0);
    const totalRevenue = historyData.reduce((sum, entry) => sum + (entry.totalRevenue || 0), 0);
    const totalProfit = historyData.reduce((sum, entry) => sum + (entry.profit || 0), 0);
    const totalOrders = historyData.reduce((sum, entry) => sum + (entry.totalOrders || 0), 0);
    
    return { totalRegistered, totalRevenue, totalProfit, totalOrders };
  };

    if (!isAuthenticated) {
    // This wrapper will center the AuthScreen component
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh' // Ensures vertical centering
      }}>
        <AuthScreen title="Admin Dashboard" onAuth={onAuth} />
      </div>
    );
  }

  if (loadingUsers || loadingOrders || loadingHistory) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px', 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        marginBottom: '32px' 
      }}>
        <Loader2 size={56} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '24px', color: '#64748b', fontSize: '18px' }}>
          Loading dashboard data...
        </p>
      </div>
    );
  }

  const paidUsers = todayUsers.filter(u => u.commitmentPaid).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div>
      {!showHistory ? (
        <>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px', 
            flexWrap: 'wrap', 
            gap: '16px' 
          }}>
            <div>
  <h2 style={{ margin: 0, fontSize: '32px', color: '#1e293b' }}>
    Admin Dashboard
  </h2>
  <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '16px' }}>
    Delivery Date: {new Date(systemAvailability.deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
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
                <History size={20} /> View History
              </button>
              <button 
  onClick={() => setShowConfirmPopup(true)}
  
  style={{ 
    ...styles.button, 
    width: 'auto', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    padding: '14px 28px' 
  }}
>
  Clear All Sessions
</button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 480 
              ? 'repeat(2, 1fr)' 
              : windowWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: windowWidth <= 480 ? '10px' : windowWidth <= 768 ? '16px' : '24px',
            marginBottom: windowWidth <= 480 ? '24px' : '40px' 
          }}>
            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <Users size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#3b82f6" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Registered</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
                }}>{todayUsers.length}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <Package size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#ef4444" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Orders</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
                }}>{todayOrders.length}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <DollarSign size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#f59e0b" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Revenue</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
                }}>
                  RM{(todayUsers.filter(u => u.commitmentPaid).length * 10 + 
                    todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0)).toFixed(2)}
                </p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              ...(windowWidth <= 768 ? {
                padding: windowWidth <= 480 ? '12px' : '16px',
                gap: windowWidth <= 480 ? '10px' : '12px',
              } : {})
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                ...(windowWidth <= 768 ? {
                  width: windowWidth <= 480 ? '40px' : '48px',
                  height: windowWidth <= 480 ? '40px' : '48px',
                } : {})
              }}>
                <TrendingUp size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#10b981" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
                }}>Today's Profit</p>
                <p style={{
                  ...styles.statValue,
                  ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
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
            <h3 style={{ 
              fontSize: windowWidth <= 480 ? '18px' : '22px', 
              marginBottom: '20px' 
            }}>
              Today's Profit Calculation
            </h3>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: windowWidth <= 480 ? '16px' : '24px', 
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
                  fontSize: windowWidth <= 480 ? '13px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Commitment Fees ({todayUsers.filter(u => u.commitmentPaid).length} × RM10):
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: windowWidth <= 480 ? '13px' : '16px' 
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
                  fontSize: windowWidth <= 480 ? '13px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Delivery Fees:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: windowWidth <= 480 ? '13px' : '16px' 
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
                  fontSize: windowWidth <= 480 ? '14px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Total Revenue:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: windowWidth <= 480 ? '14px' : '16px' 
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
                  fontSize: windowWidth <= 480 ? '13px' : '16px',
                  lineHeight: '1.4'
                }}>
                  Driver Cost:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: '#dc2626', 
                  fontSize: windowWidth <= 480 ? '13px' : '16px' 
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
                  fontSize: windowWidth <= 480 ? '16px' : '20px', 
                  fontWeight: 'bold',
                  lineHeight: '1.4'
                }}>
                  Today's Profit:
                </span>
                <span style={{ 
                  fontSize: windowWidth <= 480 ? '16px' : '20px', 
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

          {/* Awaiting Orders Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <UserCheck color="#f59e0b" size={28} />
              <h2 style={styles.cardTitle}>Awaiting Order Submission (First three users only)</h2>
            </div>
            
            {(() => {
  // Get first 3 paid users who haven't ordered
  const firstThreePaidUsers = todayUsers
    .filter(u => u.commitmentPaid)
    .sort((a, b) => new Date(a.receiptUploadTime || a.timestamp) - new Date(b.receiptUploadTime || b.timestamp))
    .slice(0, 3);
  
  const awaitingUsers = firstThreePaidUsers.filter(user => !user.orderSubmitted);
  
  return awaitingUsers.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gap: '12px', 
                marginTop: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
              }}>
                {awaitingUsers.map(user => {
  const vendorInfo = VENDOR_MAP[user.vendor] || { name: user.vendor || 'No vendor', icon: '🏪' };
  
  return (
    <div key={user.id} style={{ 
      padding: '12px', 
      backgroundColor: '#fffbeb', 
      border: '1px solid #fef3c7', 
      borderRadius: '8px',
      display: 'flex',                    // ADD THIS
  justifyContent: 'space-between',    // ADD THIS
  alignItems: 'center'
    }}>
      <div>
      <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>{user.name}</p>
      <p style={{margin: '2px 0 0 0', fontSize: windowWidth <= 480 ? '11px' : '12px', color: '#b45309', fontWeight: '500'}}>Contact: {user.contactNumber || 'Not provided'}</p>
      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78350f', textTransform: 'uppercase' }}>{user.vendor || 'No vendor'}</p>
      </div>
      
      {/* Vendor badge */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        backgroundColor: '#eef2ff',
        color: '#b45309',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: '600',
        border: '1px solid #c7d2fe',
        flexShrink: 0
      }}>
        <span>{vendorInfo.icon}</span>
        <span>{windowWidth <= 480 ? vendorInfo.name.substring(0, 10) : vendorInfo.name}</span>
      </div>
    </div>
  );
})}
          </div>
        ) : (
          <p style={{ marginTop: '20px', color: '#64748b', textAlign: 'center' }}>
            All first 3 paid users have submitted their orders.
          </p>
        );
      })()}
          </div>

          {/* Payment & Order Verification Card */}
<div style={styles.card}>
  <div style={styles.cardHeader}>
    <Camera color="#8b5cf6" size={28} />
    <h2 style={styles.cardTitle}>Payment & Order Verification</h2>
  </div>
  
  {todayUsers.length > 0 ? (
    <div style={{
      display: 'grid',
      gridTemplateColumns: windowWidth <= 480 
  ? '1fr' 
  : windowWidth <= 768 
  ? 'repeat(auto-fit, minmax(280px, 1fr))' 
  : windowWidth <= 1200
  ? 'repeat(auto-fit, minmax(320px, 1fr))'
  : 'repeat(3, 1fr)',
      gap: windowWidth <= 480 ? '12px' : '16px'
    }}>
      {todayUsers.map((user, userIndex) => {
        const userOrder = todayOrders.find(order => order.userId === user.firestoreId);
// Get the first 3 users who PAID (by payment time, not registration time)
const firstThreePaidUsers = todayUsers
  .filter(u => u.commitmentPaid) // <-- CORRECTED: Removed isToday()
  .sort((a, b) => new Date(a.receiptUploadTime || a.timestamp) - new Date(b.receiptUploadTime || b.timestamp))
  .slice(0, 3);

const isFirstThreeUser = firstThreePaidUsers.some(paidUser => paidUser.firestoreId === user.firestoreId);
        
        return (
          <div key={user.id} style={{
            backgroundColor: '#f8fafc',
            border: user.commitmentPaid 
              ? '2px solid #10b981' 
              : '2px solid #f59e0b',
            borderRadius: '16px',
            padding: windowWidth <= 480 ? '16px' : '20px',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}>
            {/* First Three Users Badge - Only for users who are actually in first 3 paid */}
{isFirstThreeUser && (
  <div style={{
    position: 'absolute',
    top: '-8px',
    right: '16px',
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: windowWidth <= 480 ? '10px' : '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
  }}>
    First 3 Paid User
  </div>
)}

            {/* User Header with Combined Info */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: windowWidth <= 480 ? '14px' : '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {/* User Basic Info Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: userOrder ? '12px' : '0'
              }}>
                <div>
                  <h4 style={{
                    margin: 0,
                    fontSize: windowWidth <= 480 ? '15px' : '17px',
                    color: '#1e293b',
                    fontWeight: '700'
                  }}>
                    {user.name}
                  </h4>
                  <p style={{
  margin: '2px 0 0 0',
  fontSize: windowWidth <= 480 ? '11px' : '12px',
  color: '#64748b',
  fontWeight: '500'
}}>
  Contact: {user.contactNumber || 'Not provided'}
</p>
                  <p style={{
  margin: '2px 0 0 0',
  fontSize: windowWidth <= 480 ? '10px' : '11px',
  color: '#1e293b',
  fontWeight: '600',
  textTransform: 'uppercase'
}}>
  {user.vendor || 'No vendor'}
</p>
                </div>
                
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: windowWidth <= 480 ? '10px' : '11px',
                  fontWeight: '700',
                  backgroundColor: user.commitmentPaid ? '#d1fae5' : '#fef3c7',
                  color: user.commitmentPaid ? '#065f46' : '#92400e',
                  border: `2px solid ${user.commitmentPaid ? '#86efac' : '#fcd34d'}`
                }}>
                  {user.commitmentPaid ? 'PAID' : 'PENDING'}
                </div>
              </div>

              {/* Order Summary (if order exists) */}
              {userOrder && (
                <div style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
  <span style={{
    fontSize: windowWidth <= 480 ? '11px' : '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }}>
    Order #{userOrder.orderNumber}
  </span>
  <span style={{
    fontSize: windowWidth <= 480 ? '10px' : '11px',
    color: '#64748b',
    fontWeight: '500'
  }}>
    Submitted: {new Date(userOrder.timestamp).toLocaleString('en-MY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}
  </span>
</div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: windowWidth <= 480 ? '1fr 1fr' : '1fr 1fr 1fr',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '10px' : '11px',
                        color: '#64748b',
                        marginBottom: '2px'
                      }}>
                        Order Total
                      </div>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '13px' : '14px',
                        fontWeight: 'bold',
                        color: '#059669'
                      }}>
                        RM{userOrder.orderTotal.toFixed(2)}
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '10px' : '11px',
                        color: '#64748b',
                        marginBottom: '2px'
                      }}>
                        Delivery Fee
                      </div>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '13px' : '14px',
                        fontWeight: 'bold',
                        color: '#f59e0b'
                      }}>
                        RM{userOrder.deliveryFee.toFixed(2)}
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0',
                      gridColumn: windowWidth <= 480 ? '1 / -1' : 'auto'
                    }}>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '10px' : '11px',
                        color: '#166534',
                        marginBottom: '2px'
                      }}>
                        Total with Delivery
                      </div>
                      <div style={{
                        fontSize: windowWidth <= 480 ? '14px' : '16px',
                        fontWeight: 'bold',
                        color: '#166534'
                      }}>
                        RM{userOrder.totalWithDelivery.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Verification Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth <= 768 
                ? (isFirstThreeUser ? 'repeat(2, 1fr)' : '1fr 1fr')
                : (isFirstThreeUser ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'),
              gap: '8px'
            }}>
              {/* Base Delivery Fee (Only for first 3 paid users OR unpaid users when system not active) */}
{(isFirstThreeUser || (!user.commitmentPaid && prebookUsers.filter(u => u.commitmentPaid).length < 3)) && (
  <button
    onClick={() => {
      if (user.receiptURL) {
        setSelectedImage(user.receiptURL);
      } else {
        alert('No base delivery fee payment photo available');
      }
    }}
    style={{
      backgroundColor: user.receiptURL ? '#dbeafe' : '#f3f4f6',
      border: `2px solid ${user.receiptURL ? '#3b82f6' : '#d1d5db'}`,
      borderRadius: '8px',
      padding: windowWidth <= 480 ? '10px' : '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      ...(windowWidth <= 768 && isFirstThreeUser ? { gridColumn: '1 / -1' } : {})
    }}
  >
    <Camera size={16} color={user.receiptURL ? '#3b82f6' : '#9ca3af'} />
    <span style={{
      fontSize: windowWidth <= 480 ? '10px' : '11px',
      fontWeight: '600',
      color: user.receiptURL ? '#1e40af' : '#6b7280',
      textAlign: 'center'
    }}>
      Base Fee (RM10)
    </span>
  </button>
)}

              {/* Order Receipt */}
              <button
                // Replace this onClick:
onClick={() => {
  const orderImages = userOrder?.orderImageURLs;
  if (orderImages && orderImages.length > 0) {
    if (orderImages.length === 1) {
      setSelectedImage(orderImages[0]);
    } else {
      setSelectedImages(orderImages);
      setShowImageCarousel(true);
    }
  } else {
    alert('No order receipt photo available');
  }
}}
                style={{
                  backgroundColor: (userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#fef3c7' : '#f3f4f6',
border: `2px solid ${(userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#f59e0b' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: windowWidth <= 480 ? '10px' : '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Image size={16} color={(userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#f59e0b' : '#9ca3af'} />
                <span style={{
                  fontSize: windowWidth <= 480 ? '10px' : '11px',
                  fontWeight: '600',
                  color: (userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) ? '#92400e' : '#6b7280',
                  textAlign: 'center'
                }}>
                  Order Receipt
                </span>
                {(userOrder?.orderImageURLs && userOrder.orderImageURLs.length > 0) && (
                  <span style={{
                    fontSize: '9px',
                    color: '#059669',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                  </span>
                )}
              </button>

              {/* Delivery Fee Payment */}
              <button
                onClick={() => {
  const deliveryPayment = userOrder?.paymentProofURL;
  if (deliveryPayment) {
    setSelectedImage(deliveryPayment);
  } else {
    alert('No delivery fee payment photo available');
  }
}}
                style={{
                  backgroundColor: userOrder?.paymentProofURL ? '#d1fae5' : '#f3f4f6',
border: `2px solid ${userOrder?.paymentProofURL ? '#10b981' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: windowWidth <= 480 ? '10px' : '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Camera size={16} color={userOrder?.paymentProofURL ? '#10b981' : '#9ca3af'} />
                <span style={{
                  fontSize: windowWidth <= 480 ? '10px' : '11px',
                  fontWeight: '600',
                  color: (userOrder?.deliveryPaymentPhoto || userOrder?.deliveryPayment || userOrder?.deliveryFeePhoto) ? '#065f46' : '#6b7280',
                  textAlign: 'center'
                }}>
                  Delivery Payment
                </span>
                {(userOrder?.deliveryPaymentPhoto || userOrder?.deliveryPayment || userOrder?.deliveryFeePhoto) && (
                  <span style={{
                    fontSize: '9px',
                    color: '#059669',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    VIEW
                  </span>
                )}
              </button>
            </div>

            {/* Summary Footer - FIXED CALCULATION */}
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: user.commitmentPaid ? '#f0fdf4' : '#fffbeb',
              borderRadius: '8px',
              border: `1px solid ${user.commitmentPaid ? '#bbf7d0' : '#fde68a'}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: windowWidth <= 480 ? '11px' : '12px',
                  fontWeight: '600',
                  color: user.commitmentPaid ? '#166534' : '#92400e'
                }}>
                  Total Paid to System:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
  <span style={{
  fontSize: windowWidth <= 480 ? '14px' : '16px',
  fontWeight: 'bold',
  color: user.commitmentPaid ? '#166534' : '#92400e'
}}>
  RM{(() => {
    let total = 0;
    // ✅ CHANGE: Use the same firstThreePaidUsers logic
    const isAmongFirstThreePaid = firstThreePaidUsers.some(paidUser => paidUser.firestoreId === user.firestoreId);
    if (isAmongFirstThreePaid) {
      total += 10; // Base delivery fee
    }
    if (userOrder?.deliveryFee) {
      total += userOrder.deliveryFee;
    }
    return total.toFixed(2);
  })()}
</span>
{(() => {
  const isAmongFirstThreePaid = firstThreePaidUsers.some(paidUser => paidUser.firestoreId === user.firestoreId);  
  return isAmongFirstThreePaid ? (
    <span style={{
      fontSize: windowWidth <= 480 ? '9px' : '10px',
      color: '#166534',
      fontWeight: '500',
      marginTop: '2px',
      textAlign: 'right'
    }}>
      (incl. RM10 base fee)
    </span>
  ) : null;
})()}
</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px',
      color: '#64748b'
    }}>
      <Camera size={56} style={{ marginBottom: '20px' }} />
      <p style={{ fontSize: '18px' }}>No registered users today.</p>
    </div>
  )}
</div>
          
          {/* Charts */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 768 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: windowWidth <= 480 ? '12px' : '20px', 
            marginBottom: '32px',
            width: '100%',
            overflow: 'hidden'
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
            gridTemplateColumns: windowWidth <= 480 
              ? 'repeat(2, 1fr)' 
              : windowWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '20px',
            marginBottom: windowWidth <= 480 ? '24px' : '32px' 
          }}>
            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <Users size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#3b82f6" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Registered</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>{getTotalHistoryStats().totalRegistered}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <Package size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#ef4444" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Orders</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>{getTotalHistoryStats().totalOrders}</p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <DollarSign size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#f59e0b" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Revenue</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>
                  RM{getTotalHistoryStats().totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            <div style={{
              ...styles.statCard,
              padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '24px',
              gap: windowWidth <= 480 ? '8px' : '12px'
            }}>
              <div style={{ 
                ...styles.statIcon, 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                width: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px',
                height: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : '56px'
              }}>
                <TrendingUp size={windowWidth <= 480 ? 16 : windowWidth <= 768 ? 20 : 28} color="#10b981" />
              </div>
              <div style={styles.statContent}>
                <p style={{
                  ...styles.statLabel,
                  fontSize: windowWidth <= 480 ? '10px' : '12px'
                }}>Total Profit</p>
                <p style={{
                  ...styles.statValue,
                  fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '20px' : '24px'
                }}>
                  RM{getTotalHistoryStats().totalProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* History Charts */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: windowWidth <= 768 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: windowWidth <= 480 ? '12px' : '20px', 
            marginBottom: '32px',
            width: '100%',
            overflow: 'hidden'
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
            gridTemplateColumns: windowWidth <= 768 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: windowWidth <= 480 ? '12px' : '20px', 
            marginBottom: '32px',
            width: '100%',
            overflow: 'hidden'
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
                  .slice(-6)
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
                  .slice(-6)
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
    {historyData
  .filter(entry => {
    // Only show entries for actual delivery days (1=Mon, 3=Wed, 5=Fri based on your schedule)
    const entryDate = new Date(entry.date + 'T00:00:00');
    const dayOfWeek = entryDate.getDay();
    return [2, 5].includes(dayOfWeek); // Adjust these numbers to match your DELIVERY_DAYS
  })
  .map((entry, index) => (
      <div key={index} style={{
        backgroundColor: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        position: 'relative'
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

        {/* Edit Button */}
        <button
          onClick={() => handleEditClick(entry)}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <Edit size={18} />
          Edit Data
        </button>
      </div>
    ))}
  </div>
)}
          </div>
        </>
      )}
      {showConfirmPopup && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '90%',
      width: '320px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
        Clear all saved sessions?
      </h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        This will log out all users. Are you sure?
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Confirm
        </button>
        <button
          onClick={() => setShowConfirmPopup(false)}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#334155',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
<EditHistoryModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      entry={editingEntry}
      onSave={handleSaveChanges}
      adminPasscode={'byyc'} // Your admin passcode
    />
    </div>
  );
};

export default AdminTab;