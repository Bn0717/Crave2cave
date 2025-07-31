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
  Image
} from 'lucide-react';

import AuthScreen from './AuthScreen';
import ResponsiveTable from './ResponsiveTable';
import CountdownTimer from './CountdownTimer';

const VENDOR_DATA = {
  dominos: { name: "Domino's", color: '#006491', backgroundColor: '#E5F0F4' },
  mcdonalds: { name: "McDonald's", color: '#f1af20ff', backgroundColor: '#FFDBCF' },
  mixue: { name: 'Mixue', color: '#ef0a0aff', backgroundColor: '#F9EBEB' },
  default: { name: 'Unknown Store', color: '#475569', backgroundColor: '#F1F5F9', logoUrl: '' }
};


const nextPickup = new Date();
nextPickup.setHours(19, 0, 0, 0);
if (nextPickup < new Date()) nextPickup.setDate(nextPickup.getDate() + 1);
const pickupTimeString = "19:00";
const pickupDateTime = nextPickup.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  timeZone: 'Asia/Kuala_Lumpur'
});

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
  hideLoadingAnimation
}) => {
  const [deliveryStatus, setDeliveryStatus] = useState('pending');
  const [selectedOrders, setSelectedOrders] = useState([]);

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
    const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    return { totalOrders, completedOrders, pendingOrders, totalRevenue };
  };

  // Replace your handleStartDelivery function in DriverTab.jsx with this updated version:

const handleStartDelivery = async () => {
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
        if (order.userEmail && order.userEmail !== "no-email@crave2cave.com") {
          return await firebaseService.sendDeliveryEmail(
            order.userId, 
            order.orderNumber, 
            order.userEmail
          );
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
    
    await fetchAllData();
    
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
      await fetchAllData();
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
      Today's Deliveries - {new Date().toLocaleDateString()}
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

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Clock color="#f59e0b" size={28} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Next Pickup Time</h3>
          <CountdownTimer targetTime="19:00" />
          <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
  📅 {pickupDateTime}<br/>
  🚚 Pickup at 7:00 PM (Location: [Your pickup location])
</p>
        </div>
      </div>

      {todayOrders.length > 0 ? (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Package color="#3b82f6" size={28} />
            <h2 style={styles.cardTitle}>Today's Orders</h2>
          </div>

          <div style={{
      backgroundColor: '#f8fafc',
      padding: windowWidth <= 480 ? '12px' : '16px 20px',
      borderRadius: '12px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: windowWidth <= 480 ? '12px' : '16px'
    }}>
      {/* Selection Counter */}
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
        
        {/* Mobile: Show total selected orders count as badge */}
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

      {/* Buttons Section */}
      <div style={{
        display: 'flex',
        flexDirection: windowWidth <= 480 ? 'column' : 'row',
        gap: windowWidth <= 480 ? '8px' : '12px',
        alignItems: windowWidth <= 480 ? 'stretch' : 'center',
        justifyContent: windowWidth <= 480 ? 'stretch' : 'flex-end'
      }}>
        
        {/* Selection Buttons Row */}
        <div style={{
  display: 'flex',
  gap: windowWidth <= 480 ? '6px' : '8px',
  flexWrap: windowWidth <= 480 ? 'wrap' : 'wrap',  // ← CHANGE THIS LINE
  flex: windowWidth <= 480 ? '1' : 'none',
  overflowX: 'visible',  // ← CHANGE THIS LINE
  paddingBottom: windowWidth <= 480 ? '2px' : '0'
}}>
          
          {/* Select All Button */}
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

          {/* Vendor Selection Buttons */}
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

        {/* Action Buttons */}
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

      {/* Mobile: Additional info row */}
      {windowWidth <= 480 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#64748b'
        }}>
          {selectedOrders.length > 0 && (
            <span style={{ color: '#3b82f6', fontWeight: '600' }}>
              Ready to {deliveryStatus === 'pending' ? 'start' : 'complete'}
            </span>
          )}
        </div>
      )}
    </div>
    {/* ⬆️ END OF NEW MOBILE-RESPONSIVE VERSION ⬆️ */}

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
          {vendorInfo.logoUrl && (
            <img
              src={vendorInfo.logoUrl}
              alt={vendorInfo.name}
              style={{
                width: windowWidth <= 480 ? '32px' : '40px',
                height: windowWidth <= 480 ? '32px' : '40px',
                borderRadius: '8px',
                objectFit: 'contain'
              }}
            />
          )}
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
          gap: windowWidth <= 480 ? '12px' : '16px',
          gridTemplateColumns: windowWidth <= 480 ? '1fr' : windowWidth <= 768 ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(auto-fit, minmax(320px, 1fr))'
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
                      {order.studentId}
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
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end', 
                flexShrink: 0,
                gap: '8px'
              }}>
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
                <div
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(order.orderImageURL || vendorInfo.logoUrl);
                  }}
                >
                  <img
                    src={order.orderImageURL || vendorInfo.logoUrl}
                    alt={order.orderImageURL ? "Receipt" : "Vendor Logo"}
                    style={{
                      width: windowWidth <= 480 ? '50px' : '70px', 
                      height: windowWidth <= 480 ? '50px' : '70px',
                      borderRadius: '8px', 
                      objectFit: 'contain',
                      border: '2px solid #e2e8f0', 
                      padding: '4px', 
                      background: 'white',
                      display: (order.orderImageURL || vendorInfo.logoUrl) ? 'block' : 'none'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '4px', 
                    fontSize: windowWidth <= 480 ? '9px' : '11px', 
                    color: '#64748b', 
                    marginTop: '4px' 
                  }}>
                    <Image size={windowWidth <= 480 ? 10 : 12} />
                    <span>View</span>
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