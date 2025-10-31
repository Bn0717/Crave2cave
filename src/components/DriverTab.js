import React, { useState, useEffect } from 'react';
import * as firebaseService from '../services/firebase';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Package, 
  User, 
  Phone, 
  AlertCircle,
  Loader2,
  Navigation as NavigationIcon,
  Check,
  Image,
  Clock3,
  Store,
} from 'lucide-react';

import AuthScreen from './AuthScreen';
import ResponsiveTable from './ResponsiveTable';
import CountdownTimer from './CountdownTimer';

const VENDOR_DATA = {
  dominos: { name: "Domino's", color: '#006491', backgroundColor: '#E5F0F4' },
  ayam_gepuk: { name: "Ayam Gepuk Pak Gembus", color: '#f1af20ff', backgroundColor: '#FFDBCF' },
  mixue: { name: 'Mixue', color: '#ef0a0aff', backgroundColor: '#F9EBEB' },
  family_mart: { name: 'Family Mart', color: '#004c97', backgroundColor: '#E0F2FE' },
  default: { name: 'Unknown Store', color: '#475569', backgroundColor: '#F1F5F9', logoUrl: '' }
};

const VendorTag = ({ vendor }) => {
  const style = VENDOR_DATA[vendor?.toLowerCase()] || VENDOR_DATA.default;
  return (
    <div style={{
      padding: '4px 10px',
      borderRadius: '999px',
      backgroundColor: style.backgroundColor,
      color: style.color,
      fontSize: '11px',
      fontWeight: 'bold',
      display: 'inline-block',
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    }}>
      {style.name}
    </div>
  );
};

const DriverTab = ({
  prebookUsers,
  todayOrders,
  todayUsers,
  loadingUsers,
  loadingOrders,
  windowWidth,
  setSelectedImage,
  isAuthenticated,
  onAuth,
  resetAuth,
  fetchAllData,
  showSuccessAnimation,
  showLoadingAnimation,
  hideLoadingAnimation,
  setShowImageCarousel,
  setSelectedImages,
  systemAvailability,
}) => {
  const [deliveryStatus, setDeliveryStatus] = useState('pending');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [collapsedVendors, setCollapsedVendors] = useState([]);

  const toggleVendorCollapse = (vendorKey) => {
  setCollapsedVendors(prev =>
    prev.includes(vendorKey)
      ? prev.filter(v => v !== vendorKey)
      : [...prev, vendorKey]
  );
};

  useEffect(() => {
  const pendingExists = todayOrders.some(order => order.status === 'pending');
  const allDelivered = todayOrders.length > 0 && todayOrders.every(order => order.status === 'delivered');
  
  if (allDelivered) {
    setDeliveryStatus('completed');
  } else if (pendingExists) {
    setDeliveryStatus('pending'); // Keep showing start button as long as there are pending orders
  } else {
    setDeliveryStatus('in-progress'); // Only when no pending orders left
  }
}, [todayOrders]);

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
      padding: '10px 20px',
      borderRadius: '12px', 
      fontWeight: '600', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: '15px', 
      transition: 'all 0.3s ease', 
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statCard: { 
  backgroundColor: 'white', 
  padding: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '16px' : '28px', 
  borderRadius: windowWidth <= 480 ? '12px' : '16px', 
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
  display: 'flex', 
  alignItems: 'center', 
  gap: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '20px', 
  transition: 'all 0.3s ease', 
  cursor: 'pointer', 
  border: '1px solid #f1f5f9',
  minHeight: windowWidth <= 480 ? '80px' : 'auto'
},
    statIcon: { 
  width: windowWidth <= 480 ? '36px' : windowWidth <= 768 ? '48px' : '64px', 
  height: windowWidth <= 480 ? '36px' : windowWidth <= 768 ? '48px' : '64px', 
  borderRadius: windowWidth <= 480 ? '8px' : '16px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  flexShrink: 0 
},
statContent: { flex: 1, minWidth: 0 },
statLabel: { 
  fontSize: windowWidth <= 480 ? '11px' : windowWidth <= 768 ? '12px' : '14px', 
  color: '#64748b', 
  marginBottom: '2px', 
  fontWeight: '500' 
},
statValue: { 
  fontSize: windowWidth <= 480 ? '18px' : windowWidth <= 768 ? '22px' : '28px', 
  fontWeight: 'bold', 
  color: '#1e293b', 
  lineHeight: '1.2' 
},
    orderCard: {
      backgroundColor: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '16px',
      transition: 'all 0.3s ease',
      display: 'flex',
      gap: '16px',
      alignItems: 'stretch'
    },
    orderCardSelected: {
      backgroundColor: '#f0f9ff',
      borderColor: '#3b82f6',
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)'
    }
  };

  const getDeliveryStats = () => {
    const totalOrders = todayOrders.length;
    const completedOrders = todayOrders.filter(order => order.status === 'delivered').length;
    const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;
    const totalRevenue = 30;
    return { totalOrders, completedOrders, pendingOrders, totalRevenue };
  };

  // Replace your handleStartDelivery function in DriverTab.jsx with this updated version:

