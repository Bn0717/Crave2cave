import React from 'react';

const shimmerBase = {
  background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%)',
  backgroundSize: '400% 100%',
  animation: 'skeleton-shimmer 1.4s ease infinite',
  borderRadius: '8px',
};

export const SkeletonBlock = ({ width = '100%', height = '16px', style = {} }) => (
  <div style={{ ...shimmerBase, width, height, ...style }} />
);

const DashboardSkeleton = ({ cardCount = 4, rowCount = 5 }) => (
  <div>
    <style>{`
      @keyframes skeleton-shimmer {
        0% { background-position: 100% 50%; }
        100% { background-position: 0 50%; }
      }
    `}</style>

    <div style={{ marginBottom: '32px' }}>
      <SkeletonBlock width="220px" height="32px" style={{ marginBottom: '10px' }} />
      <SkeletonBlock width="160px" height="16px" />
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    }}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <SkeletonBlock width="60%" height="14px" style={{ marginBottom: '14px' }} />
          <SkeletonBlock width="40%" height="28px" />
        </div>
      ))}
    </div>

    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <SkeletonBlock width="200px" height="20px" style={{ marginBottom: '24px' }} />
      {Array.from({ length: rowCount }).map((_, i) => (
        <SkeletonBlock key={i} width="100%" height="48px" style={{ marginBottom: '12px' }} />
      ))}
    </div>
  </div>
);

export default DashboardSkeleton;
