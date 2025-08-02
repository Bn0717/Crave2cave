import React, { useState } from 'react';
import { Users, Truck, BarChart3, Menu, X, Home } from 'lucide-react';
import logo from '../assets/logo(1).png';

// *** FIXED: Re-added `setIsAuthenticated` to the props destructuring ***
const Navigation = ({ activeTab, onTabChange, onHome, selectedVendor, isTransitioning, windowWidth }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleHomeClick = () => {
        if (isTransitioning) return;
        onHome();
        setIsMobileMenuOpen(false);
    };

        // Add this helper function inside your Navigation component
    const getVendorDetails = (vendorId) => {
    const vendors = {
        'mixue': { name: 'Mixue', icon: '🧋', shortName: 'Mixue' },
        'dominos': { name: 'Dominos', icon: '🍕', shortName: 'Dominos' },
        'mcdonalds': { name: "McDonald's", icon: '🍟', shortName: "McD's" }, // ✅ Shorter name for mobile
    };
    return vendors[vendorId];
};

    const vendorDetails = getVendorDetails(selectedVendor);

    // *** FIXED: The logic to reset authentication is restored here ***
     const handleTabClick = (tabId) => {
        if (isTransitioning) return;
        onTabChange(tabId); // Just tell App.js what happened
        setIsMobileMenuOpen(false);
    };

    const tabs = [
        { id: 'student', label: 'Student Portal', icon: Users },
        { id: 'driver', label: 'Driver Portal', icon: Truck },
        { id: 'admin', label: 'Admin Portal', icon: BarChart3 }
    ];

    const navStyles = {
        navbar: {
            position: 'fixed', top: 0, left: 0, right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            pointerEvents: isTransitioning ? 'none' : 'auto',
            opacity: isTransitioning ? 0.8 : 1
        },
        container: {
            maxWidth: '1200px', margin: '0 auto', padding: '0 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px'
        },
            //... inside navStyles
    leftSection: {
        display: 'flex',
        alignItems: 'center',
        gap: windowWidth <= 768 ? '8px' : '20px', // ✅ Reduce gap on small screens
        flex: 1, // ✅ Allow this section to grow
        minWidth: 0 // ✅ Allow items to shrink if needed
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px', // Space between logo image and text
      cursor: 'pointer',
      padding: '5px', // Add some padding for the hover effect
      borderRadius: '10px',
      transition: 'background-color 0.2s ease',
    },
    logoImage: {
      height: '45px', // Slightly smaller logo for better balance
      width: 'auto',
      objectFit: 'contain'
    },
    logoText: {
    fontSize: windowWidth <= 768 ? '18px' : '20px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #3b82f5 0%, #1e40af 100%)',
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent', 
    backgroundClip: 'text',
    // Remove this line: display: windowWidth <= 370 ? 'none' : 'block',
    whiteSpace: 'nowrap' // Keep logo text on one line
},
    vendorName: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px', // Consistent padding
        backgroundColor: '#eef2ff', 
        color: '#4338ca', 
        borderRadius: '9999px',
        fontSize: '13px', // A good, readable size for mobile
        fontWeight: '600',
        border: '1px solid #c7d2fe',
        // We no longer need textTransform: 'capitalize' if using getVendorDetails
    },
        desktopMenu: { display: 'flex', alignItems: 'center', gap: '8px' },
        navButton: {
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
            borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
            fontWeight: '500', transition: 'all 0.3s ease', border: 'none',
            background: 'transparent', color: '#64748b'
        },
        activeTab: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        },
        mobileMenuButton: { background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#1f2937' },
        mobileMenu: {
            position: 'fixed', top: '70px', right: 0, backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '20px',
            borderRadius: '0 0 0 20px', minWidth: '250px', zIndex: 999,
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        mobileMenuItem: {
            display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
            padding: '16px', marginBottom: '8px', backgroundColor: 'transparent',
            border: 'none', borderRadius: '8px', textAlign: 'left',
            fontSize: '16px', fontWeight: '500', cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 998,
            opacity: isMobileMenuOpen ? 1 : 0, visibility: isMobileMenuOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s ease'
        }
    };

    return (
        <>
            <style>
                {`
                @media (max-width: 860px) {
                    .desktop-menu { display: none !important; }
                    .mobile-menu-button { display: block !important; }
                }
                @media (min-width: 861px) {
                    .mobile-menu-button { display: none !important; }
                }
                .nav-button:hover:not(.active) {
                    background: rgba(59, 130, 246, 0.1) !important;
                    color: #3b82f6 !important;
                }
                .logo-container:hover {
                    background: rgba(59, 130, 246, 0.05) !important;
                    transform: translateY(-1px) !important;
                }
                `}
            </style>

            {isMobileMenuOpen && <div style={navStyles.overlay} onClick={() => setIsMobileMenuOpen(false)} />}

            <nav style={navStyles.navbar}>
                <div style={navStyles.container}>
                    <div style={navStyles.leftSection}>
                        <div className="logo-container" style={navStyles.logoContainer} onClick={handleHomeClick}>
                        <img src={logo} alt="Crave 2 Cave Logo" style={navStyles.logoImage} />
                        <span className="logo-text" style={navStyles.logoText}>
                            Crave 2 Cave
                        </span>
                    </div>

                    {selectedVendor && (
    <div className="vendor-name-display" style={navStyles.vendorName}>
        <span style={{ marginRight: '8px', fontSize: '18px', lineHeight: 1 }}>
            {getVendorDetails(selectedVendor).icon}
        </span>
        <span>
            {windowWidth <= 480 
                ? getVendorDetails(selectedVendor).shortName || getVendorDetails(selectedVendor).name
                : getVendorDetails(selectedVendor).name
            }
        </span>
    </div>
)}
                    </div>

                    <div className="desktop-menu" style={navStyles.desktopMenu}>
                        <button className="nav-button" style={navStyles.navButton} onClick={handleHomeClick}>
                            <Home size={18} />
                            <span>Home</span>
                        </button>
                        
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;
                            // The onClick here now calls the corrected handleTabClick function
                            return (
                                <button key={tab.id} className={`nav-button ${isActive ? 'active' : ''}`} style={{ ...navStyles.navButton, ...(isActive ? navStyles.activeTab : {}) }} onClick={() => handleTabClick(tab.id)}>
                                    <IconComponent size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    <button className="mobile-menu-button" style={navStyles.mobileMenuButton} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Also fix the mobile menu to use the correct handler */}
            <div style={navStyles.mobileMenu}>
                 <button onClick={handleHomeClick} style={navStyles.mobileMenuItem}>
                    <Home size={20} />
                    <span>Home</span>
                </button>
                {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => handleTabClick(tab.id)} style={navStyles.mobileMenuItem}>
                            <IconComponent size={20} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default Navigation;