const handleStartDelivery = async () => {
  // ✅ ADD THIS CHECK FIRST - Before anything else
  const todayString = new Date().toLocaleDateString('en-CA', { timeZone: "Asia/Kuala_Lumpur" });
  const deliveryDateString = systemAvailability.deliveryDate;
  
  if (todayString !== deliveryDateString) {
    const deliveryDateFormatted = new Date(deliveryDateString + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    showSuccessAnimation(
      'Not Delivery Day',
      `Today is not the scheduled delivery day. Deliveries can only be started on ${deliveryDateFormatted}.`,
      null,
      0,
      true
    );
    return;
  }
  
  if (selectedOrders.length === 0) {
    showSuccessAnimation('No Orders Selected', 'Please select at least one order to start delivery.');
    return;
  }

  showLoadingAnimation(`Starting delivery for ${selectedOrders.length} orders...`);
  
  try {
    // Only process orders that are actually pending
    const ordersToUpdate = todayOrders.filter(order => 
      selectedOrders.includes(order.id) && order.status === 'pending'
    );
    
    if (ordersToUpdate.length === 0) {
      hideLoadingAnimation();
      showSuccessAnimation('No Valid Orders', 'Selected orders are already in progress or delivered.');
      return;
    }
    
    // First, update the order status
    await firebaseService.updateOrdersStatus(ordersToUpdate.map(o => o.id), 'in-progress');
    
    // Then try to send emails (but don't fail if this doesn't work)
    const emailResults = await Promise.allSettled(
      ordersToUpdate.map(async (order) => {
        // Find the corresponding user data from prebookUsers
        const userData = prebookUsers.find(user => user.firestoreId === order.userId);
        const userEmail = userData?.email || order.userEmail;
        
        console.log(`Processing order ${order.orderNumber}:`, {
          userId: order.userId,
          userEmail: userEmail,
          orderNumber: order.orderNumber,
          orderTotal: order.orderTotal,
          studentName: order.userName || userData?.name
        });
        
        if (userEmail && userEmail !== "no-email@crave2cave.com") {
          console.log('🔍 About to call sendDeliveryEmail with:', {
  userId: order.userId,
  userEmail: userEmail,
  orderNumber: order.orderNumber,
  orderTotal: order.orderTotal,
  studentName: order.userName || userData?.name || 'Student'
});

          return await firebaseService.sendDeliveryEmail({
            userId: order.userId,
            userEmail: userEmail,
            orderNumber: order.orderNumber,
            orderTotal: order.orderTotal,
            studentName: order.userName || userData?.name || 'Student'
          });
        } else {
          console.log(`Skipping email for order ${order.orderNumber} - no valid email`);
          return { success: false, message: 'No email provided' };
        }
      })
    );

    // Count successful emails
    const successfulEmails = emailResults.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failedEmails = emailResults.length - successfulEmails;

    hideLoadingAnimation();
    
    // Clear selection of orders that were just started
    setSelectedOrders(prev => prev.filter(id => !ordersToUpdate.map(o => o.id).includes(id)));
    
    // Show success message with email status
    let emailStatusMessage = '';
    if (successfulEmails > 0 && failedEmails === 0) {
      emailStatusMessage = ` All customers have been notified via email.`;
    } else if (successfulEmails > 0 && failedEmails > 0) {
      emailStatusMessage = ` ${successfulEmails} customers notified via email, ${failedEmails} email(s) failed.`;
    } else if (failedEmails > 0) {
      emailStatusMessage = ` Note: Email notifications could not be sent.`;
    }

    showSuccessAnimation(
      'Delivery Started!',
      `${ordersToUpdate.length} order(s) are now in progress.${emailStatusMessage}`,
      null,
      4000
    );
    
  } catch (error) {
    hideLoadingAnimation();
    console.error('Error starting delivery:', error);
    showSuccessAnimation(
      'Error', 
      `Could not start delivery: ${error.message}`, 
      null, 
      3000
    );
  }
};

  const handleCompleteDelivery = async () => {
    if (selectedOrders.length === 0) return;

    showLoadingAnimation('Completing deliveries...');
    try {
      await firebaseService.updateOrdersStatus(selectedOrders, 'delivered');
      hideLoadingAnimation();
      setDeliveryStatus('completed');
      setSelectedOrders([]);
      showSuccessAnimation(
        'Deliveries Completed!',
        'All selected orders have been marked as delivered.',
        null,
        3500
      );
    } catch (error) {
      hideLoadingAnimation();
      console.error('Error completing delivery:', error);
      showSuccessAnimation(
        'Error',
        'Failed to update delivery status. Please try again.',
        null,
        3000
      );
    }
  };

  const toggleOrderSelection = (orderId) => {
  // Find the order to check its status
  const order = todayOrders.find(o => o.id === orderId);
  
  // Don't allow selection if order is in-progress or delivered
  if (order && (order.status === 'in-progress' || order.status === 'delivered')) {
    return;
  }
  
  setSelectedOrders(prev => 
    prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
  );
};

  const getUniqueVendors = () => {
  const vendors = [...new Set(todayOrders.map(order => order.vendor?.toLowerCase()).filter(Boolean))];
  return vendors.map(vendor => ({
    key: vendor,
    name: VENDOR_DATA[vendor]?.name || vendor
  }));
};

const handleSelectByVendor = (vendorKey) => {
  // Only include orders that are 'pending' (not in-progress or delivered)
  const vendorOrders = todayOrders
    .filter(order => 
      order.vendor?.toLowerCase() === vendorKey && 
      order.status === 'pending'
    )
    .map(order => order.id);
  
  const allVendorOrdersSelected = vendorOrders.every(id => selectedOrders.includes(id));
  
  if (allVendorOrdersSelected) {
    setSelectedOrders(prev => prev.filter(id => !vendorOrders.includes(id)));
  } else {
    setSelectedOrders(prev => [...new Set([...prev, ...vendorOrders])]);
  }
};

const getOrdersByVendor = () => {
  const grouped = {};
  todayOrders.forEach(order => {
    const vendor = order.vendor?.toLowerCase() || 'unknown';
    if (!grouped[vendor]) {
      grouped[vendor] = [];
    }
    grouped[vendor].push(order);
  });
  return grouped;
};

  const handleSelectAll = () => {
  // Only include pending orders
  const pendingOrderIds = todayOrders
    .filter(order => order.status === 'pending')
    .map(order => order.id);
  
  setSelectedOrders(prev => prev.length === pendingOrderIds.length ? [] : pendingOrderIds);
};

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <AuthScreen title="Driver Dashboard" onAuth={onAuth} />
      </div>
    );
  }

  if (loadingUsers || loadingOrders) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '20px', marginBottom: '32px' }}>
        <Loader2 size={56} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '24px', color: '#64748b', fontSize: '18px' }}>
          Loading driver dashboard...
        </p>
      </div>
    );
  }

  const stats = getDeliveryStats();

  return (
    <div>
      <div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: windowWidth <= 480 ? '16px' : '32px', 
  flexWrap: 'wrap', 
  gap: '16px' 
}}>
  <div>
  <h2 style={{ 
    margin: 0, 
    fontSize: windowWidth <= 480 ? '24px' : windowWidth <= 768 ? '28px' : '32px', 
    color: '#1e293b' 
  }}>
    Driver Dashboard
  </h2>
  <p style={{ 
    margin: '8px 0 0 0', 
    color: '#64748b', 
    fontSize: windowWidth <= 480 ? '14px' : '16px' 
  }}>
    Delivery for: {new Date(systemAvailability.deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })}
  </p>
