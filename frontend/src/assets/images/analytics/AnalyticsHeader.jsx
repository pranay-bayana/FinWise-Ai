import React from 'react';

export const AnalyticsHeader = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="analyticsBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="analyticsLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <filter id="analyticsBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="20" />
      </filter>
    </defs>

    {/* Background Blobs */}
    <circle cx="200" cy="100" r="150" fill="url(#analyticsBg)" filter="url(#analyticsBlur)" />
    <circle cx="1000" cy="50" r="180" fill="url(#analyticsBg)" filter="url(#analyticsBlur)" />
    
    {/* Abstract Grid */}
    <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05">
      <path d="M0 40 H1200 M0 80 H1200 M0 120 H1200 M0 160 H1200" />
      <path d="M100 0 V200 M300 0 V200 M500 0 V200 M700 0 V200 M900 0 V200 M1100 0 V200" />
    </g>

    {/* Trending Line Graph */}
    <path d="M 0 150 Q 150 180 300 120 T 600 90 T 900 110 T 1200 40" stroke="url(#analyticsLine)" strokeWidth="6" fill="none" strokeLinecap="round" />
    
    {/* Shadow/Fill under the line */}
    <path d="M 0 150 Q 150 180 300 120 T 600 90 T 900 110 T 1200 40 L 1200 200 L 0 200 Z" fill="url(#analyticsBg)" opacity="0.3" />

    {/* Floating Data Points */}
    <circle cx="300" cy="120" r="6" fill="#14b8a6" />
    <circle cx="600" cy="90" r="6" fill="#3b82f6" />
    <circle cx="900" cy="110" r="6" fill="#8b5cf6" />
    <circle cx="1200" cy="40" r="6" fill="#a855f7" />
    
    {/* Pulsing rings around data points */}
    <circle cx="600" cy="90" r="14" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.5">
      <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
    </circle>
    
    <circle cx="900" cy="110" r="14" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.5">
      <animate attributeName="r" values="14;24;14" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
    </circle>

    {/* Floating Bars in the Background */}
    <g className="animate-[float_6s_ease-in-out_infinite]" fill="currentColor" fillOpacity="0.05">
      <rect x="150" y="80" width="30" height="70" rx="6" />
      <rect x="200" y="40" width="30" height="110" rx="6" fill="#14b8a6" fillOpacity="0.1" />
      <rect x="250" y="100" width="30" height="50" rx="6" />
    </g>

    <g className="animate-[float_8s_ease-in-out_infinite_1s]" fill="currentColor" fillOpacity="0.05">
      <rect x="750" y="60" width="40" height="50" rx="8" />
      <rect x="810" y="30" width="40" height="80" rx="8" fill="#8b5cf6" fillOpacity="0.1" />
      <rect x="870" y="50" width="40" height="60" rx="8" />
    </g>

    {/* Sparkles */}
    <circle cx="450" cy="50" r="3" fill="#14b8a6"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" /></circle>
    <circle cx="1050" cy="150" r="4" fill="#a855f7"><animate attributeName="opacity" values="1;0.2;1" dur="3.5s" repeatCount="indefinite" /></circle>
  </svg>
);
