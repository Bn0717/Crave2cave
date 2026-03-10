import React, { useState } from 'react';
import { CheckCircle, MapPin, Camera, X } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import ImageModal from './ImageModal';

const WaitingPage = ({ 
    onClose, 
    currentOrder, 
    setSelectedImage, 
    setShowImageCarousel, 
    setSelectedImages 
}) => {
    const [showImage, setShowImage] = useState(false);

    const styles = {
        container: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            zIndex: 2000,
            padding: '12px',
            paddingTop: 'clamp(12px, 3vh, 40px)',
            paddingBottom: 'clamp(12px, 3vh, 40px)',
            textAlign: 'center',
            overflowY: 'auto'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: 'clamp(16px, 4vw, 32px)',
            padding: 'clamp(24px, 6vw, 48px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            maxWidth: '520px',
            width: '100%',
            position: 'relative',
            animation: 'slideUp 0.5s ease-out',
            minHeight: 'auto',
            margin: 'auto 0'
        },
        closeButton: {
            position: 'absolute',
            top: 'clamp(12px, 3vw, 20px)',
            right: 'clamp(12px, 3vw, 20px)',
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: 'clamp(32px, 8vw, 40px)',
            height: 'clamp(32px, 8vw, 40px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        iconContainer: {
            width: 'clamp(64px, 15vw, 88px)',
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
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            lineHeight: '1.2'
        },
        locationInfo: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#f0f9ff',
            padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            margin: 'clamp(16px, 4vw, 20px) 0',
            border: '1px solid #bfdbfe',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            flexWrap: 'wrap'
        },
        orderBox: {
            padding: 'clamp(16px, 4vw, 24px)',
            border: '2px solid #e2e8f0',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            backgroundColor: '#f8fafc',
            margin: 'clamp(16px, 4vw, 24px) 0',
            textAlign: 'left'
        },
        orderHeader: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            textAlign: 'center'
        },
        orderGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'clamp(8px, 2vw, 12px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            '@media (max-width: 480px)': {
                gridTemplateColumns: '1fr 1fr'
            }
        },
        orderLabel: {
            margin: '0',
            color: '#64748b',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '500',
            marginBottom: '4px'
        },
        orderValue: {
            margin: '0',
            fontWeight: '600',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            wordBreak: 'break-word'
        },
        orderTitle: {
            margin: 0, 
            fontSize: 'clamp(16px, 4vw, 18px)',
            color: '#1e293b',
            flex: '1',
            minWidth: '0'
        },
        orderNumber: {
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: 'clamp(4px, 1vw, 6px) clamp(12px, 3vw, 16px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            maxWidth: '100%',
            display: 'inline-block'
        },
        viewPhotoButton: {
            padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            cursor: 'pointer',
            fontSize: 'clamp(13px, 3.5vw, 15px)',
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
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: '#64748b',
            lineHeight: '1.6',
            margin: 'clamp(16px, 4vw, 24px) 0',
            padding: '0 clamp(8px, 2vw, 0)'
        },
        button: {
            padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 40px)',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            cursor: 'pointer',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
            width: '100%',
            maxWidth: '200px'
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

    // Handle view photo button click - same logic as AdminTab
    const handleViewPhoto = () => {
        const orderImages = currentOrder?.orderImageURLs;
        if (orderImages && orderImages.length > 0) {
            if (orderImages.length === 1) {
                // Single image - use existing ImageModal
                setSelectedImage(orderImages[0]);
            } else {
                // Multiple images - use carousel
                setSelectedImages(orderImages);
                setShowImageCarousel(true);
            }
        } else {
            alert('No order receipt photo available');
        }
    };

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

{/* NEW: Delivery Date Display */}
{currentOrder?.deliveryDate && (
    <div style={{
        backgroundColor: '#eef2ff',
        padding: 'clamp(12px, 3vw, 16px)',
        borderRadius: 'clamp(8px, 2vw, 12px)',
        margin: 'clamp(12px, 3vw, 16px) 0',
        border: '2px solid #c7d2fe',
    }}>
        <p style={{
            margin: 0,
            fontSize: 'clamp(13px, 3.5vw, 15px)',
            color: '#4338ca',
            fontWeight: '600'
        }}>
            Delivery Date: {new Date(currentOrder.deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })}
        </p>
    </div>
)}

<CountdownTimer 
    targetTime="19:00" 
    deliveryDate={currentOrder?.deliveryDate}
    currentOrder={currentOrder}
    // The onViewImage prop has been removed to hide the receipt button inside the timer.
/>

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
    <p style={styles.orderLabel}>Contact Number</p>
    <p style={styles.orderValue}>{currentOrder.contactNumber}</p>
</div>
                            </div>
                            {currentOrder.orderImageURLs && currentOrder.orderImageURLs.length > 0 && (
                                <button 
                                    onClick={handleViewPhoto} 
                                    style={styles.viewPhotoButton}
                                >
                                    <Camera size={window.innerWidth < 480 ? 18 : 20} />
                                    View Order Photo{currentOrder.orderImageURLs.length > 1 ? 's' : ''}
                                    {currentOrder.orderImageURLs.length > 1 && (
                                        <span style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: 'clamp(11px, 3vw, 12px)',
                                            marginLeft: '4px'
                                        }}>
                                            {currentOrder.orderImageURLs.length}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                    <p style={styles.message}>
    Please wait for the admin to update in the group before picking up your order. (Around 7:30 PM)
</p>
<p style={{ ...styles.message, fontWeight: 'bold' }}>
    (Check your spam email for the confirmation email)
</p>

{/* NEW: WhatsApp Group Link */}
<a 
    href="https://chat.whatsapp.com/CUZ0DJ698Sp2A5vTxzwZ3I" 
    target="_blank" 
    rel="noopener noreferrer"
    style={{
        display: 'block',
        padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 28px)',
        backgroundColor: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: 'clamp(8px, 2vw, 12px)',
        textDecoration: 'none',
        fontSize: 'clamp(14px, 3.5vw, 16px)',
        fontWeight: '600',
        margin: 'clamp(16px, 4vw, 20px) auto',
        width: '100%',
        maxWidth: '300px',
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
        transition: 'all 0.2s ease'
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1faa52'}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
>
    📱 Join WhatsApp Group for Live Updates
</a>

<button style={styles.button} onClick={onClose}>
    Close
</button>
                </div>
                {showImage && currentOrder?.orderImageURLs && currentOrder.orderImageURLs.length > 0 && (
                    <ImageModal
                        imageUrl={currentOrder.orderImageURLs[0]}
                        onClose={() => setShowImage(false)}
                    />
                )}
            </div>
        </>
    );
};

export default WaitingPage;