import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Star, Users, ChevronLeft, ChevronRight, Calendar, Send } from 'lucide-react';
// Firebase: Import your new functions
import { getFeedbacks, addFeedback } from '../services/firebase'; // Make sure this path is correct
import ShengZe from '../assets/Shengze.jpg';
import Charmaine from '../assets/cy.jpg';

// Team data remains the same
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Yiek Siew Hao",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    school: "Kolej Yayasan UEM",
    course: "Mechanical Engineering",
    sponsor: "Shell Scholar"
  },
  {
    id: 2,
    name: "Bryan Ngu Zhu Kiet", 
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    school: "Kolej Yayasan UEM",
    course: "Data Science",
    sponsor: "Yayasan UEM Scholar"
  },
  {
    id: 3,
    name: "Yeoh Sheng Ze",
    photo: ShengZe,
    school: "Kolej Yayasan UEM",
    course: "Data Science",
    sponsor: "Petronas Scholar"
  },
  {
    id: 4,
    name: "Charmaine Yong Yuen Yii",
    photo: Charmaine,
    school: "Kolej Yayasan UEM",
    course: "Electrical Engineering",
    sponsor: "Shell Scholar"
  }
];

const StarRating = ({ rating, onRatingChange, interactive = false, size = 24 }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              fill: star <= (interactive ? hoverRating || rating : rating) ? '#fbbf24' : 'transparent',
              stroke: star <= (interactive ? hoverRating || rating : rating) ? '#fbbf24' : '#e5e7eb',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRatingChange(star)}
          />
        ))}
      </div>
    );
};

