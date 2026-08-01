import React from 'react';

interface WaveSeparatorProps {
  fillColor?: string;
  flip?: boolean;
}

export function WaveSeparator({ fillColor = '#fff', flip = true }: WaveSeparatorProps) {
  return (
    <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', overflow: 'hidden', lineHeight: 0, zIndex: 10, pointerEvents: 'none' }}>
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '40px', 
          transform: flip ? 'rotateY(180deg)' : 'none' 
        }}
      >
        <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill={fillColor}></path>
      </svg>
    </div>
  );
}
