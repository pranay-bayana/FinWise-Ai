import React from 'react';

export const AIAssistantHero = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aiHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="aiHeroGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
      <filter id="aiHeroBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" />
      </filter>
    </defs>
    
    {/* Background Ambient Glow */}
    <circle cx="200" cy="150" r="100" fill="url(#aiHeroGrad)" filter="url(#aiHeroBlur)" opacity="0.3" className="animate-[pulse_4s_infinite]" />
    
    {/* AI Brain/Core Graphic */}
    <g className="animate-[float_6s_ease-in-out_infinite]" style={{ transformOrigin: '200px 150px' }}>
      {/* Outer Rings */}
      <circle cx="200" cy="150" r="60" fill="none" stroke="url(#aiHeroGrad)" strokeWidth="1" strokeDasharray="5 10" opacity="0.5" className="animate-[spin_20s_linear_infinite]" />
      <circle cx="200" cy="150" r="70" fill="none" stroke="url(#aiHeroGrad)" strokeWidth="0.5" strokeDasharray="10 20" opacity="0.3" className="animate-[spin_30s_linear_infinite_reverse]" style={{ transformOrigin: '200px 150px' }} />
      
      {/* Central Bot Face */}
      <rect x="160" y="120" width="80" height="60" rx="20" fill="currentColor" fillOpacity="0.05" stroke="url(#aiHeroGrad)" strokeWidth="2" filter="drop-shadow(0 0 10px rgba(20,184,166,0.3))" />
      <path d="M 180 145 Q 185 140 190 145" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 210 145 Q 215 140 220 145" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      <circle cx="185" cy="155" r="4" fill="#8b5cf6" />
      <circle cx="215" cy="155" r="4" fill="#8b5cf6" />
      
      {/* Antenna */}
      <line x1="200" y1="120" x2="200" y2="100" stroke="url(#aiHeroGrad)" strokeWidth="2" />
      <circle cx="200" cy="95" r="5" fill="#ec4899" filter="url(#aiHeroGlow)" className="animate-[pulse_2s_infinite]" />
      
      {/* Network Nodes */}
      <circle cx="120" cy="100" r="6" fill="#14b8a6" opacity="0.8" />
      <line x1="160" y1="130" x2="125" y2="105" stroke="#14b8a6" strokeWidth="1" opacity="0.4" />
      
      <circle cx="280" cy="100" r="8" fill="#8b5cf6" opacity="0.8" />
      <line x1="240" y1="130" x2="275" y2="105" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" />
      
      <circle cx="130" cy="220" r="7" fill="#ec4899" opacity="0.8" />
      <line x1="170" y1="175" x2="135" y2="215" stroke="#ec4899" strokeWidth="1" opacity="0.4" />
      
      <circle cx="270" cy="210" r="5" fill="#14b8a6" opacity="0.8" />
      <line x1="230" y1="175" x2="265" y2="205" stroke="#14b8a6" strokeWidth="1" opacity="0.4" />
    </g>

    {/* Sparkles */}
    <circle cx="90" cy="150" r="3" fill="#14b8a6"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" /></circle>
    <circle cx="320" cy="180" r="4" fill="#8b5cf6"><animate attributeName="opacity" values="1;0.2;1" dur="3s" repeatCount="indefinite" /></circle>
    <circle cx="200" cy="50" r="2" fill="#ec4899"><animate attributeName="opacity" values="1;0.1;1" dur="2.5s" repeatCount="indefinite" /></circle>
  </svg>
);
