import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const ImageCarousel = ({ images, onClose }) => {
  // --- STATE MANAGEMENT ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // --- RESPONSIVENESS LOGIC ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define the breakpoint for mobile styles
  const isMobile = windowWidth <= 768;

  // --- CORE FUNCTIONS ---

  // Reset image zoom/pan state when changing images
  const resetImageState = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrevious = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    resetImageState();
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    resetImageState();
  }, [images.length]);

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevious, handleNext, onClose]); // <-- Add the functions back here

  // --- MOUSE & TOUCH HANDLERS (ZOOM/PAN) ---

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) { // Allow dragging only when zoomed in
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setInitialDistance(getDistance(e.touches));
      setInitialScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging || e.touches.length === 2) e.preventDefault();
    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches);
      const scaleChange = currentDistance / initialDistance;
      const newScale = initialScale * scaleChange;
      setScale(Math.min(Math.max(newScale, 0.5), 5));
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialDistance(0);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.5, 0.5));
  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // --- RESPONSIVE STYLES OBJECT ---
  const modalStyles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 3000,
      padding: '10px',
      cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      touchAction: 'none',
    },
    container: {
      position: 'relative', width: '100%', height: '100%',
      maxWidth: '1200px', maxHeight: '95vh',
      backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      display: 'flex', flexDirection: 'column',
    },
    header: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: isMobile ? '12px' : '12px 16px',
      display: 'flex', alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'space-between',
      flexWrap: 'wrap', // Allows items to wrap on mobile
      gap: isMobile ? '12px' : '8px',
      zIndex: 1, borderBottom: '1px solid #e2e8f0'
    },
    zoomControls: {
      display: 'flex', gap: isMobile ? '6px' : '8px', alignItems: 'center'
    },
    zoomButton: {
      backgroundColor: '#f3f4f6', border: 'none', padding: '8px',
      borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
      transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    zoomLevel: {
      fontSize: '14px', fontWeight: '600', color: '#1f2937',
      minWidth: '60px', textAlign: 'center',
    },
    imageCounter: {
      display: 'flex', alignItems: 'center',
      gap: isMobile ? '12px' : '16px',
      fontSize: '14px', fontWeight: '600', color: '#1f2937',
    },
    navButton: {
      backgroundColor: '#f3f4f6', border: 'none', padding: '8px',
      borderRadius: '6px', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      minWidth: '36px', height: '36px', transition: 'all 0.2s ease',
    },
    closeButton: {
      backgroundColor: '#ef4444', color: 'white', border: 'none',
      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
      fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', gap: '6px',
    },
    imageContainer: {
      flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden', position: 'relative', backgroundColor: '#f1f5f9'
    },
    image: {
      maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
      transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
      transformOrigin: 'center center',
      transition: isDragging ? 'none' : 'transform 0.2s ease',
      userSelect: 'none', touchAction: 'none', pointerEvents: 'auto',
    },
    floatingNav: {
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none',
      borderRadius: '50%', width: isMobile ? '40px' : '50px',
      height: isMobile ? '40px' : '50px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', transition: 'all 0.2s ease', zIndex: 2,
    },
    thumbnailContainer: {
      padding: isMobile ? '12px' : '16px', backgroundColor: '#f8fafc',
      display: 'flex', gap: '8px', overflowX: 'auto',
      justifyContent: 'flex-start', borderTop: '1px solid #e2e8f0',
    },
  };

  return (
    <div
      style={modalStyles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={modalStyles.container}>
        <div style={modalStyles.header}>
          <div style={modalStyles.zoomControls}>
            <button style={modalStyles.zoomButton} onClick={handleZoomOut} title="Zoom Out">
              <ZoomIn size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span style={modalStyles.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button style={modalStyles.zoomButton} onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <button style={modalStyles.zoomButton} onClick={handleZoomReset} title="Reset Zoom">
              Reset
            </button>
          </div>

          <div style={modalStyles.imageCounter}>
            <button
              style={{ ...modalStyles.navButton, opacity: images.length <= 1 ? 0.5 : 1 }}
              onClick={handlePrevious} disabled={images.length <= 1} title="Previous Image"
            >
              <ChevronLeft size={16} />
            </button>
            <span>{currentIndex + 1} of {images.length}</span>
            <button
              style={{ ...modalStyles.navButton, opacity: images.length <= 1 ? 0.5 : 1 }}
              onClick={handleNext} disabled={images.length <= 1} title="Next Image"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button style={modalStyles.closeButton} onClick={onClose}>
            <X size={16} />
            {!isMobile && 'Close'}
          </button>
        </div>

        <div
          ref={containerRef}
          style={modalStyles.imageContainer}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 1 && (
            <>
              <button
                style={{ ...modalStyles.floatingNav, left: isMobile ? '10px' : '20px' }}
                onClick={handlePrevious} title="Previous Image"
              >
                <ChevronLeft size={isMobile ? 20 : 24} color="#374151" />
              </button>
              <button
                style={{ ...modalStyles.floatingNav, right: isMobile ? '10px' : '20px' }}
                onClick={handleNext} title="Next Image"
              >
                <ChevronRight size={isMobile ? 20 : 24} color="#374151" />
              </button>
            </>
          )}

          {images[currentIndex] ? (
            <img
              ref={imageRef}
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              style={modalStyles.image}
              draggable={false}
            />
          ) : (
            <div style={{ color: '#64748b', textAlign: 'center', fontSize: '18px' }}>
              Loading image...
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div style={modalStyles.thumbnailContainer}>
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  resetImageState();
                }}
                style={{
                  border: index === currentIndex ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '8px', padding: '2px', backgroundColor: 'white',
                  cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0
                }}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    objectFit: 'cover', borderRadius: '6px', display: 'block'
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;