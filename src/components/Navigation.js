import React, { useState } from 'react';
import { Users, Truck, BarChart3, Menu, X } from 'lucide-react';
import logo from '../assets/logo(1).png';

const Navigation = ({ activeTab, setActiveTab, setIsAuthenticated }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navStyles = {
        navbar: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            transition: 'all 0.3s ease'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: '#1f2937',
            cursor: 'pointer'
        },
        logoImage: {
            height: '70px',
            width: 'auto',
            objectFit: 'contain',
            maxWidth: '200px',
        },
        logoText: {
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        },
        mobileMenuButton: {
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            color: '#1f2937',
        },
        mobileMenu: {
            position: 'fixed',
            top: '70px',
            right: 0,
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            animation: isMobileMenuOpen ? 'slideDown 0.3s ease' : 'none',
            borderRadius: '0 0 0 20px',
            minWidth: '250px'
        },
        mobileMenuItem: {
            display: 'block',
            width: '100%',
            padding: '16px',
            marginBottom: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            textAlign: 'left',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }
    };

    const handleLogoClick = () => {
        setActiveTab('student');
        setIsAuthenticated(false);
        setIsMobileMenuOpen(false);
    };

    // This inline style is a workaround for media queries in JS
    const logoImageStyle = { ...navStyles.logoImage, ...(window.innerWidth <= 480 && { height: '45px', maxWidth: '150px' }) };
    const logoTextStyle = { ...navStyles.logoText, ...(window.innerWidth <= 480 && { display: 'none' }) };

    return (
        <>
            <nav style={navStyles.navbar}>
                <div style={navStyles.container}>
                    <div style={navStyles.logo} onClick={handleLogoClick}>
                        <img src={logo} alt="Crave 2 Cave" style={logoImageStyle} />
                        <span style={logoTextStyle}>Crave 2 Cave</span>
                    </div>
                    <button
                        style={navStyles.mobileMenuButton}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>
            {isMobileMenuOpen && (
                <div style={navStyles.mobileMenu}>
                    <button onClick={() => { setActiveTab('student'); setIsAuthenticated(false); setIsMobileMenuOpen(false); }} style={{ ...navStyles.mobileMenuItem, backgroundColor: activeTab === 'student' ? '#eff6ff' : 'transparent', color: activeTab === 'student' ? '#3b82f6' : '#4b5563' }}>
                        <Users size={20} style={{ display: 'inline', marginRight: '8px' }} />
                        Student Portal
                    </button>
                    <button onClick={() => { setActiveTab('driver'); setIsAuthenticated(false); setIsMobileMenuOpen(false); }} style={{ ...navStyles.mobileMenuItem, backgroundColor: activeTab === 'driver' ? '#eff6ff' : 'transparent', color: activeTab === 'driver' ? '#3b82f6' : '#4b5563' }}>
                        <Truck size={20} style={{ display: 'inline', marginRight: '8px' }} />
                        Driver Portal
                    </button>
                    <button onClick={() => { setActiveTab('admin'); setIsAuthenticated(false); setIsMobileMenuOpen(false); }} style={{ ...navStyles.mobileMenuItem, backgroundColor: activeTab === 'admin' ? '#eff6ff' : 'transparent', color: activeTab === 'admin' ? '#3b82f6' : '#4b5563' }}>
                        <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px' }} />
                        Admin Dashboard
                    </button>
                </div>
            )}
        </>
    );
};

export default Navigation;