const TeamMember = ({ member, index, isMobile, isTablet }) => {
    const gradients = [
      'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
      'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    ];
  
    return (
      <div
        style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          padding: '24px 20px', 
          borderRadius: '20px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1px solid #e5e7eb',
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div style={{
            width: '100px', 
            height: '100px',
            borderRadius: '50%', 
            background: gradients[index % gradients.length], 
            padding: '3px',
          }}>
            <img 
              src={member.photo} 
              alt={member.name} 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                objectFit: 'cover' 
              }}
            />
          </div>
        </div>
        
        <h3 style={{ 
          fontSize: isMobile ? '21px' : isTablet ? '24px' : '23px', 
          fontWeight: '700', 
          color: '#1f2937', 
          marginBottom: '5px',
          lineHeight: '1.3',
          minHeight: '58px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}>
          {member.name.trim()}
        </h3>
        
        <div style={{ 
          fontSize: isMobile ? '16px' : isTablet ? '16px' : '16px', 
          color: '#374151', 
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <span style={{ fontWeight: '600' }}>{member.sponsor}</span>
          <br />
          {member.school}
          <br />
          {member.course}
        </div>
      </div>
    );
};


const FeedbackTab = ({ showSuccessAnimation }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [visibleFeedbacks, setVisibleFeedbacks] = useState(3);
  const [displayRating, setDisplayRating] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const feedbackList = await getFeedbacks();
        setFeedbacks(feedbackList);
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 768) setVisibleFeedbacks(1);
      else if (width < 1024) setVisibleFeedbacks(2);
      else setVisibleFeedbacks(3);
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const averageRating = useMemo(() =>
    feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : 0,
    [feedbacks]
  );

  useEffect(() => {
    setTimeout(() => setHasAnimated(true), 100);
  }, []);

  useEffect(() => {
    if (!hasAnimated || loading) return;
    const duration = 2000;
    const steps = 60;
    const increment = averageRating / steps;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayRating(prev => Math.min(prev + increment, averageRating));
      } else {
        setDisplayRating(averageRating);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [averageRating, hasAnimated, loading]);

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  const getCurrentFeedbacks = () => {
    if (feedbacks.length === 0) return [];
    const visibleItems = [];
    for (let i = 0; i < visibleFeedbacks; i++) {
        const index = (currentFeedbackIndex + i) % feedbacks.length;
        visibleItems.push(feedbacks[index]);
    }
    // Only return the unique items that should be visible.
    // If we have 4 items total and want to show 3, this will correctly cycle through them.
    // This logic handles cases where total items < visible slots without duplication.
    if (feedbacks.length < visibleFeedbacks) {
        return feedbacks;
    }
    return visibleItems;
  };

  const handleCarouselNav = (direction) => {
    if (isAnimating || feedbacks.length <= visibleFeedbacks) return;
    setIsAnimating(true);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentFeedbackIndex((prev) => (prev + 1) % feedbacks.length);
      } else {
        setCurrentFeedbackIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleSubmitFeedback = async () => {
    if (!newRating || !newComment.trim()) {
      showSuccessAnimation?.('Incomplete Feedback', 'Please provide both a rating and a comment.');
      return;
    }
    setIsSubmitting(true);
    const newFeedbackData = { rating: newRating, comment: newComment.trim() };
    try {
      const docRef = await addFeedback(newFeedbackData);
      const completeFeedback = { ...newFeedbackData, id: docRef.id, timestamp: Date.now() };
      setFeedbacks(prev => [completeFeedback, ...prev]);
      setNewRating(0);
      setNewComment('');
      showSuccessAnimation?.('Thank You!', 'Your feedback has been submitted successfully.');
    } catch (e) {
      console.error("Error submitting feedback: ", e);
      showSuccessAnimation?.('Error', 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFeedbacks = getCurrentFeedbacks();
  const canScroll = feedbacks.length > visibleFeedbacks;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: isMobile ? '16px' : isTablet ? '20px' : '24px', 
      fontFamily: 'Arial, Helvetica, sans-serif'
    }}>
      
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px', opacity: hasAnimated ? 1 : 0, transform: hasAnimated ? 'translateY(0)' : 'translateY(-30px)', transition: 'opacity 0.8s ease-out, transform 0.8s ease-out' }}>
        <h1 style={{fontSize: isMobile ? '32px' : isTablet ? '44px' : '56px', fontWeight: '800', color: '#1f2937', marginBottom: '8px'}}>Feedback</h1>
        <div style={{marginBottom: isMobile ? '16px' : '20px'}}>
            <div style={{fontSize: isMobile ? '48px' : isTablet ? '72px' : '88px', fontWeight: '900', color: '#3b82f6', lineHeight: '1', marginBottom: '12px'}}>
                {loading ? '...' : displayRating.toFixed(1)}
            </div>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '8px'}}>
                <StarRating rating={Math.round(averageRating)} size={isMobile ? 28 : isTablet ? 40 : 48} />
            </div>
            <p style={{fontSize: isMobile ? '12px' : '14px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                Average Rating
            </p>
        </div>
        
        <div style={{ position: 'relative', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9', minHeight: isMobile ? '120px' : '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: isMobile ? '0' : '0' }}>
          {loading ? (
            <p>Loading feedback...</p>
          ) : feedbacks.length === 0 ? (
            <p>No feedback yet. Be the first to share your experience!</p>
          ) : (
            <>
              {/* --- THIS IS THE CORRECTED CAROUSEL CONTAINER --- */}
              <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: isMobile ? '16px' : '24px',
                  padding: isMobile ? '16px 40px' : '24px 60px',
                  opacity: isAnimating ? 0 : 1,
                  transform: isAnimating ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
                  width: '100%',
                  boxSizing: 'border-box',
              }}>
                {currentFeedbacks.map((feedback) => (
                  <div key={feedback.id} style={{ flex: `1 1 calc(100% / ${visibleFeedbacks})`, minWidth: 0, textAlign: 'center' }}>
                      <p style={{ fontStyle: 'italic', fontSize: isMobile ? '14px' : isTablet ? '17px' : '20px', color: '#334155', lineHeight: '1.5', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{feedback.comment}"
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <StarRating rating={feedback.rating} size={isMobile ? 16 : isTablet ? 18 : 20} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                              <Calendar size={12} />
                              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500' }}>{formatTimestamp(feedback.timestamp)}</span>
                          </div>
                      </div>
                  </div>
                ))}
              </div>
              {/* --- END OF CORRECTION --- */}

              <button onClick={() => handleCarouselNav('prev')} disabled={!canScroll} aria-label="Previous feedback" style={{ position: 'absolute', left: isMobile ? '2px' : '16px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', cursor: canScroll ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 10, opacity: canScroll ? 1 : 0.3 }}>
                <ChevronLeft size={isMobile ? 14 : 18} />
              </button>
              <button onClick={() => handleCarouselNav('next')} disabled={!canScroll} aria-label="Next feedback" style={{ position: 'absolute', right: isMobile ? '2px' : '16px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', cursor: canScroll ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 10, opacity: canScroll ? 1 : 0.3 }}>
                <ChevronRight size={isMobile ? 14 : 18} />
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: isMobile ? '16px' : '20px', padding: isMobile ? '20px' : '28px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: isMobile ? '22px' : isTablet ? '24px' : '28px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>Share Your Experience</h3>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <StarRating rating={newRating} onRatingChange={setNewRating} interactive={true} size={isMobile ? 32 : isTablet ? 44 : 48} />
          </div>
          <div style={{ marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
            <label htmlFor="feedback-comment" style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>Your Comment</label>
            <textarea id="feedback-comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Tell us about your experience..." style={{ width: '100%', minHeight: isMobile ? '100px' : '120px', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: isMobile ? '15px' : isTablet ? '16px' : '17px', resize: 'vertical', fontFamily: 'inherit', transition: 'all 0.2s ease', outline: 'none', background: 'white', boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleSubmitFeedback} disabled={isSubmitting || !newRating || !newComment.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: isMobile ? '12px 24px' : '14px 28px', background: isSubmitting || !newRating || !newComment.trim() ? '#d1d5db' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: isSubmitting || !newRating || !newComment.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease' }}>
            <Send size={16} />
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>

      <div style={{ padding: isMobile ? '24px 0' : '40px 0', opacity: hasAnimated ? 1 : 0, transform: hasAnimated ? 'translateY(0)' : 'translateY(-30px)', transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
          <h2 style={{ fontSize: isMobile ? '24px' : isTablet ? '32px' : '40px', fontWeight: '800', color: '#1f2937', margin: 0 }}>Meet Our Team</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: isMobile ? '16px' : '24px' }}>
          {TEAM_MEMBERS.map((member, index) => (
            <div key={member.id} style={{ opacity: hasAnimated ? 1 : 0, transform: hasAnimated ? 'translateY(0)' : 'translateY(-20px)', transition: `opacity 0.6s ease-out ${0.6 + index * 0.1}s, transform 0.6s ease-out ${0.6 + index * 0.1}s` }}>
              <TeamMember member={member} index={index} isMobile={isMobile} isTablet={isTablet} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackTab;