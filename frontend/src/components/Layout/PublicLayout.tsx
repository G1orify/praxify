import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import Header from './Header';

// ============================================
// Public Layout Component (Unauthenticated Layout)
// ============================================

const PublicLayout: React.FC = () => {
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header - Public version */}
      <Header />

      {/* Main Content */}
      <motion.main
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          'min-h-[calc(100vh-80px)]',
          'flex flex-col'
        )}
      >
        {/* Content Wrapper */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 text-center">
          <p className="text-xs text-text-muted font-mono tracking-wider">
            [ CIPHER_OS v2.0.0 | PRODUCTION READY ]
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

// ============================================
// Simple Public Layout (for full-screen pages like Landing)
// ============================================

export const SimplePublicLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg-primary">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {/* Scanner Line Effect */}
      <div className="scanner-line" />
      
      {/* Data Stream Effect */}
      <div className="data-stream" />
    </div>
  );
};

export default PublicLayout;
