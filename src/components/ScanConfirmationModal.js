import React from 'react';
import { Scan, CheckCircle, X } from 'lucide-react';

const ScanConfirmationModal = ({ scannedData, onConfirm, orderImage, windowWidth }) => {
    const modalStyles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px'
        },
        modal: {
            backgroundColor: 'white', borderRadius: '20px', padding: windowWidth <= 480 ? '24px' : '32px',
            maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        },
        header: {
            fontSize: windowWidth <= 480 ? '20px' : '24px', fontWeight: 'bold', marginBottom: '20px',
            color: '#1e293b', textAlign: 'center'
        },
        dataSection: {
            backgroundColor: '#f8fafc', padding: windowWidth <= 480 ? '16px' : '20px',
            borderRadius: '12px', marginBottom: '20px'
        },
        dataRow: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: windowWidth <= 480 ? '10px 0' : '12px 0', borderBottom: '1px solid #e2e8f0', gap: '8px'
        },
        label: {
            fontWeight: '600', color: '#64748b', fontSize: windowWidth <= 768 ? '14px' : '16px', flexShrink: 0,
        },
        value: {
            fontWeight: 'bold', fontSize: windowWidth <= 768 ? '14px' : '18px', color: '#1e293b',
            textAlign: 'right', wordBreak: 'break-all',
        },
        imagePreview: {
            width: '100%', maxHeight: windowWidth <= 480 ? '150px' : '200px', objectFit: 'contain',
            borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0'
        },
        buttonGroup: {
            display: 'flex', gap: windowWidth <= 480 ? '8px' : '12px', marginTop: '24px',
            flexWrap: windowWidth <= 360 ? 'wrap' : 'nowrap'
        },
        button: {
            flex: windowWidth <= 360 ? '1 1 100%' : 1, padding: windowWidth <= 480 ? '10px 16px' : '14px 24px',
            borderRadius: '10px', border: 'none', fontSize: windowWidth <= 768 ? '14px' : '16px',
            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap'
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <h3 style={modalStyles.header}>
                    <Scan size={windowWidth <= 480 ? 24 : 28} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Confirm Scanned Details
                </h3>
                {orderImage && (
                    <img src={URL.createObjectURL(orderImage)} alt="Scanned receipt" style={modalStyles.imagePreview} />
                )}
                <div style={modalStyles.dataSection}>
                    <div style={modalStyles.dataRow}>
                        <span style={modalStyles.label}>{windowWidth <= 360 ? 'Order #:' : 'Order Number:'}</span>
                        <span style={modalStyles.value} title={scannedData.orderNumber}>{scannedData.orderNumber}</span>
                    </div>
                    <div style={{ ...modalStyles.dataRow, borderBottom: 'none' }}>
                        <span style={modalStyles.label}>{windowWidth <= 360 ? 'Total:' : 'Order Total:'}</span>
                        <span style={modalStyles.value}>RM {scannedData.orderTotal}</span>
                    </div>
                </div>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px', fontSize: windowWidth <= 768 ? '14px' : '15px' }}>
                    Are these details correct?
                </p>
                <div style={modalStyles.buttonGroup}>
                    <button onClick={() => onConfirm(true)} style={{ ...modalStyles.button, backgroundColor: '#10b981', color: 'white' }}>
                        <CheckCircle size={windowWidth <= 480 ? 16 : 18} style={{ flexShrink: 0 }} />
                        <span>{windowWidth <= 360 ? 'Yes' : 'Yes, Correct'}</span>
                    </button>
                    <button onClick={() => onConfirm(false)} style={{ ...modalStyles.button, backgroundColor: '#ef4444', color: 'white' }}>
                        <X size={windowWidth <= 480 ? 16 : 18} style={{ flexShrink: 0 }} />
                        <span>{windowWidth <= 360 ? 'No' : 'No, Re-enter'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScanConfirmationModal;