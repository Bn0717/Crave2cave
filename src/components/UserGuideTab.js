// src/components/UserGuideTab.js
import React, { useState, useEffect } from 'react';
import { HelpCircle, Smartphone, ShoppingBag, MessageSquare } from 'lucide-react';
import GuidePhoto from '../assets/receipt.jpg';
import FoodPanda from '../assets/foodpandareceipt.jpg';

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

// FAQ Components - UPDATED
const QASection = () => (
  <div>
    <h2
      style={{
        fontSize: fluidSize(20, 26),
        color: '#1e293b',
        marginBottom: fluidSize(20, 24),
        fontWeight: '700',
      }}
    >
      Frequently Asked Questions
    </h2>

    <QAItem question="What is Crave 2 Cave (C2C)?">
      <p>
        Crave 2 Cave is a delivery service that brings food from Tanjung Malim
        restaurants directly to students of Kolej Yayasan UEM.
      </p>
    </QAItem>

    <QAItem question="What do we do?">
      <p>
        We make it simple and convenient for KYUEM students to enjoy meals from
        local restaurants without leaving campus.
      </p>
    </QAItem>

    <QAItem question="How much is the delivery fee?">
      <div style={{ overflowX: 'auto', marginTop: '12px' }}>
        <table
          style={{
            width: '100%',
            minWidth: '280px',
            borderCollapse: 'collapse',
            fontSize: fluidSize(13, 15),
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ 
                border: '1px solid #cbd5e1', 
                padding: fluidSize(10, 12),
                textAlign: 'left',
                fontWeight: '600',
                color: '#334155',
              }}>
                Order Amount
              </th>
              <th style={{ 
                border: '1px solid #cbd5e1', 
                padding: fluidSize(10, 12),
                textAlign: 'left',
                fontWeight: '600',
                color: '#334155',
              }}>
                Delivery Fee
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>RM0.01 – RM50</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600' }}>RM10</td>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>RM51 – RM100</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600' }}>RM17</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>RM101 – RM150</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600' }}>RM25</td>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>RM151 – RM200</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600' }}>RM30</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>RM201 – RM300</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600' }}>RM50</td>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>Above RM300</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600' }}>RM60</td>
            </tr>
          </tbody>
        </table>
      </div>
    </QAItem>

    <QAItem question="What is the order timeline?">
      <div style={{ overflowX: 'auto', marginTop: '12px' }}>
        <table
          style={{
            width: '100%',
            minWidth: '280px',
            borderCollapse: 'collapse',
            fontSize: fluidSize(13, 15),
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ 
                border: '1px solid #cbd5e1', 
                padding: fluidSize(10, 12),
                textAlign: 'left',
                fontWeight: '600',
                color: '#334155',
              }}>
                Time
              </th>
              <th style={{ 
                border: '1px solid #cbd5e1', 
                padding: fluidSize(10, 12),
                textAlign: 'left',
                fontWeight: '600',
                color: '#334155',
              }}>
                Activity
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600', whiteSpace: 'nowrap' }}>4:30 PM</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>Orders close</td>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600', whiteSpace: 'nowrap' }}>6:10 – 6:30 PM</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>Driver picks up food</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600', whiteSpace: 'nowrap' }}>6:30 PM</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>Delivery begins</td>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12), fontWeight: '600', whiteSpace: 'nowrap' }}>7:00 PM</td>
              <td style={{ border: '1px solid #e2e8f0', padding: fluidSize(10, 12) }}>Collect orders at the guardhouse</td>
            </tr>
          </tbody>
        </table>
      </div>
    </QAItem>

    <QAItem question="What is the base delivery fee for?">
      <p>
        The base fee helps prevent misuse of the ordering system (e.g., creating
        multiple accounts to bypass the daily quota).
      </p>
    </QAItem>

    <QAItem question="Where can I order from?">
      <p>Only restaurants listed on our website are available for delivery.</p>
    </QAItem>

    <QAItem question="What is the refund policy?">
      <p>For any refund requests, please contact the admin-on-duty.</p>
      <strong>Tee Chun Shan (01116169431)</strong>
    </QAItem>
  </div>
);


const QAItem = ({ question, children }) => {
  const styles = {
    item: { 
      marginBottom: fluidSize(20, 24),
      padding: fluidSize(16, 20),
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
    },
    question: { 
      fontSize: fluidSize(16, 19), 
      fontWeight: '700', 
      color: '#1e293b',
      marginBottom: fluidSize(10, 12), 
      lineHeight: '1.4',
    },
    answer: { 
      fontSize: fluidSize(14, 16), 
      color: '#475569', 
      lineHeight: '1.7',
    },
  };

  return (
    <div 
      style={styles.item}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
      }}
    >
      <h3 style={styles.question}>
        {question}
      </h3>
      <div style={styles.answer}>{children}</div>
    </div>
  );
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
  appOrder: { 
    name: 'Submitting App Orders via Website', 
    shortName: 'Website', 
    icon: <Smartphone />, 
    title: 'How to Submit Orders via Our Website', 
    image: GuidePhoto, 
    steps: [ 
      'Order food via merchant\'s app (e.g. Domino\'s Pizza).',
      "Select 'Scheduled' pick up option and set time to 17:45 - 18:00.",
      'Take a screenshot of your order (include order number and total amount).',
      'Register our website using your FULL NAME and CONTACT NUMBER.', 
      'Pay a base delivery fee of RM10 and upload proof of payment (only applies to the first 3 users).', 
      'If minimum quota is reached, log onto your account and submit order details (e.g. total amount, order number).', 
      'Pay amount as indicated.', 
      'Enter your email address to track the order.' 
    ] 
  },
  foodpandaOrder: { 
    name: 'Order via FoodPanda', 
    shortName: 'FoodPanda', 
    icon: <ShoppingBag />, 
    title: 'How to Order via FoodPanda', 
    image: FoodPanda, 
    steps: [ 
      'Ensure FoodPanda\'s address chosen is in Tanjung Malim (highly recommended).', 
      'Choose your orders. Ensure pick up option is chosen at the checkout page.', 
      "Select 'Scheduled' pick up option and set time to 17:45 - 18:00.", 
      'Take a screenshot of your order (include order number and total amount) and submit to our website when required.',
      'Register our website using your FULL NAME and CONTACT NUMBER.', 
      'Pay a base delivery fee of RM10 and upload proof of payment (only applies to the first 3 users).', 
      'If minimum quota is reached, log onto your account and submit order details (e.g. total amount, order number).', 
      'Pay amount as indicated.', 
      'Enter your email address to track the order.' 
    ] 
  },
  faq: { 
    name: 'FAQs', 
    shortName: 'FAQs', 
    icon: <MessageSquare /> 
  },
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
            src="https://www.youtube.com/embed/D4tE5oGe7ng?rel=0&cc_load_policy=1&autoplay=0"
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