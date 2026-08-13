import React from 'react';

/* ─── Floating Wallet Hero (Login page) ─── */
export const WalletHeroIllustration = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow ring */}
    <circle cx="200" cy="200" r="160" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.3" />
    <circle cx="200" cy="200" r="130" stroke="url(#grad1)" strokeWidth="0.3" opacity="0.2" />
    {/* Orbiting coins */}
    <g className="animate-[spin_20s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
      <circle cx="200" cy="50" r="12" fill="url(#grad1)" opacity="0.6" />
      <text x="200" y="54" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">₹</text>
      <circle cx="350" cy="200" r="10" fill="url(#grad2)" opacity="0.5" />
      <text x="350" y="204" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
      <circle cx="200" cy="350" r="11" fill="url(#grad1)" opacity="0.4" />
      <text x="200" y="354" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">€</text>
      <circle cx="50" cy="200" r="9" fill="url(#grad2)" opacity="0.5" />
      <text x="50" y="204" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">¥</text>
    </g>
    {/* Central wallet */}
    <rect x="150" y="155" width="100" height="70" rx="12" fill="url(#grad1)" opacity="0.15" stroke="url(#grad1)" strokeWidth="1" />
    <rect x="155" y="160" width="90" height="60" rx="10" fill="url(#grad1)" opacity="0.08" />
    <rect x="200" y="170" width="40" height="20" rx="5" fill="url(#grad1)" opacity="0.3" />
    <circle cx="220" cy="180" r="6" fill="url(#grad1)" opacity="0.5" />
    {/* Card peeking out */}
    <rect x="160" y="145" width="60" height="38" rx="6" fill="url(#grad2)" opacity="0.2" stroke="url(#grad2)" strokeWidth="0.5" transform="rotate(-10 190 164)" />
    {/* Sparkles */}
    <circle cx="280" cy="120" r="2" fill="#14b8a6" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" /></circle>
    <circle cx="130" cy="280" r="1.5" fill="#a855f7" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" /></circle>
    <circle cx="310" cy="260" r="2" fill="#14b8a6" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" /></circle>
    <circle cx="100" cy="130" r="1.5" fill="#a855f7" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="3.5s" repeatCount="indefinite" /></circle>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#0d9488" /></linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#7e22ce" /></linearGradient>
    </defs>
  </svg>
);

/* ─── Empty State (no data) ─── */
export const EmptyStateIllustration = ({ className = '', message = 'No data yet' }) => (
  <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="url(#emptyGrad)" opacity="0.06" />
      <circle cx="60" cy="60" r="35" fill="url(#emptyGrad)" opacity="0.04" />
      {/* Clipboard */}
      <rect x="35" y="28" width="50" height="65" rx="8" fill="none" stroke="url(#emptyGrad)" strokeWidth="1.5" opacity="0.3" />
      <rect x="45" y="24" width="30" height="10" rx="5" fill="url(#emptyGrad)" opacity="0.2" />
      {/* Lines */}
      <line x1="45" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.1" strokeLinecap="round" />
      <line x1="45" y1="58" x2="68" y2="58" stroke="currentColor" strokeWidth="1" opacity="0.08" strokeLinecap="round" />
      <line x1="45" y1="66" x2="72" y2="66" stroke="currentColor" strokeWidth="1" opacity="0.06" strokeLinecap="round" />
      {/* Magnifying glass */}
      <circle cx="78" cy="78" r="10" fill="none" stroke="url(#emptyGrad)" strokeWidth="1.5" opacity="0.3" />
      <line x1="85" y1="85" x2="93" y2="93" stroke="url(#emptyGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      {/* Floating coins */}
      <circle cx="25" cy="45" r="4" fill="#14b8a6" opacity="0.15"><animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" /></circle>
      <circle cx="95" cy="40" r="3" fill="#a855f7" opacity="0.12"><animate attributeName="opacity" values="0.12;0.04;0.12" dur="4s" repeatCount="indefinite" /></circle>
      <defs>
        <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
      </defs>
    </svg>
    <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 font-medium">{message}</p>
  </div>
);

