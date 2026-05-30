import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { useSidebarOpen, useUiActions } from '../../store/useStore';
import { cn } from '../../utils/cn';
import Header from './Header';
import Sidebar from './Sidebar';

// ============================================
// Layout Component (Authenticated Layout)
// ============================================

const Layout: React.FC = () => {
  const sidebarOpen = useSidebarOpen();
  const { setSidebarOpen, toggleSidebar } = useUiActions();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  // Initialize
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  // Close sidebar
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 200,
        delay: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <Header 
        onMenuClick={handleSidebarToggle} 
        sidebarOpen={sidebarOpen} 
        className="lg:pl-[280px]"
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
        className="hidden lg:block"
      />
      
      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
        className="lg:hidden"
      />

      {/* Main Content */}
      <motion.main
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          'pt-20 pb-8 min-h-[calc(100vh-80px)]',
          'lg:pl-[280px]',
          'flex flex-col'
        )}
      >
        {/* Content Wrapper */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 text-center lg:pl-[280px]">
          <p className="text-xs text-text-muted font-mono tracking-wider">
            [ CIPHER_OS v2.0.0 | PRODUCTION READY | ALL SYSTEMS OPERATIONAL ]
          </p>
        </footer>
      </motion.main>

      {/* Scanner Line Effect */}
      <div className="scanner-line" />
      
      {/* Data Stream Effect */}
      <div className="data-stream" />
    </div>
  );
};

export default Layout;