</div>
        <div style={{ display: 'flex', gap: '12px' }}>
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

      <div style={{ 
  display: 'grid', 
  gridTemplateColumns: windowWidth <= 480 ? '1fr 1fr' : windowWidth <= 768 ? '1fr 1fr' : 'repeat(4, 1fr)', 
  gap: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '24px',
  marginBottom: windowWidth <= 480 ? '16px' : '24px' 
}}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
            <Package size={32} color="#ef4444" />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Orders</p>
            <p style={styles.statValue}>{stats.totalOrders}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
            <Clock size={32} color="#f59e0b" />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Pending</p>
            <p style={styles.statValue}>{stats.pendingOrders}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>
            <CheckCircle2 size={32} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Completed</p>
            <p style={styles.statValue}>{stats.completedOrders}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
            <Truck size={32} color="#3b82f6" />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Delivery Fees</p>
            <p style={styles.statValue}>RM{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

{todayOrders.length > 0 ? (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <Package color="#3b82f6" size={28} />
      <h2 style={styles.cardTitle}>Today's Orders</h2>
    </div>

    {/* Pickup Information Card */}
    <div style={{
      backgroundColor: '#f0f9ff',
      border: '2px solid #0ea5e9',
      borderRadius: '16px',
      padding: windowWidth <= 480 ? '16px' : '20px',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <MapPin color="#0ea5e9" size={24} />
        <h3 style={{
          margin: 0,
          fontSize: windowWidth <= 480 ? '16px' : '18px',
          color: '#0c4a6e',
          fontWeight: '600'
        }}>
          Pickup Information
        </h3>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr 1fr',
        gap: '16px'
      }}>
                {/* Pickup Details */}
        <div style={{
          backgroundColor: 'white',
          padding: windowWidth <= 480 ? '12px' : '16px', // Reduced padding on mobile
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock3 size={16} color="#0ea5e9" />
            <span style={{ fontWeight: '600', color: '#0c4a6e' }}>Pickup Schedule</span>
          </div>

          {/* This wrapper makes the timer smaller and centered */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '4px 0',
            transform: windowWidth <= 480 ? 'scale(0.75)' : 'scale(0.85)' // Smaller scale on mobile
          }}>
          </div>

          {/* More compact date and time text */}
          <div>
  <p style={{ 
      margin: '2px 0', 
      fontSize: '13px', 
      color: '#1e293b',
      fontWeight: 'bold'
  }}>
      📅 {new Date(systemAvailability.deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
  </p>
  <p style={{ 
      margin: '2px 0', 
      fontSize: '13px', 
      color: '#1e293b',
      fontWeight: 'bold'
  }}>
      🕕 6:10 PM
  </p>
</div>
        </div>
        {/* Vendor Summary */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Store size={16} color="#0ea5e9" />
            <span style={{ fontWeight: '600', color: '#0c4a6e' }}>Pickup Locations</span>
          </div>
          {getUniqueVendors().map(vendor => {
            const vendorOrderCount = todayOrders.filter(order => 
              order.vendor?.toLowerCase() === vendor.key
            ).length;
            const vendorInfo = VENDOR_DATA[vendor.key] || VENDOR_DATA.default;
            
            return (
              <div key={vendor.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: vendorInfo.color
                  }} />
                  <span style={{ fontSize: '14px', color: '#1e293b' }}>
                    {vendorInfo.name}
                  </span>
                </div>
                <span style={{
                  backgroundColor: vendorInfo.backgroundColor,
                  color: vendorInfo.color,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {vendorOrderCount} order{vendorOrderCount !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Selection Controls */}
    <div style={{
      backgroundColor: '#f8fafc',
      padding: windowWidth <= 480 ? '12px' : '16px 20px',
      borderRadius: '12px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: windowWidth <= 480 ? '12px' : '16px'
    }}>
      {/* Rest of your existing selection controls code remains the same */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <p style={{ 
          margin: '0', 
          fontWeight: '600', 
          color: '#1e293b',
          fontSize: windowWidth <= 480 ? '14px' : '16px'
        }}>
          Selected: {selectedOrders.length} / {todayOrders.length}
        </p>
        
        {windowWidth <= 480 && selectedOrders.length > 0 && (
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {selectedOrders.length} selected
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: windowWidth <= 480 ? 'column' : 'row',
        gap: windowWidth <= 480 ? '8px' : '12px',
        alignItems: windowWidth <= 480 ? 'stretch' : 'center',
        justifyContent: windowWidth <= 480 ? 'stretch' : 'flex-end'
      }}>
        
        <div style={{
          display: 'flex',
          gap: windowWidth <= 480 ? '6px' : '8px',
          flexWrap: windowWidth <= 480 ? 'wrap' : 'wrap',
          flex: windowWidth <= 480 ? '1' : 'none',
          overflowX: 'visible',
          paddingBottom: windowWidth <= 480 ? '2px' : '0'
        }}>
          
          <button
            onClick={handleSelectAll}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontWeight: '600',
              padding: windowWidth <= 480 ? '8px 12px' : '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: windowWidth <= 480 ? '12px' : '13px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {selectedOrders.length < todayOrders.length ? 'All' : 'None'}
          </button>

          {getUniqueVendors().map(vendor => {
            const vendorOrders = todayOrders.filter(order => 
              order.vendor?.toLowerCase() === vendor.key
            );
            const selectedCount = vendorOrders.filter(order => 
              selectedOrders.includes(order.id)
            ).length;
            
            return (
              <button
                key={vendor.key}
                onClick={() => handleSelectByVendor(vendor.key)}
                style={{
                  background: selectedCount === vendorOrders.length && selectedCount > 0 
                    ? '#e0f2fe' 
                    : '#ffffff',
                  border: selectedCount === vendorOrders.length && selectedCount > 0 
                    ? '1px solid #0284c7' 
                    : '1px solid #cbd5e1',
                  color: selectedCount === vendorOrders.length && selectedCount > 0 
                    ? '#0284c7' 
                    : '#475569',
                  fontWeight: '600',
                  padding: windowWidth <= 480 ? '8px 10px' : '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: windowWidth <= 480 ? '11px' : '13px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{windowWidth <= 480 ? vendor.name.substring(0, 8) : vendor.name}</span>
                {selectedCount > 0 && (
                  <span style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    minWidth: '16px',
                    textAlign: 'center'
                  }}>
                    {selectedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          gap: windowWidth <= 480 ? '8px' : '12px',
          flexShrink: 0,
          width: windowWidth <= 480 ? '100%' : 'auto'
        }}>
          {deliveryStatus === 'pending' && (
            <button
              onClick={handleStartDelivery}
              disabled={selectedOrders.length === 0}
              style={{
                ...styles.button,
                background: selectedOrders.length === 0 
                  ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                cursor: selectedOrders.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: windowWidth <= 480 ? '14px' : '13px',
                padding: windowWidth <= 480 ? '12px 16px' : '8px 16px',
                flex: windowWidth <= 480 ? '1' : 'none',
                justifyContent: 'center'
              }}
            >
              <Truck size={windowWidth <= 480 ? 18 : 16} />
              {windowWidth <= 480 ? 'Start' : 'Start Delivery'}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Enhanced Orders Display */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {Object.entries(getOrdersByVendor()).map(([vendorKey, orders]) => {
        const vendorInfo = VENDOR_DATA[vendorKey] || VENDOR_DATA.default;
        return (
          <div key={vendorKey} style={{
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            padding: windowWidth <= 480 ? '12px' : '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: windowWidth <= 480 ? '16px' : '18px',
                  fontWeight: '700',
                  color: vendorInfo.color
                }}>
                  {vendorInfo.name}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div style={{
  display: 'grid',
  gap: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '16px',
  gridTemplateColumns: windowWidth <= 480 ? '1fr' : 
                      windowWidth <= 768 ? '1fr' : 
                      windowWidth <= 1024 ? 'repeat(auto-fit, minmax(300px, 1fr))' : 
                      'repeat(auto-fit, minmax(350px, 1fr))',
  width: '100%',
  maxWidth: '100%'
}}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    ...styles.orderCard,
                    ...(selectedOrders.includes(order.id) ? styles.orderCardSelected : {}),
                    cursor: order.status === 'pending' ? 'pointer' : 'not-allowed',
                    opacity: order.status === 'pending' ? 1 : 0.6,
                    ...(order.status !== 'pending' ? { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' } : {}),
                    padding: windowWidth <= 480 ? '12px' : '16px',
                    gap: windowWidth <= 480 ? '12px' : '16px'
                  }}
                  onClick={() => order.status === 'pending' && toggleOrderSelection(order.id)}
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: windowWidth <= 480 ? '8px' : '12px', minWidth: 0 }}>
                    <VendorTag vendor={order.vendor} />
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: windowWidth <= 480 ? '14px' : '16px', 
                      color: '#1e293b', 
                      fontWeight: '600', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      Order #{order.orderNumber}
                    </h4>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: windowWidth <= 480 ? '6px' : '8px', 
                      backgroundColor: 'white', 
                      borderRadius: '8px' 
                    }}>
                      <User size={windowWidth <= 480 ? 14 : 16} color="#64748b" />
                      <div>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: '500', 
                          fontSize: windowWidth <= 480 ? '12px' : '14px', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {order.userName}
                        </p>
                        <p style={{ 
                          margin: 0, 
                          fontSize: windowWidth <= 480 ? '10px' : '12px', 
                          color: '#64748b' 
                        }}>
                          {order.contactNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: windowWidth <= 480 ? '8px 6px' : '10px 8px', 
                      backgroundColor: 'white', 
                      borderRadius: '8px' 
                    }}>
                      <span style={{ 
                        color: '#64748b', 
                        fontSize: windowWidth <= 480 ? '11px' : '13px', 
                        fontWeight: '500' 
                      }}>
                        Order Total:
                      </span>
                      <span style={{ 
                        fontWeight: 'bold', 
                        fontSize: windowWidth <= 480 ? '14px' : '16px' 
                      }}>
                        RM{order.orderTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Right Side with Receipt */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-end', 
                    flexShrink: 0,
                    gap: '8px',
                    minWidth: windowWidth <= 480 ? '80px' : '100px'
                  }}>
                    {/* Selection Checkbox */}
                    <div style={{
                      width: windowWidth <= 480 ? '20px' : '24px', 
                      height: windowWidth <= 480 ? '20px' : '24px', 
                      borderRadius: '6px',
                      border: `2px solid ${selectedOrders.includes(order.id) ? '#3b82f6' : '#d1d5db'}`,
                      backgroundColor: selectedOrders.includes(order.id) ? '#3b82f6' : 'transparent',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      {selectedOrders.includes(order.id) && <Check size={windowWidth <= 480 ? 12 : 16} color="white" />}
                    </div>

                    {/* Enhanced Receipt Display */}
                    <div
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(order.orderImageURL);
                      }}
                    >
                      {(order.orderImageURLs && order.orderImageURLs.length > 0) || order.orderImageURL ? (
  <div style={{ position: 'relative' }}>
    <img
      src={order.orderImageURLs?.[0] || order.orderImageURL}
      alt="Order Receipt"
      style={{
        width: windowWidth <= 480 ? '60px' : '80px', 
        height: windowWidth <= 480 ? '60px' : '80px',
        borderRadius: '12px', 
        objectFit: 'cover',
        border: '3px solid #e2e8f0', 
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
      // Replace this onClick:
onClick={(e) => {
  e.stopPropagation();
  const orderImages = order.orderImageURLs;
  if (orderImages && orderImages.length > 0) {
    if (orderImages.length === 1) {
      setSelectedImage(orderImages[0]);
    } else {
      setSelectedImages(orderImages);
      setShowImageCarousel(true);
    }
  } else if (order.orderImageURL) {
    setSelectedImage(order.orderImageURL);
  }
}}
    />
    {order.orderImageURLs && order.orderImageURLs.length > 1 && (
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 'bold',
        border: '2px solid white'
      }}>
        +{order.orderImageURLs.length - 1}
      </div>
    )}
                        </div>
                      ) : (
                        <div style={{
                          width: windowWidth <= 480 ? '60px' : '80px', 
                          height: windowWidth <= 480 ? '60px' : '80px',
                          borderRadius: '12px',
                          border: '2px dashed #cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8fafc'
                        }}>
                          <Image size={windowWidth <= 480 ? 20 : 24} color="#94a3b8" />
                          <span style={{
                            fontSize: '10px',
                            color: '#94a3b8',
                            fontWeight: '500',
                            marginTop: '4px'
                          }}>
                            No Receipt
                          </span>
                        </div>
                      )}
                      
                      <div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '4px', 
  fontSize: windowWidth <= 480 ? '9px' : '11px', 
  color: (order.orderImageURLs && order.orderImageURLs.length > 0) || order.orderImageURL ? '#3b82f6' : '#94a3b8', 
  marginTop: '6px',
  fontWeight: '600'
}}>
  <Image size={windowWidth <= 480 ? 10 : 12} />
  <span>
  {(order.orderImageURLs && order.orderImageURLs.length > 0) || order.orderImageURL 
    ? `View ${order.orderImageURLs?.length > 1 ? `${order.orderImageURLs.length} Receipts` : 'Receipt'}` 
    : 'No Receipt'
  }
</span>
</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
) : (
  // No orders message remains the same
  <div style={styles.card}>
    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
      <AlertCircle size={56} style={{ marginBottom: '20px' }} />
      <h3 style={{ marginBottom: '8px' }}>No Orders Today</h3>
      <p style={{ fontSize: '16px', margin: 0 }}>No delivery orders have been placed yet.</p>
    </div>
  </div>
)}
    </div>
  );
};

export default DriverTab;