/* ─── AI Assistant Bot ─── */
export const AIBotIllustration = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Glow */}
    <circle cx="100" cy="100" r="80" fill="url(#aiGrad)" opacity="0.04" />
    {/* Body */}
    <rect x="65" y="80" width="70" height="60" rx="16" fill="url(#aiGrad)" opacity="0.12" stroke="url(#aiGrad)" strokeWidth="1" />
    {/* Head */}
    <circle cx="100" cy="65" r="28" fill="url(#aiGrad)" opacity="0.1" stroke="url(#aiGrad)" strokeWidth="1" />
    {/* Eyes */}
    <circle cx="90" cy="62" r="4" fill="#14b8a6" opacity="0.7"><animate attributeName="r" values="4;3;4" dur="3s" repeatCount="indefinite" /></circle>
    <circle cx="110" cy="62" r="4" fill="#14b8a6" opacity="0.7"><animate attributeName="r" values="4;3;4" dur="3s" repeatCount="indefinite" /></circle>
    {/* Smile */}
    <path d="M92 72 Q100 80 108 72" stroke="#14b8a6" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
    {/* Antenna */}
    <line x1="100" y1="37" x2="100" y2="28" stroke="url(#aiGrad)" strokeWidth="1.5" opacity="0.4" />
    <circle cx="100" cy="25" r="3" fill="#a855f7" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" /></circle>
    {/* Arms */}
    <line x1="65" y1="100" x2="45" y2="90" stroke="url(#aiGrad)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
    <line x1="135" y1="100" x2="155" y2="90" stroke="url(#aiGrad)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
    {/* Chart floating */}
    <rect x="140" y="75" width="35" height="25" rx="4" fill="url(#aiGrad)" opacity="0.08" stroke="url(#aiGrad)" strokeWidth="0.5" />
    <polyline points="145,92 150,88 155,90 160,84 165,86 170,82" stroke="#14b8a6" strokeWidth="1" fill="none" opacity="0.4" />
    <defs>
      <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
    </defs>
  </svg>
);

/* ─── Savings Piggy Bank ─── */
export const SavingsIllustration = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="url(#savGrad)" opacity="0.04" />
    {/* Piggy body */}
    <ellipse cx="100" cy="110" rx="45" ry="35" fill="url(#savGrad)" opacity="0.1" stroke="url(#savGrad)" strokeWidth="1" />
    {/* Snout */}
    <ellipse cx="140" cy="112" rx="10" ry="8" fill="url(#savGrad)" opacity="0.08" stroke="url(#savGrad)" strokeWidth="0.8" />
    <circle cx="138" cy="110" r="1.5" fill="#14b8a6" opacity="0.4" />
    <circle cx="143" cy="110" r="1.5" fill="#14b8a6" opacity="0.4" />
    {/* Eye */}
    <circle cx="125" cy="100" r="3" fill="#14b8a6" opacity="0.5" />
    {/* Ears */}
    <ellipse cx="85" cy="82" rx="8" ry="12" fill="url(#savGrad)" opacity="0.12" transform="rotate(-15 85 82)" />
    <ellipse cx="110" cy="80" rx="8" ry="12" fill="url(#savGrad)" opacity="0.12" transform="rotate(15 110 80)" />
    {/* Legs */}
    <rect x="72" y="135" width="10" height="15" rx="5" fill="url(#savGrad)" opacity="0.1" />
    <rect x="118" y="135" width="10" height="15" rx="5" fill="url(#savGrad)" opacity="0.1" />
    {/* Coin slot */}
    <rect x="92" y="75" width="16" height="3" rx="1.5" fill="#14b8a6" opacity="0.3" />
    {/* Falling coins */}
    <circle cx="100" cy="55" r="6" fill="url(#savGrad)" opacity="0.2" stroke="url(#savGrad)" strokeWidth="0.5">
      <animate attributeName="cy" values="45;75;45" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.05;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
    <text x="100" y="58" textAnchor="middle" fill="#14b8a6" fontSize="7" fontWeight="bold" opacity="0.5">₹</text>
    {/* Arrows up */}
    <path d="M155 70 L160 60 L165 70" stroke="#14b8a6" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
    <path d="M45 85 L50 75 L55 85" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.25" strokeLinecap="round" />
    {/* Target icons */}
    <circle cx="40" cy="120" r="8" fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.2" />
    <circle cx="40" cy="120" r="3" fill="#a855f7" opacity="0.15" />
    <defs>
      <linearGradient id="savGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
    </defs>
  </svg>
);

/* ─── Dashboard Charts Illustration ─── */
export const DashboardIllustration = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bar chart */}
    <rect x="20" y="70" width="12" height="40" rx="3" fill="#14b8a6" opacity="0.3" />
    <rect x="38" y="50" width="12" height="60" rx="3" fill="#14b8a6" opacity="0.4" />
    <rect x="56" y="60" width="12" height="50" rx="3" fill="#a855f7" opacity="0.3" />
    <rect x="74" y="35" width="12" height="75" rx="3" fill="#14b8a6" opacity="0.5" />
    <rect x="92" y="45" width="12" height="65" rx="3" fill="#a855f7" opacity="0.4" />
    {/* Pie chart */}
    <circle cx="150" cy="60" r="30" fill="none" stroke="#14b8a6" strokeWidth="8" strokeDasharray="60 188" opacity="0.4" />
    <circle cx="150" cy="60" r="30" fill="none" stroke="#a855f7" strokeWidth="8" strokeDasharray="45 188" strokeDashoffset="-60" opacity="0.3" />
    <circle cx="150" cy="60" r="30" fill="none" stroke="#ec4899" strokeWidth="8" strokeDasharray="35 188" strokeDashoffset="-105" opacity="0.25" />
    {/* Line */}
    <polyline points="20,80 45,65 70,72 95,48 120,55" stroke="url(#dashGrad)" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
    </defs>
  </svg>
);
