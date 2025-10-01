import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, MapPin, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon

const CountdownTimer = ({ 
  targetTime = "19:00", 
  currentOrder = null,
  onViewImage = null
}) => {
    const calculateTimeLeft = useCallback(() => {
        const now = new Date();
        const target = new Date();
        const [targetHour, targetMinute] = targetTime.split(':');
        target.setHours(parseInt(targetHour), parseInt(targetMinute), 0, 0);

        if (now > target) {
            return { hours: 0, minutes: 0, seconds: 0, isReady: true };
        }

        const diff = target - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return { hours, minutes, seconds, isReady: false };
    }, [targetTime]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    // NEW: Helper variable for checking images
    const orderImages = currentOrder?.orderImageURLs || [];

    return (
        <div style={{
            backgroundColor: '#fef3c7',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            margin: '20px 0',
            border: '2px solid #fbbf24',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
            <p style={{
                margin: '0 0 12px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                {timeLeft.isReady ? (
                    <><CheckCircle size={20} color="#059669" /> Estimated time for pickup!</>
                ) : (
                    <><Clock size={20} color="#dc2626" /> Time until pickup:</>
                )}
            </p>
            <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: timeLeft.isReady ? '#059669' : '#dc2626',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.025em',
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                marginBottom: '16px' // Added margin for spacing
            }}>
                {['hours', 'minutes', 'seconds'].map((unit) => (
                    <div key={unit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: '#fffbeb',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            minWidth: '60px',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            {String(timeLeft[unit]).padStart(2, '0')}
                        </div>
                        <span style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
                            {unit.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>

            {/* START: NEW IMAGE CAROUSEL/DISPLAY SECTION */}
            {orderImages.length > 0 && (
              <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '20px', 
                  borderTop: '1px dashed #fcd34d' 
              }}>
                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#92400e',
                }}>
                  Your Submitted Receipt{orderImages.length > 1 ? 's' : ''}
                </p>
                <div 
                  style={{ display: 'flex', justifyContent: 'center' }}
                  onClick={() => onViewImage && onViewImage(orderImages)}
                >
                  <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <img
                      src={orderImages[0]}
                      alt="Order Receipt"
                      style={{
                        width: '100px', 
                        height: '100px',
                        borderRadius: '12px', 
                        objectFit: 'cover',
                        border: '3px solid white', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    />
                    {orderImages.length > 1 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '2px solid white'
                      }}>
                        +{orderImages.length - 1}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    fontSize: '13px', 
                    color: '#b45309', 
                    marginTop: '8px',
                    fontWeight: '500'
                  }}>
                    <ImageIcon size={14} />
                    <span>Click to view</span>
                </div>
              </div>
            )}
            {/* END: NEW IMAGE CAROUSEL/DISPLAY SECTION */}

            {!timeLeft.isReady && (
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    <MapPin size={16} color="#64748b" />
                    Please arrive at the main gate by 7:00 PM
                </p>
            )}
        </div>
    );
};

export default CountdownTimer;