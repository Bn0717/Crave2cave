import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  History, 
  Loader2, 
  AlertCircle,
  UserCheck
} from 'lucide-react';

import AuthScreen from './AuthScreen';
import ResponsiveTable from './ResponsiveTable';
import SimpleChart from './SimpleChart';
import { isToday } from '../utils/isToday';

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
  resetAuth
}) => {
  const [showHistory, setShowHistory] = useState(false);

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

  const getTotalHistoryStats = () => {
    const totalRegistered = historyData.reduce((sum, entry) => sum + (entry.registeredUsers || 0), 0);
    const totalRevenue = historyData.reduce((sum, entry) => sum + (entry.totalRevenue || 0), 0);
    const totalProfit = historyData.reduce((sum, entry) => sum + (entry.profit || 0), 0);
    const totalOrders = historyData.reduce((sum, entry) => sum + (entry.totalOrders || 0), 0);
    
    const todayString = new Date().toISOString().split('T')[0];
    const todayInHistory = historyData.some(entry => entry.date === todayString);
    
    if (!todayInHistory && todayUsers.length > 0) {
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
                <History size={20} /> View History
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
                }}>{todayUsers.filter(u => isToday(u.timestamp)).length}</p>
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
              <h2 style={styles.cardTitle}>Awaiting Order Submission</h2>
            </div>
            
            {todayUsers.filter(user => user.commitmentPaid && !user.orderSubmitted).length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gap: '12px', 
                marginTop: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
              }}>
                {todayUsers.filter(user => user.commitmentPaid && !user.orderSubmitted).map(user => (
                  <div key={user.id} style={{ 
                    padding: '12px', 
                    backgroundColor: '#fffbeb', 
                    border: '1px solid #fef3c7', 
                    borderRadius: '8px' 
                  }}>
                    <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>{user.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#b45309' }}>{user.studentId}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ marginTop: '20px', color: '#64748b', textAlign: 'center' }}>
                All paid users have submitted their orders for today.
              </p>
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
                headers={['Order #', 'Photo', 'Customer', 'Student ID', 'Order Total', 
                'Delivery Fee', 'Total', 'Time']}
                onImageClick={(imageUrl) => setSelectedImage(imageUrl)}
                data={todayOrders.map((order, index) => [
                    order.orderNumber,
                    { type: 'image', value: order.orderImageURL }, 
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
                {historyData.map((entry, index) => (
                  <div key={index} style={{
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
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
  );
};

export default AdminTab;