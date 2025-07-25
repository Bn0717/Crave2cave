import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingAnimation = ({ message = "Processing..." }) => {
    const loadingStyles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
        },
        container: {
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxWidth: '320px',
            width: '90%'
        },
        spinner: {
            width: '64px',
            height: '64px',
            margin: '0 auto 24px',
            animation: 'spin 1s linear infinite'
        },
        message: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
        },
        dots: {
            display: 'flex',
            justifyContent: 'center',
            gap: '8px'
        },
        dot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: 'bounce 1.4s infinite ease-in-out'
        }
    };

    return (
        <div style={loadingStyles.overlay}>
            <div style={loadingStyles.container}>
                <div style={loadingStyles.spinner}>
                    <Loader2 size={64} color="#3b82f6" />
                </div>
                <h3 style={loadingStyles.message}>{message}</h3>
                <div style={loadingStyles.dots}>
                    <div style={{ ...loadingStyles.dot, animationDelay: '-0.32s' }}></div>
                    <div style={{ ...loadingStyles.dot, animationDelay: '-0.16s' }}></div>
                    <div style={loadingStyles.dot}></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingAnimation;