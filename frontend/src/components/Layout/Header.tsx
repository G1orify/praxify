import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X as XIcon, Satellite, User, LogOut, Sun, Moon, 
  Bell, Settings, Search, Home, Activity,
  CreditCard, Shield
} from 'lucide-react';
import { useIsAuthenticated, useUser, useIsPremium, useIsAdmin } from '../../store/useStore';
import { useAuthActions, useUiActions } from '../../store/useStore';
import { cn } from '../../utils/cn';
import { Link, useLocation } from 'react-router-dom';

// ============================================
// Header Component
// ============================================

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen, className }) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const isPremium = useIsPremium();
  const isAdmin = useIsAdmin();
  const { logout } = useAuthActions();
  const { toggleTheme, setTheme, toggleSidebar } = useUiActions();
  const location = useLocation();
  
  const [scrolled, setScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [time, setTime] = useState<string>('');
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sidebar toggle
  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'DASHBOARD', icon: Home },
    { path: '/sniper', label: 'SNIPE', icon: Crosshair },
    { path: '/admin', label: 'ADMIN', icon: Shield, adminOnly: true },
    { path: '/payment', label: 'PAYMENT', icon: CreditCard },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-[200] flex items-center justify-between',
        'bg-bg-primary/80 backdrop-blur-lg border-b border-border-primary',
        scrolled ? 'shadow-lg' : '',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4 px-4 lg:px-6 h-20">
        {/* Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMenuClick}
          className="p-2 rounded-md border border-border-primary hover:bg-bg-card transition-colors"
        >
          {sidebarOpen ? (
            <XIcon className="w-5 h-5 text-brand-primary" />
          ) : (
            <Menu className="w-5 h-5 text-brand-primary" />
          )}
        </motion.button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <Satellite className="w-8 h-8 text-brand-primary" />
            <motion.span
              className="absolute -top-1 -right-1 w-3 h-3 bg-brand-primary rounded-full border-2 border-bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-display text-brand-primary tracking-wider">
              CIPHER_OS
            </h1>
            <p className="text-xs text-text-muted font-mono">v2.0.0</p>
          </div>
        </Link>

        {/* System Time */}
        <div className="hidden lg:flex items-center gap-2">
          <motion.div
            className="w-1 h-6 bg-brand-primary rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-brand-primary font-mono text-sm">
            {time}
          </span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 pr-4 lg:pr-6">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleThemeToggle}
          className="p-2 rounded-md border border-border-primary hover:bg-bg-card transition-colors hidden sm:flex"
          title="Toggle Theme"
        >
          <Sun className="w-5 h-5 text-brand-secondary" />
          <Moon className="w-5 h-5 text-brand-primary absolute" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-md border border-border-primary hover:bg-bg-card transition-colors hidden sm:flex"
          onClick={() => setNotifications([])}
        >
          <Bell className="w-5 h-5 text-brand-primary" />
          {notifications.length > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent rounded-full text-xs font-mono text-white flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {notifications.length}
            </motion.span>
          )}
        </motion.button>

        {/* User Menu */}
        <AnimatePresence>
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2"
            >
              {/* Premium Badge */}
              {isPremium && (
                <motion.span
                  className="hidden md:block px-2 py-1 bg-brand-success/20 text-brand-success border border-brand-success/30 rounded text-xs font-mono"
                  animate={{ boxShadow: ['0 0 0 0 rgba(0, 255, 136, 0.4)', '0 0 0 10px rgba(0, 255, 136, 0)', '0 0 0 0 rgba(0, 255, 136, 0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  PREMIUM
                </motion.span>
              )}

              {/* User Avatar */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md border border-border-primary">
                <User className="w-5 h-5 text-brand-secondary" />
                <span className="text-text-primary font-mono text-sm">
                  {user?.username}
                </span>
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 rounded-md border border-brand-error/50 hover:bg-brand-error/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-brand-error" />
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
