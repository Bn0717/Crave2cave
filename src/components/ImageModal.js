import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, X } from 'lucide-react';

const ImageModal = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    if (typeof imageUrl === 'string') {
      setImageSource(imageUrl);
    } else if (imageUrl instanceof File) {
      const localUrl = URL.createObjectURL(imageUrl);
      setImageSource(localUrl);
      return () => URL.revokeObjectURL(localUrl);
    }
  }, [imageUrl]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  const handleMouseDown = (e) => {
    if (scale > 0.5) { // Only allow dragging when zoomed in
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
    } else if (e.touches.length === 1 && scale > 0.5) {
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

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 4000,
      padding: '20px',
      cursor: scale > 0.5 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      touchAction: 'none',
    },
    container: {
      position: 'relative',
      width: '90vw',
      height: '90vh',
      maxWidth: '900px',
      maxHeight: '900px',
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
      backdropFilter: 'blur(10px)',
    },
    zoomControls: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    zoomButton: {
      backgroundColor: '#f3f4f6',
      border: 'none',
      padding: '8px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    zoomLevel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      minWidth: '60px',
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
    },
    imageContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
      transformOrigin: '0 0',
      transition: isDragging ? 'none' : 'transform 0.3s ease',
      userSelect: 'none',
      touchAction: 'none',
      pointerEvents: 'auto',
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
            <button style={modalStyles.zoomButton} onClick={handleZoomOut}>
              <ZoomIn size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span style={modalStyles.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button style={modalStyles.zoomButton} onClick={handleZoomIn}>
              <ZoomIn size={16} />
            </button>
            <button style={modalStyles.zoomButton} onClick={handleZoomReset}>Reset</button>
          </div>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <X size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Close
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
          {imageSource ? (
            <img
              ref={imageRef}
              src={imageSource}
              alt="Order"
              style={modalStyles.image}
              draggable={false}
            />
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center' }}>Loading image...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;