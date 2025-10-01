import React from 'react';
import { CheckCircle, QrCode } from 'lucide-react';
import qrImage from '../assets/Adminqr.jpg';

const UnifiedQRCodeDisplay = ({ amount, isCommitmentFee = false, userIndex = 0, registrationOrder = [], selectedUserId = '' }) => {
    const userOrder = registrationOrder.find(order => order.userId === selectedUserId);
    const isFourthUser = userOrder ? userOrder.order === 4 : userIndex === 3;
    const displayAmount = isCommitmentFee ? (isFourthUser ? 0 : 10) : amount;

    if (!isCommitmentFee && amount === 0) {
        return (
            <div style={{
                padding: window.innerWidth <= 480 ? '16px' : '24px',
                backgroundColor: '#f0fdf4',
                borderRadius: '16px',
                border: '2px solid #86efac',
                textAlign: 'center',
                marginBottom: '24px'
            }}>
                <CheckCircle color="#16a34a" size={window.innerWidth <= 480 ? 28 : 36} />
                <p style={{
                    margin: '12px 0 0 0',
                    fontWeight: '600',
                    color: '#166534',
                    fontSize: window.innerWidth <= 480 ? '15px' : '17px'
                }}>
                    No delivery fee for orders under RM50!
                </p>
                <p style={{
                    margin: '8px 0 0 0',
                    fontSize: window.innerWidth <= 480 ? '13px' : '15px',
                    color: '#166534'
                }}>
                    Please proceed to upload your order image.
                </p>
            </div>
        );
    }

    const getQRSize = () => {
        if (window.innerWidth <= 480) return '180px';
        if (window.innerWidth <= 768) return '200px';
        return '220px';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: window.innerWidth <= 480 ? '20px' : '32px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '20px',
            border: '2px solid #7dd3fc',
            marginBottom: '24px',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.1)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{
                fontSize: window.innerWidth <= 480 ? '16px' : '20px',
                fontWeight: 'bold',
                color: '#0369a1',
                marginBottom: window.innerWidth <= 480 ? '16px' : '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'center'
            }}>
                <QrCode size={window.innerWidth <= 480 ? 20 : 28} />
                {isCommitmentFee ? 'Commitment Fee Payment' : 'Delivery Fee Payment'}
            </div>
            <div style={{
                padding: window.innerWidth <= 480 ? '16px' : '20px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <img
                    src={qrImage}
                    alt="TNG Payment QR Code"
                    style={{
                        width: getQRSize(),
                        height: getQRSize(),
                        display: 'block',
                        objectFit: 'contain'
                    }}
                />
            </div>
{/*<a
    href={qrImage}
    download="TNG-Payment-QR.png"
    style={{
        // We use the exact same styles as your button
        marginTop: window.innerWidth <= 480 ? '12px' : '16px',
        padding: window.innerWidth <= 480 ? '10px 20px' : '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: window.innerWidth <= 480 ? '13px' : '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        // Add this line to remove the link underline
        textDecoration: 'none', 
        display: 'inline-block' // Ensures proper layout
    }}
    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
>
    💾 Download QR or Screenshot
</a>
*/}
<div style={{
    marginTop: window.innerWidth <= 480 ? '16px' : '20px',
    padding: window.innerWidth <= 480 ? '12px 24px' : '16px 32px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: window.innerWidth <= 480 ? '16px' : '20px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}>
                Amount: RM{displayAmount.toFixed(2)}
            </div>
        </div>
    );
};

export default UnifiedQRCodeDisplay;