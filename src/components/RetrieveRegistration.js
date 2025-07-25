import React, { useState } from 'react';
import { Search } from 'lucide-react';

const RetrieveRegistration = ({ onRetrieve, isVisible, onToggle, windowWidth }) => {
    const [retrieveName, setRetrieveName] = useState('');
    const [retrieveId, setRetrieveId] = useState('');
    const [retrieveNameError, setRetrieveNameError] = useState('');
    const [retrieveIdError, setRetrieveIdError] = useState('');

    const isSmallScreen = windowWidth <= 480;
    const isMediumScreen = windowWidth <= 768;

    const validateRetrieveName = (name) => {
        if (!name.trim()) {
            setRetrieveNameError('Name is required');
            return false;
        }
        if (name.trim().split(' ').length < 2) {
            setRetrieveNameError('Please enter your full name (first and last name)');
            return false;
        }
        setRetrieveNameError('');
        return true;
    };

    const validateRetrieveId = (id) => {
        if (!id.trim()) {
            setRetrieveIdError('Student ID is required');
            return false;
        }
        if (id.length < 4) {
            setRetrieveIdError('Student ID must be at least 4 characters');
            return false;
        }
        if (!/\d{4}\/\d{2}$/.test(id)) {
            setRetrieveIdError('Student ID format should be like 0469/24');
            return false;
        }
        setRetrieveIdError('');
        return true;
    };

    const handleRetrieve = () => {
        const isNameValid = validateRetrieveName(retrieveName);
        const isIdValid = validateRetrieveId(retrieveId);
        if (isNameValid && isIdValid) {
            onRetrieve(retrieveName.trim(), retrieveId.trim());
        }
    };

    const handleReset = () => {
        setRetrieveName('');
        setRetrieveId('');
        setRetrieveNameError('');
        setRetrieveIdError('');
    };

    const styles = {
        container: {
            backgroundColor: '#f0f9ff',
            border: '2px solid #3b82f6',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px',
            transition: 'all 0.3s ease'
        },
        toggleButton: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: isSmallScreen ? '12px' : isMediumScreen ? '14px' : '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: isSmallScreen ? '13px' : isMediumScreen ? '14px' : '15px',
            fontWeight: '600',
            transition: 'all 0.2s',
        },
        content: {
            padding: isVisible ? (isSmallScreen ? '16px' : isMediumScreen ? '20px' : '24px') : '0',
            maxHeight: isVisible ? '400px' : '0',
            opacity: isVisible ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        },
        title: {
            fontSize: isSmallScreen ? '16px' : '18px',
            fontWeight: 'bold',
            color: '#1e40af',
            marginBottom: '12px'
        },
        input: {
            width: '100%',
            padding: isSmallScreen ? '12px 14px' : '14px 18px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: isSmallScreen ? '14px' : '15px',
            boxSizing: 'border-box',
            transition: 'all 0.2s',
        },
        inputError: { borderColor: '#ef4444' },
        errorText: {
            color: '#ef4444',
            fontSize: '13px',
            marginTop: '-12px',
            marginBottom: '12px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            marginTop: '20px'
        },
        button: {
            flex: 1,
            padding: isSmallScreen ? '12px 16px' : '14px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: isSmallScreen ? '14px' : '15px',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        },
        primaryButton: {
            backgroundColor: '#059669',
            color: 'white',
        },
        secondaryButton: {
            backgroundColor: '#6b7280',
            color: 'white',
        }
    };

    return (
        <div style={styles.container}>
            <button onClick={onToggle} style={styles.toggleButton}>
                <Search size={isSmallScreen ? 16 : 18} />
                {isVisible ? 'Hide' : 'Already Registered? Retrieve Your Registration'}
            </button>
            <div style={styles.content}>
                <h3 style={styles.title}>Retrieve Your Registration</h3>
                <p style={{
                    color: '#6b7280',
                    fontSize: isSmallScreen ? '13px' : '14px',
                    marginBottom: '20px'
                }}>
                    Enter your name and student ID to continue where you left off.
                </p>
                <input
                    type="text"
                    placeholder="Enter your full name (Bryan Ngu)"
                    value={retrieveName}
                    onChange={(e) => {
                        setRetrieveName(e.target.value);
                        validateRetrieveName(e.target.value);
                    }}
                    style={{ ...styles.input, ...(retrieveNameError && styles.inputError) }}
                />
                {retrieveNameError && <p style={styles.errorText}>{retrieveNameError}</p>}
                <input
                    type="text"
                    placeholder="Enter your student ID (0469/24)"
                    value={retrieveId}
                    onChange={(e) => {
                        setRetrieveId(e.target.value);
                        validateRetrieveId(e.target.value);
                    }}
                    style={{ ...styles.input, ...(retrieveIdError && styles.inputError) }}
                />
                {retrieveIdError && <p style={styles.errorText}>{retrieveIdError}</p>}
                <div style={styles.buttonGroup}>
                    <button onClick={handleRetrieve} style={{ ...styles.button, ...styles.primaryButton }}>
                        Retrieve Registration
                    </button>
                    <button onClick={handleReset} style={{ ...styles.button, ...styles.secondaryButton }}>
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RetrieveRegistration;