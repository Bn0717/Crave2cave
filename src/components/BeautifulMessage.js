import React from 'react';
import { X } from 'lucide-react';

const BeautifulMessage = ({ type = 'info', title, message, icon, children, onClose }) => {
    const getMessageStyles = () => {
        switch (type) {
            case 'success':
                return {
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    border: '2px solid #10b981',
                    iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    iconColor: 'white',
                    textColor: '#047857'
                };
            case 'warning':
                return {
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #f59e0b',
                    iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    iconColor: 'white',
                    textColor: '#92400e'
                };
            case 'error':
                return {
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    border: '2px solid #ef4444',
                    iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    iconColor: 'white',
                    textColor: '#991b1b'
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '2px solid #3b82f6',
                    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    iconColor: 'white',
                    textColor: '#1e40af'
                };
        }
    };

    const messageStyles = getMessageStyles();

    return (
        <div style={{
            background: messageStyles.background,
            border: messageStyles.border,
            borderRadius: '20px',
            padding: window.innerWidth <= 480 ? '20px' : '28px',
            marginBottom: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none'
            }} />
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: window.innerWidth <= 480 ? '12px' : '16px'
            }}>
                {icon && (
                    <div style={{
                        width: window.innerWidth <= 480 ? '48px' : '56px',
                        height: window.innerWidth <= 480 ? '48px' : '56px',
                        borderRadius: '16px',
                        background: messageStyles.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}>
                        {React.cloneElement(icon, {
                            size: window.innerWidth <= 480 ? 24 : 28,
                            color: messageStyles.iconColor
                        })}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {title && (
                        <h4 style={{
                            margin: '0 0 8px 0',
                            fontSize: window.innerWidth <= 480 ? '16px' : '18px',
                            fontWeight: 'bold',
                            color: messageStyles.textColor
                        }}>
                            {title}
                        </h4>
                    )}
                    <p style={{
                        margin: '0 0 12px 0',
                        fontSize: window.innerWidth <= 375 ? '11px' : window.innerWidth <= 480 ? '13px' : '15px',
                        color: messageStyles.textColor,
                        lineHeight: '1.5'
                    }}>
                        {message}
                    </p>
                    {children}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: messageStyles.textColor,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default BeautifulMessage;