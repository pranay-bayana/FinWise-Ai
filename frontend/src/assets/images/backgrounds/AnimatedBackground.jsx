import React from 'react';

export const AnimatedBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
    {/* Base subtle grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]" />
    
    {/* Animated Blobs */}
    <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="bgBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="80" />
        </filter>
        <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="blobGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Top Left Blob */}
      <g filter="url(#bgBlur)">
        <circle cx="10%" cy="10%" r="300" fill="url(#blobGrad1)" className="animate-[blob_15s_infinite]" />
      </g>
      
      {/* Bottom Right Blob */}
      <g filter="url(#bgBlur)">
        <circle cx="90%" cy="90%" r="400" fill="url(#blobGrad2)" className="animate-[blob_18s_infinite_2s]" />
      </g>
      
      {/* Center Ambient Glow */}
      <g filter="url(#bgBlur)">
        <circle cx="50%" cy="50%" r="200" fill="#3b82f6" fillOpacity="0.1" className="animate-[pulse_10s_infinite]" />
      </g>
    </svg>
  </div>
);
