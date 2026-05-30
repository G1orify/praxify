import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Home, ArrowLeft, 
  Search, Satellite, Terminal
} from 'lucide-react';
import { cn } from '../utils/cn';

// ============================================
// Not Found Page Component
// ============================================

const NotFoundPage: React.FC = () => {
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [glitch, setGlitch] = useState(false);

  // Typing effect
  const messages = [
    'PAGE_NOT_FOUND',
    '404_ERROR',
    'ACCESS_DENIED',
    'INVALID_ROUTE'
  ];
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    let i = 0;
    const message = messages[currentMessage];
    const typing = setInterval(() => {
      if (i < message.length) {
        setTypingText(message.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
        // Blink cursor
        const blink = setInterval(() => {
          setShowCursor(prev => !prev);
        }, 500);
        
        // Change message every 3 seconds
        const change = setInterval(() => {
          setCurrentMessage(prev => (prev + 1) % messages.length);
          setTypingText('');
          i = 0;
          clearInterval(blink);
        }, 3000);
        
        return () => {
          clearInterval(blink);
          clearInterval(change);
        };
      }
    }, 100);
    return () => clearInterval(typing);
  }, [currentMessage]);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Error code display
  const errorCode = '404';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="scanner-line" />
      <div className="data-stream" />

      <motion.div
        className="text-center max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Error Code */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            boxShadow: [
              '0 0 20px rgba(255, 0, 85, 0.3)',
              '0 0 40px rgba(255, 0, 85, 0.5)',
              '0 0 20px rgba(255, 0, 85, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.h1
            className={cn(
              'text-7xl sm:text-8xl lg:text-9xl font-display',
              glitch ? 'text-brand-error' : 'text-brand-accent'
            )}
            animate={glitch ? { 
              x: [0, -5, 5, 0],
              color: ['#ff0055', '#ffffff', '#ff0055'],
              textShadow: [
                '0 0 10px #ff0055',
                '0 0 20px #ffffff',
                '0 0 10px #ff0055'
              ]
            } : {}}
            transition={{ duration: 0.1 }}
          >
            {errorCode}
          </motion.h1>
        </motion.div>

        {/* Icon */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AlertTriangle className="w-16 h-16 text-brand-error mx-auto" />
        </motion.div>

        {/* Message */}
        <motion.h2
          className="text-xl sm:text-2xl font-display text-brand-primary mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {typingText}
          <motion.span
            className="inline-block w-1 h-6 bg-brand-error"
            animate={{ opacity: showCursor ? 1 : 0 }}
          />
        </motion.h2>

        {/* Submessage */}
        <motion.p
          className="text-text-secondary font-mono text-sm sm:text-base mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          THE_REQUESTED_RESOURCE_COULD_NOT_BE_FOUND
        </motion.p>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/"
            className="group px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-display font-semibold tracking-wider rounded-lg overflow-hidden transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>RETURN_HOME</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            <div className="absolute inset-0 bg-white/20" />
          </Link>

          <Link
            to="/dashboard"
            className="group px-8 py-4 border-2 border-border-primary hover:border-brand-primary/50 text-brand-primary font-mono tracking-wider rounded-lg transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>GO_BACK</span>
          </Link>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-text-muted font-mono text-xs tracking-wider mb-4">
            TRY_ONE_OF_THESE:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[ '/', '/dashboard', '/login', '/sniper', '/admin' ].map((path, index) => (
              <motion.a
                key={path}
                href={path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 bg-bg-card/50 border border-border-primary rounded-lg font-mono text-xs hover:border-brand-primary/30 transition-colors"
              >
                {path}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Terminal Effect */}
        <motion.div
          className="mt-16 p-4 bg-bg-card/30 border border-border-primary rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-primary" />
            <span className="text-brand-primary font-mono text-xs">
              ERROR: 404
            </span>
          </div>
          <motion.p
            className="text-text-muted font-mono text-xs mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            Resource not found on this server
          </motion.p>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-text-muted/50 font-mono text-xs mt-16 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          [ CIPHER_OS v2.0.0 | ALL_SYSTEMS_OPERATIONAL ]
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
