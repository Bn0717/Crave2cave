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


// --- NEW VENDOR DATA HELPER ---
// This object defines the look for each vendor tag.
// --- FINAL VENDOR DATA HELPER ---
const VENDOR_DATA = {
  dominos: { 
    name: "Domino's", 
    color: '#006491', 
    backgroundColor: '#E5F0F4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Domino%27s_pizza_logo.svg/240px-Domino%27s_pizza_logo.svg.png' 
  },
  mcdonalds: { 
    name: "McDonald's", 
    color: '#DA291C', 
    backgroundColor: '#FFDBCF',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/240px-McDonald%27s_Golden_Arches.svg.png'
  },
  mixue: { 
    name: 'Mixue', 
    color: '#D83131', 
    backgroundColor: '#F9EBEB',
    logoUrl: 'https://img.ws.mms.shopee.com.my/43b78294cf7b8f9e685f02c668b55633'
  },
  default: { 
    name: 'Unknown Store', 
    color: '#475569', 
    backgroundColor: '#F1F5F9',
    logoUrl: '' // No logo for unknown
  }
};

// --- NEW VENDOR TAG COMPONENT ---
// A reusable component to display the vendor for each order.
// It assumes an `order.vendor` field exists (e.g., 'dominos').
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
  const [deliveryStatus, setDeliveryStatus] = useState('pending'); // pending, in-progress, completed
  const [selectedOrders, setSelectedOrders] = useState([]);

  useEffect(() => {
    // This function will run whenever todayOrders changes.
    // It checks if there are ANY orders that are already in progress.
    const inProgressExists = todayOrders.some(order => order.status === 'in-progress');
    
    // If even one order is 'in-progress', we should consider the whole delivery batch as in progress.
    if (inProgressExists) {
      setDeliveryStatus('in-progress');
    } else {
      setDeliveryStatus('pending');
    }
  }, [todayOrders]); // The dependency array ensures this runs when data is fetched/refreshed

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
      padding: '10px 20px', // Smaller padding
      borderRadius: '12px', 
      fontWeight: '600', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: '15px', 
      transition: 'all 0.3s ease', 
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
      display: 'flex', // To align icon and text
      alignItems: 'center',
      gap: '8px'
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
    },
        orderCard: {
      backgroundColor: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '16px',
      transition: 'all 0.3s ease',
      display: 'flex',      // Use flexbox to create side-by-side columns
      gap: '16px',          // Add a gap between the left/right columns
      alignItems: 'stretch' // Make the columns equal height
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

    const handleStartDelivery = async () => {
    if (selectedOrders.length === 0) {
      showSuccessAnimation('No Orders Selected', 'Please select at least one order to start delivery.');
      return;
    }

    showLoadingAnimation(`Starting delivery for ${selectedOrders.length} orders...`);

    try {
      // This is where we call the Firebase service to update the database
      await firebaseService.updateOrdersStatus(selectedOrders, 'in-progress');
      
      hideLoadingAnimation();
      setDeliveryStatus('in-progress');
      await fetchAllData(); // Refresh data to reflect the change

      showSuccessAnimation(
        'Delivery Started!',
        `${selectedOrders.length} order(s) are now in progress. Customers will be notified automatically.`,
        null,
        3500
      );
    } catch (error) {
      hideLoadingAnimation();
      console.error("Error starting delivery:", error);
      showSuccessAnimation('Error', 'Could not start delivery. Please try again.', null, 3000);
    }
  };

  const handleCompleteDelivery = async () => {
    if (selectedOrders.length === 0) return;

    showLoadingAnimation('Completing deliveries...');

    try {
      // Use the same function to update status to 'delivered'
      await firebaseService.updateOrdersStatus(selectedOrders, 'delivered');
      
      hideLoadingAnimation();
      setDeliveryStatus('completed'); // You can set this to 'completed' temporarily
      setSelectedOrders([]); // Clear the selection
      await fetchAllData(); // Refresh the data
      
      showSuccessAnimation(
        'Deliveries Completed!',
        'All selected orders have been marked as delivered.',
        // ... success message JSX
      );
    } catch (error) {
      hideLoadingAnimation();
      console.error("Error completing delivery:", error);
      showSuccessAnimation(
        'Error',
        'Failed to update delivery status. Please try again.',
      );
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
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
        <AuthScreen title="Driver Dashboard" onAuth={onAuth} />
      </div>
    );
  }

  if (loadingUsers || loadingOrders) {
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
          Loading driver dashboard...
        </p>
      </div>
    );
  }

     const handleSelectAll = () => {
    // This is cleaner and safer, as every order is guaranteed to have a unique 'id'
    const allOrderIds = todayOrders.map(order => order.id);

    if (selectedOrders.length < todayOrders.length) {
      setSelectedOrders(allOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const stats = getDeliveryStats();

  return (
    <div>
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
            Driver Dashboard
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '16px' }}>
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
            }}>Total Orders</p>
            <p style={{
              ...styles.statValue,
              ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
            }}>{stats.totalOrders}</p>
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
            <Clock size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#f59e0b" />
          </div>
          <div style={styles.statContent}>
            <p style={{
              ...styles.statLabel,
              ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
            }}>Pending</p>
            <p style={{
              ...styles.statValue,
              ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
            }}>{stats.pendingOrders}</p>
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
            <CheckCircle2 size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <p style={{
              ...styles.statLabel,
              ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
            }}>Completed</p>
            <p style={{
              ...styles.statValue,
              ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
            }}>{stats.completedOrders}</p>
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
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            ...(windowWidth <= 768 ? {
              width: windowWidth <= 480 ? '40px' : '48px',
              height: windowWidth <= 480 ? '40px' : '48px',
            } : {})
          }}>
            <Truck size={windowWidth <= 480 ? 20 : windowWidth <= 768 ? 24 : 32} color="#3b82f6" />
          </div>
          <div style={styles.statContent}>
            <p style={{
              ...styles.statLabel,
              ...(windowWidth <= 480 ? { fontSize: '11px' } : {})
            }}>Delivery Fees</p>
            <p style={{
              ...styles.statValue,
              ...(windowWidth <= 480 ? { fontSize: '18px' } : {})
            }}>RM{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Pickup Time Countdown */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Clock color="#f59e0b" size={28} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Next Pickup Time</h3>
          <CountdownTimer targetTime="19:00" />
          <p style={{ marginTop: '12px', color: '#64748b' }}>
            🚚 Daily pickup at 7:00 PM
          </p>
        </div>
      </div>

      {/* Order Management */}
      {todayOrders.length > 0 ? (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Package color="#3b82f6" size={28} />
            <h2 style={styles.cardTitle}>Today's Orders</h2>
          </div>

          {/* Delivery Status Controls */}
                    {/* --- EDITED: Delivery Status Controls --- */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <p style={{ margin: '0', fontWeight: '600', color: '#1e293b' }}>
              Selected: {selectedOrders.length} / {todayOrders.length}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSelectAll}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                {selectedOrders.length < todayOrders.length ? 'Select All' : 'Deselect All'}
              </button>

              {deliveryStatus === 'pending' && (
                <button
                  onClick={handleStartDelivery}
                  disabled={selectedOrders.length === 0}
                  style={{
                    ...styles.button,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    opacity: selectedOrders.length === 0 ? 0.5 : 1,
                    cursor: selectedOrders.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Truck size={16} />
                  Start Delivery
                </button>
              )}

              {deliveryStatus === 'in-progress' && (
                <button
                  onClick={handleCompleteDelivery}
                  disabled={selectedOrders.length === 0}
                  style={{
                    ...styles.button,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    opacity: selectedOrders.length === 0 ? 0.5 : 1,
                    cursor: selectedOrders.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <CheckCircle2 size={16} />
                  Complete Delivery
                </button>
              )}
            </div>
          </div>

                    {/* --- FINAL, COMPACT & RESPONSIVE ORDERS GRID --- */}
          <div style={{
            display: 'grid',
            gap: '16px',
            // This creates a responsive grid. On desktop, cards form columns.
            // On mobile, they stack into a single, correctly-sized column.
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
          }}>
            {todayOrders.map((order) => {
              const vendorInfo = VENDOR_DATA[order.vendor?.toLowerCase()] || VENDOR_DATA.default;
              return (
                <div
                  key={order.id}
                  style={{
                    ...styles.orderCard,
                    ...(selectedOrders.includes(order.id) ? styles.orderCardSelected : {}),
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleOrderSelection(order.id)}
                >
                  {/* === Left Column (Flexible Width) === */}
                  {/* This column grows and shrinks. `minWidth: 0` is crucial to prevent overflow on mobile. */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                    
                    <VendorTag vendor={order.vendor} />

                    <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Order #{order.orderNumber}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '8px' }}>
                      <User size={16} color="#64748b" />
                      <div>
                        <p style={{ margin: 0, fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.userName}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{order.studentId}</p>
                      </div>
                    </div>

                    {/* This div pushes the total to the bottom, making the card look neat */}
                    <div style={{ flexGrow: 1 }}></div>

                    {/* --- Order Total on one line --- */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', backgroundColor: 'white', borderRadius: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>Order Total</span>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>RM{order.orderTotal}</span>
                    </div>

                  </div>

                  {/* === Right Column (Fixed Actions) === */}
                  {/* This column holds the checkbox and receipt and does not shrink. */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
                    
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        border: `2px solid ${selectedOrders.includes(order.id) ? '#3b82f6' : '#d1d5db'}`,
                        backgroundColor: selectedOrders.includes(order.id) ? '#3b82f6' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {selectedOrders.includes(order.id) && <Check size={16} color="white" />}
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
                          width: '70px', height: '70px',
                          borderRadius: '8px', objectFit: 'contain',
                          border: '2px solid #e2e8f0', padding: '4px', background: 'white',
                          display: (order.orderImageURL || vendorInfo.logoUrl) ? 'block' : 'none'
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        <Image size={12} />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            color: '#64748b'
          }}>
            <AlertCircle size={56} style={{ marginBottom: '20px' }} />
            <h3 style={{ marginBottom: '8px' }}>No Orders Today</h3>
            <p style={{ fontSize: '16px', margin: 0 }}>
              No delivery orders have been placed yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTab;