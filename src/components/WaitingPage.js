import React, { useState } from 'react';
import { CheckCircle, MapPin, Camera, X } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import ImageModal from './ImageModal';

const WaitingPage = ({ onClose, currentOrder }) => {
    const [showImage, setShowImage] = useState(false);

    const styles = {
        container: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px',
            textAlign: 'center',
            overflowY: 'auto'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: '48px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            maxWidth: '520px',
            width: '100%',
            position: 'relative',
            animation: 'slideUp 0.5s ease-out'
        },
        closeButton: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
            marginBottom: '12px'
        },
        locationInfo: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#f0f9ff',
            padding: '12px 24px',
            borderRadius: '12px',
            margin: '20px 0',
            border: '1px solid #bfdbfe'
        },
        orderBox: {
            padding: '24px',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            backgroundColor: '#f8fafc',
            margin: '24px 0',
            textAlign: 'left'
        },
        orderHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
        },
        orderGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
        },
        orderLabel: {
            margin: '0',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500'
        },
        orderValue: {
            margin: '0',
            fontWeight: '600',
            fontSize: '16px'
        },
        viewPhotoButton: {
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            width: '100%',
            marginTop: '16px',
        },
        message: {
            fontSize: '16px',
            color: '#64748b',
            lineHeight: '1.6',
            margin: '24px 0'
        },
        button: {
            padding: '16px 40px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button style={styles.closeButton} onClick={onClose}>
                    <X size={24} color="#64748b" />
                </button>
                <div style={styles.iconContainer}>
                    <CheckCircle size={48} color="white" strokeWidth={3} />
                </div>
                <h2 style={styles.title}>Your Order is Being Prepared</h2>
                <CountdownTimer targetTime="19:00" />
                <div style={styles.locationInfo}>
                    <MapPin size={20} color="#3b82f6" />
                    <span style={{ fontWeight: '600', color: '#1e40af' }}>
                        Pickup Location: Main Gate
                    </span>
                </div>
                {currentOrder && (
                    <div style={styles.orderBox}>
                        <div style={styles.orderHeader}>
                            <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                                Your Order Details
                            </h4>
                            <span style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                {currentOrder.orderNumber}
                            </span>
                        </div>
                        <div style={styles.orderGrid}>
                            <div>
                                <p style={styles.orderLabel}>Order Total</p>
                                <p style={{ ...styles.orderValue, color: '#059669' }}>
                                    RM{currentOrder.orderTotal}
                                </p>
                            </div>
                            <div>
                                <p style={styles.orderLabel}>Delivery Fee</p>
                                <p style={styles.orderValue}>
                                    RM{currentOrder.deliveryFee}
                                </p>
                            </div>
                            <div>
                                <p style={styles.orderLabel}>Total Amount</p>
                                <p style={{ ...styles.orderValue, color: '#dc2626' }}>
                                    RM{currentOrder.totalWithDelivery}
                                </p>
                            </div>
                            <div>
                                <p style={styles.orderLabel}>Student ID</p>
                                <p style={styles.orderValue}>{currentOrder.studentId}</p>
                            </div>
                        </div>
                        {currentOrder.orderImageURL && (
                            <button onClick={() => setShowImage(true)} style={styles.viewPhotoButton}>
                                <Camera size={20} />
                                View Order Photo
                            </button>
                        )}
                    </div>
                )}
                <p style={styles.message}>
                    Please arrive at the main gate by 7:00 PM to receive your order
                </p>
                <button style={styles.button} onClick={onClose}>
                    Close
                </button>
            </div>
            {showImage && currentOrder?.orderImageURL && (
                <ImageModal
                    imageUrl={currentOrder.orderImageURL}
                    onClose={() => setShowImage(false)}
                />
            )}
        </div>
    );
};

export default WaitingPage;