import React from 'react';

export const AuthSideIllustration = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="authBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="authGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <filter id="authBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" />
      </filter>
    </defs>
    
    {/* Abstract Background Blobs */}
    <circle cx="200" cy="200" r="250" fill="url(#authBg)" filter="url(#authBlur)" className="animate-[blob_10s_infinite]" />
    <circle cx="500" cy="600" r="200" fill="url(#authBg)" filter="url(#authBlur)" className="animate-[blob_12s_infinite_2s]" />

    {/* Central Smart Finance Graphic */}
    <g className="animate-[float_6s_ease-in-out_infinite]" style={{ transformOrigin: 'center' }}>
      {/* Phone/Device Mockup */}
      <rect x="180" y="200" width="240" height="400" rx="30" fill="#080b16" fillOpacity="0.8" stroke="url(#authGlow)" strokeWidth="2" strokeOpacity="0.4" />
      <rect x="200" y="230" width="200" height="340" rx="16" fill="currentColor" fillOpacity="0.03" />
      
      {/* Device Header */}
      <circle cx="230" cy="255" r="12" fill="url(#authGlow)" fillOpacity="0.8" />
      <rect x="255" y="250" width="80" height="10" rx="5" fill="currentColor" fillOpacity="0.3" />
      
      {/* Device Content */}
      <rect x="220" y="290" width="160" height="60" rx="12" fill="url(#authBg)" fillOpacity="0.4" />
      <text x="235" y="325" fill="#fff" fontSize="16" fontWeight="bold">₹0</text>
      <path d="M 320 330 Q 335 300 360 320" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      <circle cx="250" cy="410" r="40" fill="none" stroke="#a855f7" strokeWidth="8" strokeDasharray="160 250" strokeLinecap="round" />
      <circle cx="250" cy="410" r="40" fill="none" stroke="#14b8a6" strokeWidth="8" strokeDasharray="60 250" strokeDashoffset="-160" strokeLinecap="round" />
      
      <rect x="310" y="380" width="60" height="8" rx="4" fill="currentColor" fillOpacity="0.2" />
      <rect x="310" y="400" width="40" height="8" rx="4" fill="currentColor" fillOpacity="0.2" />
      <rect x="310" y="420" width="50" height="8" rx="4" fill="currentColor" fillOpacity="0.2" />
    </g>

    {/* Floating Cards (AI & Analytics) */}
    <g className="animate-[float_7s_ease-in-out_infinite_1s]">
      <rect x="80" y="300" width="140" height="80" rx="16" fill="#080b16" fillOpacity="0.9" stroke="url(#authGlow)" strokeWidth="1" strokeOpacity="0.3" />
      <path d="M 100 350 L 120 330 L 140 340 L 160 310 L 180 320 L 200 290" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy="350" r="3" fill="#14b8a6" />
      <circle cx="200" cy="290" r="3" fill="#14b8a6" />
    </g>

    <g className="animate-[float_8s_ease-in-out_infinite_2s]">
      <rect x="380" y="450" width="160" height="100" rx="16" fill="#080b16" fillOpacity="0.9" stroke="url(#authGlow)" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="415" cy="485" r="16" fill="#a855f7" fillOpacity="0.2" />
      {/* Bot Icon */}
      <rect x="407" y="478" width="16" height="14" rx="4" stroke="#a855f7" strokeWidth="1.5" fill="none" />
      <circle cx="412" cy="483" r="1.5" fill="#a855f7" />
      <circle cx="418" cy="483" r="1.5" fill="#a855f7" />
      <path d="M 411 487 Q 415 490 419 487" stroke="#a855f7" strokeWidth="1" fill="none" />
      <rect x="445" y="475" width="70" height="6" rx="3" fill="currentColor" fillOpacity="0.3" />
      <rect x="445" y="490" width="50" height="6" rx="3" fill="currentColor" fillOpacity="0.2" />
      <rect x="400" y="520" width="120" height="16" rx="8" fill="currentColor" fillOpacity="0.1" />
    </g>

    {/* Sparkles */}
    <circle cx="150" cy="150" r="4" fill="#14b8a6"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" /></circle>
    <circle cx="480" cy="250" r="3" fill="#a855f7"><animate attributeName="opacity" values="1;0.2;1" dur="3s" repeatCount="indefinite" /></circle>
    <circle cx="180" cy="650" r="5" fill="#3b82f6"><animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" /></circle>
    <circle cx="420" cy="120" r="2" fill="#ec4899"><animate attributeName="opacity" values="1;0.1;1" dur="2.5s" repeatCount="indefinite" /></circle>
  </svg>
);
