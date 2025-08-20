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
            justifyContent: 'flex-start', // Changed from 'center'
            alignItems: 'center',
            zIndex: 2000,
            padding: '12px', // Reduced from 20px
            paddingTop: 'clamp(12px, 3vh, 40px)', // Add responsive top padding
            paddingBottom: 'clamp(12px, 3vh, 40px)', // Add responsive bottom padding
            textAlign: 'center',
            overflowY: 'auto'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: 'clamp(16px, 4vw, 32px)', // Responsive border radius
            padding: 'clamp(24px, 6vw, 48px)', // Responsive padding
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            maxWidth: '520px',
            width: '100%',
            position: 'relative',
            animation: 'slideUp 0.5s ease-out',
            // Remove mobile-specific height restrictions to allow natural flow
            minHeight: 'auto',
            margin: 'auto 0' // Center vertically when content is short
        },
        closeButton: {
            position: 'absolute',
            top: 'clamp(12px, 3vw, 20px)', // Responsive positioning
            right: 'clamp(12px, 3vw, 20px)',
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: 'clamp(32px, 8vw, 40px)', // Responsive size
            height: 'clamp(32px, 8vw, 40px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        iconContainer: {
            width: 'clamp(64px, 15vw, 88px)', // Responsive icon container
            height: 'clamp(64px, 15vw, 88px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto clamp(16px, 4vw, 24px)',
            animation: 'successPulse 0.8s ease-out',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
        },
        title: {
            fontSize: 'clamp(20px, 5vw, 28px)', // Responsive font size
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            lineHeight: '1.2' // Better line height for mobile
        },
        locationInfo: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#f0f9ff',
            padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)', // Responsive padding
            borderRadius: 'clamp(8px, 2vw, 12px)',
            margin: 'clamp(16px, 4vw, 20px) 0',
            border: '1px solid #bfdbfe',
            fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font size
            flexWrap: 'wrap' // Allow wrapping on very small screens
        },
        orderBox: {
            padding: 'clamp(16px, 4vw, 24px)', // Responsive padding
            border: '2px solid #e2e8f0',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            backgroundColor: '#f8fafc',
            margin: 'clamp(16px, 4vw, 24px) 0',
            textAlign: 'left'
        },
        orderHeader: {
    display: 'flex',
    flexDirection: 'column', // ✅ Stack vertically on small screens
    alignItems: 'center',     // ✅ Center contents horizontally
    gap: '8px',
    marginBottom: 'clamp(12px, 3vw, 16px)',
    textAlign: 'center'       // ✅ Make text center-aligned for good look
},

        orderGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', // Reduced min width
            gap: 'clamp(8px, 2vw, 12px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            // Add mobile-specific grid behavior
            '@media (max-width: 480px)': {
                gridTemplateColumns: '1fr 1fr' // Force 2 columns on mobile
            }
        },
        orderLabel: {
            margin: '0',
            color: '#64748b',
            fontSize: 'clamp(12px, 3vw, 14px)', // Responsive font size
            fontWeight: '500',
            marginBottom: '4px'
        },
        orderValue: {
            margin: '0',
            fontWeight: '600',
            fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font size
            wordBreak: 'break-word' // Prevent overflow on long values
        },
        orderTitle: {
            margin: 0, 
            fontSize: 'clamp(16px, 4vw, 18px)', // Responsive font size
            color: '#1e293b',
            flex: '1',
            minWidth: '0' // Allow shrinking
        },
        orderNumber: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: 'clamp(4px, 1vw, 6px) clamp(12px, 3vw, 16px)',
    borderRadius: 'clamp(6px, 1.5vw, 8px)',
    fontSize: 'clamp(12px, 3vw, 14px)',
    fontWeight: '600',
    wordBreak: 'break-all',         // ✅ allow long string to break
    overflowWrap: 'break-word',     // ✅ allow long strings to wrap
    whiteSpace: 'normal',           // ❌ remove nowrap to allow wrapping
    maxWidth: '100%',               // ✅ prevent stretching outside container
    display: 'inline-block'         // ✅ allows maxWidth and wrapping
},

        viewPhotoButton: {
            padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)', // Responsive padding
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            cursor: 'pointer',
            fontSize: 'clamp(13px, 3.5vw, 15px)', // Responsive font size
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            width: '100%',
            marginTop: 'clamp(12px, 3vw, 16px)',
        },
        message: {
            fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font size
            color: '#64748b',
            lineHeight: '1.6',
            margin: 'clamp(16px, 4vw, 24px) 0',
            padding: '0 clamp(8px, 2vw, 0)' // Add side padding on mobile
        },
        button: {
            padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 40px)', // Responsive padding
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            cursor: 'pointer',
            fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font size
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
            width: '100%', // Full width on mobile
            maxWidth: '200px' // But not too wide on desktop
        }
    };

    // Add media query styles using a style tag
    const mediaQueryStyles = `
        @media (max-width: 480px) {
            .order-grid-mobile {
                grid-template-columns: 1fr 1fr !important;
            }
            .location-info-mobile {
                flex-direction: column;
                text-align: center;
            }
            .location-info-mobile span {
                margin-top: 4px;
            }
        }
        
        @media (max-width: 360px) {
            .order-grid-mobile {
                grid-template-columns: 1fr !important;
            }
        }
    `;

    return (
        <>
            <style>{mediaQueryStyles}</style>
            <div style={styles.container}>
                <div style={styles.card}>
                    <button style={styles.closeButton} onClick={onClose}>
                        <X size={window.innerWidth < 480 ? 20 : 24} color="#64748b" />
                    </button>
                    <div style={styles.iconContainer}>
                        <CheckCircle 
                            size={window.innerWidth < 480 ? 36 : 48} 
                            color="white" 
                            strokeWidth={3} 
                        />
                    </div>
                    <h2 style={styles.title}>Your Order is Being Prepared</h2>
                    <CountdownTimer targetTime="19:15" />
                    <div 
                        style={styles.locationInfo} 
                        className={window.innerWidth < 480 ? "location-info-mobile" : ""}
                    >
                        <MapPin size={window.innerWidth < 480 ? 18 : 20} color="#3b82f6" />
                        <span style={{ 
                            fontWeight: '600', 
                            color: '#1e40af',
                            fontSize: 'clamp(14px, 3.5vw, 16px)'
                        }}>
                            Pickup Location: KY Main Gate
                        </span>
                    </div>
                    {currentOrder && (
                        <div style={styles.orderBox}>
                            <div style={styles.orderHeader}>
                                <h4 style={styles.orderTitle}>
                                    Your Order Details
                                </h4>
                                <span style={styles.orderNumber}>
                                    {currentOrder.orderNumber}
                                </span>
                            </div>
                            <div 
                                style={{
                                    ...styles.orderGrid,
                                    gridTemplateColumns: window.innerWidth < 480 
                                        ? (window.innerWidth < 360 ? '1fr' : '1fr 1fr')
                                        : 'repeat(auto-fit, minmax(120px, 1fr))'
                                }}
                                className="order-grid-mobile"
                            >
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
                            {currentOrder.orderImageURLs && currentOrder.orderImageURLs.length > 0 && (
                                <button onClick={() => setShowImage(true)} style={styles.viewPhotoButton}>
                                    <Camera size={window.innerWidth < 480 ? 18 : 20} />
                                    View Order Photo
                                </button>
                            )}
                        </div>
                    )}
                    <p style={styles.message}>
                        Please arrive at the KY main gate at around 7:00 PM to receive your order
                    </p>
                    <button style={styles.button} onClick={onClose}>
                        Close
                    </button>
                </div>
                {showImage && currentOrder?.orderImageURLs && currentOrder.orderImageURLs.length > 0 && (
    <ImageModal
        imageUrl={currentOrder.orderImageURLs[0]} // Show first image, or you can track which one to show
        onClose={() => setShowImage(false)}
    />
)}
            </div>
        </>
    );
};

export default WaitingPage;