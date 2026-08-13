import React from 'react';

export const DashboardHero = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="heroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="12" />
      </filter>
    </defs>
    
    {/* Background Grid */}
    <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05">
      <path d="M0 50 H800 M0 100 H800 M0 150 H800 M0 200 H800 M0 250 H800" />
      <path d="M100 0 V300 M200 0 V300 M300 0 V300 M400 0 V300 M500 0 V300 M600 0 V300 M700 0 V300" />
    </g>

    {/* Background Shapes */}
    <circle cx="150" cy="80" r="120" fill="url(#heroBg)" filter="url(#glassBlur)" />
    <circle cx="650" cy="220" r="150" fill="url(#heroBg)" filter="url(#glassBlur)" />

    {/* Central Floating Card (Glassmorphism) */}
    <g className="animate-[float_6s_ease-in-out_infinite]" style={{ transformOrigin: 'center' }}>
      <rect x="250" y="50" width="300" height="200" rx="24" fill="currentColor" fillOpacity="0.02" stroke="url(#heroGlow)" strokeWidth="1" strokeOpacity="0.3" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.2))" />
      
      {/* Analytics Chart within Card */}
      <polyline points="280,180 340,120 400,150 460,80 520,100" stroke="url(#heroGlow)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      <circle cx="340" cy="120" r="4" fill="#14b8a6" />
      <circle cx="400" cy="150" r="4" fill="#8b5cf6" />
      <circle cx="460" cy="80" r="4" fill="#ec4899" />
      
      {/* Progress Bars */}
      <rect x="280" y="210" width="120" height="6" rx="3" fill="currentColor" fillOpacity="0.1" />
      <rect x="280" y="210" width="85" height="6" rx="3" fill="#14b8a6" />
      
      <rect x="420" y="210" width="100" height="6" rx="3" fill="currentColor" fillOpacity="0.1" />
      <rect x="420" y="210" width="60" height="6" rx="3" fill="#8b5cf6" />
    </g>

    {/* Floating UI Elements */}
    <g className="animate-[float_8s_ease-in-out_infinite_1s]">
      <rect x="180" y="140" width="100" height="60" rx="12" fill="currentColor" fillOpacity="0.03" stroke="url(#heroGlow)" strokeOpacity="0.2" />
      <circle cx="205" cy="170" r="12" fill="#14b8a6" fillOpacity="0.8" />
      <rect x="225" y="165" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.5" />
      <rect x="225" y="175" width="25" height="3" rx="1.5" fill="currentColor" fillOpacity="0.3" />
    </g>

    <g className="animate-[float_7s_ease-in-out_infinite_2s]">
      <rect x="520" y="80" width="120" height="80" rx="16" fill="currentColor" fillOpacity="0.03" stroke="url(#heroGlow)" strokeOpacity="0.2" />
      <circle cx="580" cy="120" r="24" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="100 150" strokeLinecap="round" transform="rotate(-90 580 120)" />
      <circle cx="580" cy="120" r="24" fill="none" stroke="#ec4899" strokeWidth="4" strokeDasharray="40 150" strokeLinecap="round" transform="rotate(60 580 120)" />
    </g>

    {/* Sparkles */}
    <circle cx="300" cy="80" r="2" fill="#14b8a6"><animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" /></circle>
    <circle cx="500" cy="230" r="3" fill="#8b5cf6"><animate attributeName="opacity" values="1;0.2;1" dur="4s" repeatCount="indefinite" /></circle>
    <circle cx="680" cy="100" r="2" fill="#ec4899"><animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" /></circle>
    <circle cx="120" cy="200" r="2.5" fill="#14b8a6"><animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" /></circle>
  </svg>
);
