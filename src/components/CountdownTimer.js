import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, MapPin } from 'lucide-react';

const CountdownTimer = ({ 
  targetTime = "19:15", 
  currentOrder = null,  // ADD THIS
  onViewImage = null    // ADD THIS
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
                gap: '4px'
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
                    Please arrive at the main gate by 7:15 PM
                </p>
            )}
        </div>
    );
};

export default CountdownTimer;