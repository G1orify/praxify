import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Satellite } from 'lucide-react';
import { cn } from '../utils/cn';

// ============================================
// Loading Screen Component
// ============================================

interface LoadingScreenProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
  showSpinner?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'loading',
  className,
  fullScreen = true,
  showSpinner = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen ? 'fixed inset-0 z-[1000]' : 'min-h-[200px]',
        'bg-bg-primary',
        className
      )}
    >
      {/* Scanner Line Effect */}
      <div className="scanner-line" />
      
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {/* Logo / Icon */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Satellite className="w-16 h-16 text-brand-primary" />
          <motion.div
            className="absolute inset-0 border-2 border-brand-primary rounded-full"
            style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.p
          className="text-brand-primary font-mono text-lg tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {message}
        </motion.p>

        {/* Spinner */}
        {showSpinner && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Loader2 className="w-6 h-6 text-brand-secondary animate-spin" />
            <span className="text-text-secondary font-mono text-sm">
              initializing_system...
            </span>
          </motion.div>
        )}

        {/* Progress Bar */}
        <motion.div
          className="w-64 h-1 bg-bg-secondary rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: 256 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>

      {/* Data Stream Background */}
      <div className="data-stream" />
    </motion.div>
  );
};

// ============================================
// Small Spinner Component
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={cn(
        sizeClasses[size] || `w-[${size}px] h-[${size}px]`,
        'animate-spin text-brand-primary',
        className
      )}
    />
  );
};

// ============================================
// Skeleton Loader Component
// ============================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'rectangular',
}) => {
  const baseClasses = 'bg-skeleton animate-pulse';
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? height : '100%'),
    height: height || (variant === 'circular' ? width : '1rem'),
    ...(variant === 'circular' && { aspectRatio: '1/1' }),
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

// ============================================
// Loading Overlay Component
// ============================================

interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  message = 'Loading...',
}) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        className="flex flex-col items-center gap-4 bg-bg-card p-6 rounded-lg border border-border-primary shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Spinner size="lg" />
        <span className="text-text-primary font-mono">{message}</span>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// Export
// ============================================

export default LoadingScreen;
