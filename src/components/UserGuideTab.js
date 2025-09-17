// src/components/UserGuideTab.js
import React, { useState, useEffect } from 'react';
import { HelpCircle, Smartphone, ShoppingBag, MessageSquare } from 'lucide-react';
import GuidePhoto from '../assets/receipt.jpg';

// Helper function for fluid typography
const fluidSize = (minSize, maxSize, minVw = 375, maxVw = 1440) => {
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const yAxisIntersection = -minVw * slope + minSize;
  const preferredValue = `${yAxisIntersection.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw`;
  return `clamp(${minSize}px, ${preferredValue}, ${maxSize}px)`;
};

// Guide Content Component
const OrderGuide = ({ topic }) => {
    // ... (This component remains unchanged)
    const styles = {
        guideTitle: { fontSize: fluidSize(20, 26), fontWeight: '700', color: '#1e293b', marginBottom: fluidSize(16, 20), textAlign: 'center' },
        guideImage: { display: 'block', width: '100%', maxWidth: '450px', height: 'auto', margin: `0 auto ${fluidSize(16, 24)} auto`, borderRadius: '16px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)' },
        stepsContainer: { backgroundColor: '#f8fafc', padding: fluidSize(20, 32), borderRadius: '16px' },
        stepsTitle: { fontSize: fluidSize(17, 21), fontWeight: '600', color: '#334155', marginBottom: fluidSize(16, 20) },
        stepsList: { listStyle: 'none', padding: 0, margin: 0 },
        stepItem: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' },
        stepNumber: { backgroundColor: '#3b82f6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' },
        stepText: { fontSize: fluidSize(14, 16), color: '#475569', lineHeight: '1.7', textAlign: 'justify' },
    };
    return (
        <>
            <h2 style={styles.guideTitle}>{topic.title}</h2>
            <img src={topic.image} alt={`${topic.name} ordering guide`} style={styles.guideImage} />
            <div style={styles.stepsContainer}>
                <h3 style={styles.stepsTitle}>Step-by-Step Instructions:</h3>
                <ul style={styles.stepsList}>
                    {topic.steps.map((step, index) => (
                        <li key={index} style={styles.stepItem}><div style={styles.stepNumber}>{index + 1}</div><div style={styles.stepText}>{step}</div></li>
                    ))}
                </ul>
            </div>
        </>
    );
};

// FAQ Components
const QASection = () => (
  // ... (This component remains unchanged)
  <div>
    <h2 style={{ fontSize: fluidSize(20, 26), color: '#1e293b', marginBottom: '24px' }}>Frequently Asked Questions</h2>
    <QAItem question="How do I register for a delivery?"><p>Navigate to the "Student Portal", enter your full name and student ID in the format "0000/00", and click "Register for Delivery".</p></QAItem>
    <QAItem question="Why do I need to pay a RM10 Base Fee?"><p>The RM10 base fee is required from the first 3 users to activate the delivery system for the day. If you are one of the first 3 to pay, this amount will be automatically deducted from your final delivery fee.</p></QAItem>
    <QAItem question="When can I submit my order?"><p>You can submit your order after paying the base fee and once the system is activated (minimum 3 paid users). The system is available on Tuesday and Friday from 12:00 AM to 6:00 PM Malaysia Time.</p></QAItem>
    <QAItem question="How is the delivery fee calculated?"><p>Delivery fees are calculated based on your order total:</p><ul style={{ marginTop: '8px', paddingLeft: '20px', listStyleType: 'disc' }}><li>RM0.01 - RM15.00: RM8 delivery fee</li><li>RM15.01 - RM30.00: RM10 delivery fee</li><li>RM30.01 and above: RM12 delivery fee</li></ul><p style={{ marginTop: '8px' }}>If you're among the first 3 users, RM10 will be automatically deducted from your delivery fee.</p></QAItem>
  </div>
);

const QAItem = ({ question, children }) => {
  // ... (This component remains unchanged)
  const styles = {
    item: { marginBottom: '20px' },
    question: { fontSize: fluidSize(16, 19), fontWeight: '600', color: '#334155', marginBottom: '8px', lineHeight: '1.4' },
    answer: { fontSize: fluidSize(14, 16), color: '#475569', lineHeight: '1.7', textAlign: 'justify' },
  };
  return (<div style={styles.item}><h3 style={styles.question}>{question}</h3><div style={styles.answer}>{children}</div></div>);
};


