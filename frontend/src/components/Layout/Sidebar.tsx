import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Crosshair, Shield, CreditCard, Settings, 
  Activity, Database, Users, BarChart3, FileText,
  LogOut, X as XIcon
} from 'lucide-react';
import { useIsAuthenticated, useIsAdmin, useIsPremium } from '../../store/useStore';
import { useAuthActions } from '../../store/useStore';
import { cn } from '../../utils/cn';

// ============================================
// Sidebar Navigation Items
// ============================================

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
  premiumOnly?: boolean;
  children?: NavItem[];
}

const SIDEBAR_WIDTH = 280;

export const Sidebar: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  className?: string;
}> = ({ isOpen, onClose, className }) => {
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const isPremium = useIsPremium();
  const { logout } = useAuthActions();
  const location = useLocation();

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { path: '/dashboard', label: 'DASHBOARD', icon: Home },
    { path: '/sniper', label: 'SNIPE', icon: Crosshair, premiumOnly: true },
    { path: '/admin', label: 'ADMIN', icon: Shield, adminOnly: true },
    { path: '/payment', label: 'PAYMENT', icon: CreditCard },
  ];

  // System navigation items
  const systemNavItems: NavItem[] = [
    { path: '/dashboard/recordings', label: 'RECORDINGS', icon: Database },
    { path: '/dashboard/analytics', label: 'ANALYTICS', icon: BarChart3 },
    { path: '/dashboard/users', label: 'USERS', icon: Users, adminOnly: true },
    { path: '/dashboard/reports', label: 'REPORTS', icon: FileText },
    { path: '/dashboard/settings', label: 'SETTINGS', icon: Settings },
  ];

  // Filter navigation items based on user permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.premiumOnly && !isPremium) return false;
      
      if (item.children) {
        const filteredChildren = filterNavItems(item.children);
        return filteredChildren.length > 0;
      }
      
      return true;
    });
  };

  const filteredMainNav = filterNavItems(mainNavItems);
  const filteredSystemNav = filterNavItems(systemNavItems);

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
  };

  // Navigation item component
  const NavItemComponent: React.FC<{ item: NavItem; level?: number }> = ({ 
    item, 
    level = 0 
  }) => {
    const isActive = location.pathname === item.path || 
                    location.pathname.startsWith(item.path + '/');
    
    return (
      <NavLink
        to={item.path}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
          'hover:bg-bg-card-hover border border-transparent',
          isActive 
            ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' 
            : 'text-text-secondary hover:text-brand-secondary',
          level > 0 ? 'pl-8' : '',
          'group relative overflow-hidden'
        )}
      >
        {/* Icon */}
        <item.icon className={cn(
          'w-5 h-5 transition-colors',
          isActive ? 'text-brand-primary' : 'text-text-secondary group-hover:text-brand-primary'
        )} />
        
        {/* Label */}
        <motion.span
          className={cn(
            'font-mono text-sm font-medium tracking-wide',
            isActive ? 'text-brand-primary' : 'text-text-secondary'
          )}
        >
          {item.label}
        </motion.span>
        
        {/* Badge */}
        {item.badge && (
          <motion.span
            className="ml-auto px-2 py-1 text-xs font-mono bg-brand-accent/20 text-brand-accent rounded"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {item.badge}
          </motion.span>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"
            layoutId="activeTab"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          />
        )}
      </NavLink>
    );
  };

  // Sidebar content
  const sidebarContent = (
    <motion.div
      className="flex flex-col h-full bg-bg-secondary border-r border-border-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-primary">
        <motion.div
          className="flex items-center gap-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center">
            <span className="text-black font-display font-bold text-sm">COS</span>
          </div>
          <span className="text-brand-primary font-display text-lg tracking-wider">
            CIPHER_OS
          </span>
        </motion.div>
        
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 rounded-md hover:bg-bg-card transition-colors"
        >
          <XIcon className="w-5 h-5 text-brand-primary" />
        </motion.button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Main Navigation */}
        <motion.div
          className="p-4 space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xs text-text-muted font-mono tracking-widest mb-4 uppercase">
            Primary
          </h3>
          <nav className="space-y-1">
            {filteredMainNav.map((item, index) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </nav>
        </motion.div>

        {/* System Navigation */}
        <motion.div
          className="p-4 space-y-2 border-t border-border-primary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xs text-text-muted font-mono tracking-widest mb-4 uppercase">
            System
          </h3>
          <nav className="space-y-1">
            {filteredSystemNav.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </nav>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="p-4 border-t border-border-primary"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* User info */}
        {isAuthenticated && (
          <div className="mb-4 p-3 bg-bg-card rounded-lg border border-border-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                <span className="text-brand-primary font-mono font-bold">
                  {isAdmin ? 'ADM' : isPremium ? 'PRO' : 'USR'}
                </span>
              </div>
              <div>
                <p className="text-brand-primary font-mono text-sm">
                  {isAdmin ? 'Administrator' : isPremium ? 'Premium User' : 'Standard User'}
                </p>
                <p className="text-text-muted text-xs font-mono">
                  Access Level: {isAdmin ? 'ALPHA' : isPremium ? 'BETA' : 'GAMMA'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-error/10 border border-brand-error/20 text-brand-error hover:bg-brand-error/20 transition-colors font-mono text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>TERMINATE_SESSION</span>
        </motion.button>

        {/* Version */}
        <p className="text-xs text-text-muted font-mono text-center mt-4 tracking-wider">
          v2.0.0 - PRODUCTION
        </p>
      </motion.div>
    </motion.div>
  );

  // Render sidebar with animations
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -SIDEBAR_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: -SIDEBAR_WIDTH }}
            className={cn(
              'fixed top-0 left-0 z-[200] h-full w-[280px]',
              className
            )}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
