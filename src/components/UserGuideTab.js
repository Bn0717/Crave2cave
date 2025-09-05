// src/components/UserGuideTab.js

import React from 'react';
import { HelpCircle, User, Truck, BarChart3 } from 'lucide-react';

const QASection = ({ title, icon, children }) => {
  const styles = {
    section: {
      marginBottom: '40px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingBottom: '12px',
      borderBottom: '2px solid #e2e8f0',
      marginBottom: '20px',
    },
    title: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
    },
  };
  return (
    <div style={styles.section}>
      <div style={styles.header}>
        {icon}
        <h2 style={styles.title}>{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};

const QAItem = ({ question, children }) => {
  const styles = {
    item: {
      marginBottom: '24px',
    },
    question: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#334155',
      marginBottom: '8px',
    },
    answer: {
      fontSize: '16px',
      color: '#475569',
      lineHeight: '1.7',
    },
  };
  return (
    <div style={styles.item}>
      <h3 style={styles.question}>{question}</h3>
      <div style={styles.answer}>{children}</div>
    </div>
  );
};

const UserGuideTab = () => {
  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f1f5f9',
    },
    mainHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px',
    },
    mainTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0,
    },
    intro: {
      fontSize: '16px',
      color: '#64748b',
      marginBottom: '40px',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.mainHeader}>
        <HelpCircle size={36} color="#3b82f6" />
        <h1 style={styles.mainTitle}>User Guide & FAQ</h1>
      </div>
      <p style={styles.intro}>
        Welcome to the Crave 2 Cave User Guide. Here you can find answers to common questions about using the platform.
      </p>

      {/* === STUDENT SECTION === */}
      <QASection title="For Students" icon={<User size={24} color="#3b82f6" />}>
        <QAItem question="How do I register for a delivery?">
          <p>
            Navigate to the "Student Portal", enter your full name and student ID in the format "0000/00", and click "Register for Delivery".
          </p>
        </QAItem>
        <QAItem question="Why do I need to pay a RM10 Base Fee?">
          <p>
            The RM10 base fee is required from the first 3 users to activate the delivery system for the day. If you are one of the first 3 to pay, this amount will be automatically deducted from your final delivery fee.
          </p>
        </QAItem>
        {/* ADD MORE STUDENT Q&A ITEMS HERE */}
      </QASection>
    </div>
  );
};

export default UserGuideTab;