const UserGuideTab = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [activeTopic, setActiveTopic] = useState('appOrder');
  // **NEW**: State to control the animation visibility
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // **NEW**: useEffect to trigger the animation once the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100); // Small delay to ensure the component is rendered
    return () => clearTimeout(timer);
  }, []);

  const guideTopics = {
    // ... (This object remains unchanged)
    appOrder: { name: 'Order via app', shortName: 'App', icon: <Smartphone />, title: 'How to Order via Our App', image: GuidePhoto, steps: [ 'Download our official application from the App Store or Google Play.', 'Create an account or log in.', 'Browse our menu and add your desired items to the cart.', 'Proceed to checkout and confirm your delivery details.', 'Take a screenshot of the order confirmation screen.', 'Upload the screenshot in the Student Portal when submitting your order.' ] },
    foodpandaOrder: { name: 'Order via FoodPanda', shortName: 'FoodPanda', icon: <ShoppingBag />, title: 'How to Order via FoodPanda', image: GuidePhoto, steps: [ 'Open the FoodPanda app or visit their website.', 'Search for our store name in the search bar.', 'Select items from our menu listed on FoodPanda.', 'Add them to your cart and complete the checkout process on their platform.', 'Save a screenshot of your final order receipt.', 'Return to our Student Portal and upload the receipt screenshot.' ] },
    faq: { name: 'FAQs', shortName: 'FAQs', icon: <MessageSquare /> },
  };

  const useShortNames = screenWidth <= 640;
  const hideIcon = screenWidth <= 380;

  // **NEW**: Helper function to generate animation styles with a delay
  const animationStyle = (delay = '0s') => ({
    opacity: hasAnimated ? 1 : 0,
    transform: hasAnimated ? 'translateY(0)' : 'translateY(-20px)',
    transition: `opacity 0.6s ease-out ${delay}, transform 0.6s ease-out ${delay}`,
  });

  const styles = {
    card: { 
      backgroundColor: 'white', 
      borderRadius: '20px', 
      padding: fluidSize(16, 32), 
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', 
      margin: 'auto', 
      maxWidth: '1200px',
    },
    videoSection: { marginBottom: fluidSize(24, 32) },
    videoTitle: { fontSize: fluidSize(20, 28), fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: fluidSize(16, 24) },
    videoWrapper: { position: 'relative', overflow: 'hidden', width: '100%', paddingTop: '56.25%', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
    sectionDivider: { border: 0, borderTop: '1px solid #e2e8f0', margin: `${fluidSize(24, 40)} 0` },
    mainHeader: { display: 'flex', alignItems: 'center', gap: '16px' },
    mainTitle: { fontSize: fluidSize(20, 28), fontWeight: 'bold', color: '#1e293b', margin: 0 },
    layoutContainer: { display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: fluidSize(16, 20) },
    navigation: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' },
    navButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: hideIcon ? 0 : '8px', padding: '12px 8px', borderRadius: '10px', cursor: 'pointer', fontSize: fluidSize(13, 16), fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s ease', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' },
    activeNavButton: { backgroundColor: '#eef2ff', color: '#3b82f6', borderColor: '#c7d2fe', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
    contentArea: { flex: 1, minWidth: 0, paddingTop: '16px' },
  };

  return (
    // **MODIFIED**: Added animation styles to the main container
    <div style={{...styles.card, ...animationStyle()}}>
      
      <div style={{...styles.videoSection, ...animationStyle('0.1s')}}>
        <h2 style={styles.videoTitle}>Video Tutorial</h2>
        <div style={styles.videoWrapper}>
          <iframe
            style={styles.iframe}
            src="https://www.youtube.com/embed/CDzYM5_5nxc?rel=0&cc_load_policy=1&autoplay=0"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      
      <hr style={{...styles.sectionDivider, ...animationStyle('0.2s')}} />

      {/* **MODIFIED**: Wrapped the header in a div to apply animation */}
      <div style={animationStyle('0.3s')}>
        <div style={styles.mainHeader}>
          <HelpCircle size={fluidSize(24, 32)} color="#3b82f6" />
          <h1 style={styles.mainTitle}>User Guide & FAQs</h1>
        </div>
      </div>
      
      <div style={styles.layoutContainer}>
        {/* **MODIFIED**: Added animation styles to the navigation */}
        <nav style={{...styles.navigation, ...animationStyle('0.4s')}}>
          {Object.entries(guideTopics).map(([key, topic]) => (
            <button
              key={key}
              onClick={() => setActiveTopic(key)}
              style={{
                ...styles.navButton,
                ...(activeTopic === key ? styles.activeNavButton : {}),
              }}
            >
              {!hideIcon && React.cloneElement(topic.icon, { size: useShortNames ? 18 : 20 })}
              <span>{useShortNames ? topic.shortName : topic.name}</span>
            </button>
          ))}
        </nav>

        {/* **MODIFIED**: Added animation styles to the content area */}
        <main style={{...styles.contentArea, ...animationStyle('0.5s')}}>
          {activeTopic === 'faq' ? (
            <QASection />
          ) : (
            <OrderGuide topic={guideTopics[activeTopic]} />
          )}
        </main>
      </div>
    </div>
  );
};

export default UserGuideTab;