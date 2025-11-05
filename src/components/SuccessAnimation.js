import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessAnimation = ({ title, message, additionalInfo, duration = 2000, showOkButton = true, onClose, link = null }) => {
    const [visible, setVisible] = useState(true);
    
    const handleClose = React.useCallback(() => {
        setVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 500);
    }, [onClose]);
   
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(handleClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, handleClose]);
    
    const successStyles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '16px',
            backdropFilter: 'blur(8px)', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease-in-out'
        },
        modal: {
            backgroundColor: 'white', borderRadius: '24px', padding: '32px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
            transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            maxWidth: '420px', width: '100%', animation: visible ? 'modalSlideIn 0.5s ease-out' : 'none'
        },
        iconContainer: {
            width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px',
            animation: 'successPulse 0.8s ease-out', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
        },
        title: {
            fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px',
            animation: 'slideInUp 0.6s ease-out 0.2s both'
        },
        message: {
            fontSize: '16px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6',
            animation: 'slideInUp 0.6s ease-out 0.3s both'
        },
        link: {
            display: 'inline-block',
            marginTop: '12px',
            marginBottom: '12px',
            color: '#25D366',
            textDecoration: 'underline',
            fontWeight: '500',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
        },
        button: {
            padding: '12px 32px', backgroundColor: '#3b82f6', color: 'white', border: 'none',
            borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        }
    };
    
    return (
        <div style={successStyles.overlay}>
            <div style={successStyles.modal}>
                <div style={successStyles.iconContainer}>
                    <CheckCircle size={48} color="white" strokeWidth={3} />
                </div>
                <h2 style={successStyles.title}>{title}</h2>
                <p style={successStyles.message}>{message}</p>
                {link && (
                    <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={successStyles.link}
                        onMouseEnter={(e) => e.target.style.color = '#128C7E'}
                        onMouseLeave={(e) => e.target.style.color = '#25D366'}
                    >
                        📱 {link.text}
                    </a>
                )}
                {additionalInfo && <div style={{ marginBottom: '24px' }}>{additionalInfo}</div>}
                {showOkButton && <button onClick={handleClose} style={successStyles.button}>OK</button>}
            </div>
        </div>
    );
};

export default SuccessAnimation;