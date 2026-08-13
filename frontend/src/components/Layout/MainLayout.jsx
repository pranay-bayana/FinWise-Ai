import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wallet, TrendingUp, Car, Landmark,
  BarChart3, Bell, Settings, LogOut, Menu, X, Moon, Sun,
  WalletCards, Target, LineChart, ReceiptText, FileText,
  Bot, Shield, Plus, Home, PieChart
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { isAdminUser } from '../../utils/adminAccess';
import { AnimatedBackground } from '../../assets/images/backgrounds/AnimatedBackground.jsx';

const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const isAdmin = isAdminUser(user);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navGroups = [
    { title: 'Overview', items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Reports', href: '/reports', icon: FileText },
    ]},
    { title: 'Money', items: [
      { name: 'Expenses', href: '/expenses', icon: Wallet },
      { name: 'Income', href: '/income', icon: TrendingUp },
      { name: 'Budgets', href: '/budgets', icon: WalletCards },
    ]},
    { title: 'Goals & Assets', items: [
      { name: 'Savings', href: '/savings-goals', icon: Target },
      { name: 'Investments', href: '/investments', icon: LineChart },
      { name: 'Loans', href: '/loans', icon: Landmark },
    ]},
    { title: 'More', items: [
      { name: 'Vehicles', href: '/vehicles', icon: Car },
      { name: 'Bills', href: '/bills', icon: ReceiptText },
      { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    ]},
    { title: 'Account', items: [
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Settings', href: '/settings', icon: Settings },
      ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
    ]},
  ];

  const bottomTabs = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Spend', href: '/expenses', icon: Wallet },
    null,
    { name: 'Insights', href: '/analytics', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <AnimatedBackground />

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 glass-header">
        <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors" aria-label="Open menu">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-glow">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block tracking-tight">FinWise</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all" aria-label="Toggle theme">
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <Link to="/notifications" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <Link to="/settings" className="ml-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center ring-2 ring-white/20">
                <span className="text-xs font-bold text-white">{(user?.fullName || user?.full_name || 'U').charAt(0).toUpperCase()}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[80vw] bg-white dark:bg-[#0d1220] border-r border-gray-200/50 dark:border-white/[0.05] shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                    <Wallet className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">FinWise AI</h2>
                    <p className="text-[10px] text-gray-400">Smart Finance</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-2 menu-scrollbar">
                {navGroups.map((group, gi) => (
                  <div key={group.title} className={cn('px-3', gi > 0 && 'mt-1')}>
                    <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">{group.title}</p>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link key={item.name} to={item.href} className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200',
                          isActive ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white'
                        )}>
                          <item.icon className={cn('w-[18px] h-[18px]', isActive && 'text-primary-500')} />
                          {item.name}
                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-gray-100 dark:border-white/[0.05]">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{(user?.fullName || user?.full_name || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.fullName || user?.full_name || 'User'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 mt-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="relative z-10 pt-16 pb-20 md:pb-6 px-3 md:px-5 lg:px-8 max-w-screen-2xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Tab Bar (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-bottom safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {bottomTabs.map((tab, i) => {
            if (!tab) {
              return (
                <Link key="fab" to="/expenses" className="relative -mt-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 ring-4 ring-background dark:ring-background-dark">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                </Link>
              );
            }
            const isActive = location.pathname === tab.href;
            return (
              <Link key={tab.name} to={tab.href} className={cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors', isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500')}>
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </Link>
            );
          })}
          <button onClick={() => setMenuOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-gray-400 dark:text-gray-500 transition-colors">
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
