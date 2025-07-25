import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AuthScreen = ({ title, onAuth, styles }) => {
    const [passcode, setPasscode] = React.useState('');
    const [showPasscode, setShowPasscode] = React.useState(false);

    const handleAuthentication = () => {
        onAuth(passcode);
    };

    return (
        <div style={styles.card}>
            <div style={styles.authContainer}>
                <Lock size={56} color="#64748b" style={{ marginBottom: '32px' }} />
                <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '28px' }}>{title}</h2>
                <p style={{ marginBottom: '32px', color: '#64748b', textAlign: 'center', fontSize: '16px' }}>
                    Enter the passcode to access {title.toLowerCase()}
                </p>
                <div style={{...styles.passcodeInput, ...styles.input}}>
                    <input
                        type={showPasscode ? 'text' : 'password'}
                        placeholder="Enter passcode"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        style={{width: '100%', border: 'none', background: 'transparent', outline: 'none'}}
                        onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        style={styles.toggleButton}
                    >
                        {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <button
                    onClick={handleAuthentication}
                    style={{
                        ...styles.button,
                        ...styles.buttonBlue,
                        width: '100%',
                        maxWidth: '320px'
                    }}
                >
                    Access {title}
                </button>
            </div>
        </div>
    );
};

export default AuthScreen;