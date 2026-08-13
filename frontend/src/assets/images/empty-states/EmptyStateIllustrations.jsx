import React from 'react';

// Common Gradient Defs
const GradientDefs = () => (
  <defs>
    <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#14b8a6" />
      <stop offset="100%" stopColor="#a855f7" />
    </linearGradient>
    <linearGradient id="emptyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
    </linearGradient>
  </defs>
);

// Helper for the container
const EmptyStateContainer = ({ children, message, className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
      {/* Background glow for all empty states */}
      <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-2xl animate-pulse-soft" />
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <GradientDefs />
        {children}
      </svg>
    </div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center max-w-sm">{message}</p>
  </div>
);

// 1. Generic Empty State
export const EmptyStateDefault = ({ message }) => (
  <EmptyStateContainer message={message}>
    <circle cx="80" cy="80" r="60" fill="url(#emptyBg)" opacity="0.3" />
    <rect x="50" y="40" width="60" height="80" rx="8" fill="none" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.5" />
    <circle cx="100" cy="100" r="14" fill="none" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.5" />
    <line x1="110" y1="110" x2="120" y2="120" stroke="url(#emptyGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <circle cx="40" cy="60" r="6" fill="#14b8a6" opacity="0.3" className="animate-[float_3s_ease-in-out_infinite]" />
    <circle cx="120" cy="50" r="4" fill="#a855f7" opacity="0.3" className="animate-[float_4s_ease-in-out_infinite_1s]" />
  </EmptyStateContainer>
);

// 2. Expenses Empty State
export const EmptyStateExpenses = ({ message }) => (
  <EmptyStateContainer message={message}>
    <circle cx="80" cy="80" r="60" fill="url(#emptyBg)" opacity="0.3" />
    {/* Receipt Graphic */}
    <path d="M50 30 L110 30 L110 130 L100 120 L90 130 L80 120 L70 130 L60 120 L50 130 Z" fill="currentColor" fillOpacity="0.05" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.8" />
    <line x1="65" y1="55" x2="95" y2="55" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
    <line x1="65" y1="75" x2="85" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
    <circle cx="65" cy="100" r="15" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.6" />
    <path d="M60 100 L70 100 M65 95 L65 105" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="120" cy="40" r="8" fill="#14b8a6" opacity="0.4" className="animate-[float_3s_ease-in-out_infinite]" />
  </EmptyStateContainer>
);

// 3. Savings Goals Empty State
export const EmptyStateSavings = ({ message }) => (
  <EmptyStateContainer message={message}>
    <circle cx="80" cy="80" r="60" fill="url(#emptyBg)" opacity="0.3" />
    {/* Target Graphic */}
    <circle cx="80" cy="80" r="40" fill="currentColor" fillOpacity="0.05" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.6" />
    <circle cx="80" cy="80" r="25" fill="none" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.6" />
    <circle cx="80" cy="80" r="10" fill="url(#emptyGrad)" opacity="0.8" />
    {/* Arrow */}
    <path d="M120 40 L85 75" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" className="animate-[float_2s_ease-in-out_infinite]" />
    <path d="M105 40 L120 40 L120 55" stroke="#ec4899" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-[float_2s_ease-in-out_infinite]" />
  </EmptyStateContainer>
);

// 4. Investments Empty State
export const EmptyStateInvestments = ({ message }) => (
  <EmptyStateContainer message={message}>
    <circle cx="80" cy="80" r="60" fill="url(#emptyBg)" opacity="0.3" />
    {/* Chart Graphic */}
    <rect x="40" y="40" width="80" height="80" rx="8" fill="currentColor" fillOpacity="0.05" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.6" />
    <path d="M50 100 L70 70 L90 85 L110 50" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="110" cy="50" r="4" fill="#14b8a6" />
    <path d="M100 50 L110 50 L110 60" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="55" y="80" width="10" height="20" rx="2" fill="#a855f7" opacity="0.4" className="animate-[pulse_2s_infinite]" />
    <rect x="75" y="60" width="10" height="40" rx="2" fill="#a855f7" opacity="0.4" className="animate-[pulse_2s_infinite_0.5s]" />
    <rect x="95" y="40" width="10" height="60" rx="2" fill="#a855f7" opacity="0.4" className="animate-[pulse_2s_infinite_1s]" />
  </EmptyStateContainer>
);

// 5. Bills Empty State
export const EmptyStateBills = ({ message }) => (
  <EmptyStateContainer message={message}>
    <circle cx="80" cy="80" r="60" fill="url(#emptyBg)" opacity="0.3" />
    {/* Calendar/Bill Graphic */}
    <rect x="50" y="45" width="60" height="70" rx="8" fill="currentColor" fillOpacity="0.05" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.6" />
    <line x1="50" y1="65" x2="110" y2="65" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.6" />
    <rect x="65" y="35" width="10" height="20" rx="3" fill="#ec4899" opacity="0.8" />
    <rect x="85" y="35" width="10" height="20" rx="3" fill="#ec4899" opacity="0.8" />
    <circle cx="80" cy="90" r="12" fill="none" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
    <path d="M76 90 L80 94 L86 86" stroke="#14b8a6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </EmptyStateContainer>
);

// 6. Reports Empty State
export const EmptyStateReports = ({ message }) => (
  <EmptyStateContainer message={message}>
    <circle cx="80" cy="80" r="60" fill="url(#emptyBg)" opacity="0.3" />
    {/* Pie Chart / Doc Graphic */}
    <rect x="45" y="35" width="70" height="90" rx="8" fill="currentColor" fillOpacity="0.05" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.6" />
    <circle cx="80" cy="70" r="18" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="80 113" opacity="0.8" />
    <circle cx="80" cy="70" r="18" fill="none" stroke="#a855f7" strokeWidth="6" strokeDasharray="33 113" strokeDashoffset="-80" opacity="0.8" />
    <line x1="60" y1="105" x2="100" y2="105" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
    <line x1="60" y1="115" x2="90" y2="115" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
  </EmptyStateContainer>
);

// 7. Notifications Empty State
export const EmptyStateNotifications = ({ message }) => (
  <EmptyStateContainer message={message}>
    <circle cx="80" cy="80" r="60" fill="url(#emptyBg)" opacity="0.3" />
    {/* Bell Graphic */}
    <path d="M60 90 Q60 50 80 50 T100 90 L110 100 L50 100 Z" fill="currentColor" fillOpacity="0.05" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.8" />
    <path d="M72 105 Q80 115 88 105" stroke="url(#emptyGrad)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    {/* Zzz marks for 'nothing new' */}
    <path d="M110 40 L125 40 L115 55 L130 55" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" className="animate-[pulse_3s_infinite]" />
    <path d="M40 50 L50 50 L42 60 L52 60" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" className="animate-[pulse_3s_infinite_1s]" />
  </EmptyStateContainer>
);
