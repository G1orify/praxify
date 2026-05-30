import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Satellite, User, Lock, Eye, EyeOff, ArrowRight, 
  ShieldCheck, AlertCircle, Loader2, X
} from 'lucide-react';
import { useAuthActions, useAuth, useIsAuthenticated } from '../store/useStore';
import { cn } from '../utils/cn';
import { Spinner } from '../components/LoadingScreen';

// ============================================
// Login Page Component
// ============================================

interface InputFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPasswordToggle?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  error,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative flex items-center">
        <span className="absolute left-4 text-text-muted">
          <Icon className="w-5 h-5" />
        </span>
        <input
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full pl-12 pr-12 py-4 bg-bg-card/50 border rounded-lg',
            'font-mono text-text-primary placeholder:text-text-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
            isFocused 
              ? 'border-brand-primary/30' 
              : error 
                ? 'border-brand-error/50' 
                : 'border-border-primary'
          )}
        />
        {showPasswordToggle && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-text-muted hover:text-brand-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </motion.button>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-brand-error font-mono text-xs tracking-wide"
        >
          [ {error} ]
        </motion.p>
      )}
    </motion.div>
  );
};

// ============================================
// Form Error Display
// ============================================

interface FormErrorProps {
  message: string;
  onDismiss: () => void;
}

const FormError: React.FC<FormErrorProps> = ({ message, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-brand-error/10 border border-brand-error/30 rounded-lg mb-6"
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0" />
        <div className="flex-1">
          <p className="text-brand-error font-mono text-sm">{message}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDismiss}
          className="text-brand-error hover:text-brand-error/70 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================
// Success Message
// ============================================

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-4 bg-brand-success/10 border border-brand-success/30 rounded-lg mb-6"
    >
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-success flex-shrink-0" />
        <p className="text-brand-success font-mono text-sm">{message}</p>
      </div>
    </motion.div>
  );
};

// ============================================
// Login Page
// ============================================

const LoginPage: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { login, clearAuthError } = useAuthActions();
  const auth = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearAuthError();
      setLocalError(null);
    };
  }, [clearAuthError]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setLocalError('Username and password are required');
      return;
    }

    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);
      
      await login(username, password);
      
      // If we get here, login succeeded
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      const message = error.message || error.toString() || 'Login failed';
      setLocalError(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle dismiss error
  const handleDismissError = () => {
    setLocalError(null);
    clearAuthError();
  };

  // Handle input validation
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (localError) setLocalError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (localError) setLocalError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background Effects */}
      <div className="scanner-line" />
      <div className="data-stream" />

      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="relative inline-block mb-6"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          >
            <Satellite className="w-16 h-16 text-brand-primary" />
            <motion.div
              className="absolute inset-0 border-2 border-brand-primary/30 rounded-full"
              style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
          
          <h1 className="text-3xl font-display text-brand-primary tracking-wider mb-2">
            CIPHER_OS
          </h1>
          <p className="text-text-secondary font-mono text-sm tracking-widest">
            // AUTHENTICATION_REQUIRED
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          className="p-8 rounded-xl border border-border-primary bg-bg-card/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="text-xl font-display text-brand-primary text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            [ ESTABLISH_CONNECTION ]
          </motion.h2>

          {/* Error Message */}
          <AnimatePresence>
            {(localError || auth.error) && (
              <FormError
                message={localError || auth.error || ''}
                onDismiss={handleDismissError}
              />
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <SuccessMessage message="Connection established. Redirecting..." />
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={User}
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={handleUsernameChange}
              error={!username && localError ? 'Username is required' : undefined}
            />

            <InputField
              icon={Lock}
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={handlePasswordChange}
              showPasswordToggle
              error={!password && localError ? 'Password is required' : undefined}
            />

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || auth.isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-display font-semibold tracking-wider rounded-lg overflow-hidden transition-all flex items-center justify-center gap-2"
            >
              {loading || auth.isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>CONNECTING...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>AUTHENTICATE</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
              <div className="absolute inset-0 bg-white/20" />
            </motion.button>
          </form>

          {/* Forgot Password */}
          <motion.p
            className="text-center mt-6 text-text-muted font-mono text-xs tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            [ <Link to="/forgot" className="text-brand-primary hover:text-brand-secondary">FORGOT_PASSWORD</Link> ]
          </motion.p>

          {/* Sign Up Link */}
          <motion.p
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-text-muted font-mono text-sm">
              NEW_OPERATIVE? 
            </span>
            <Link
              to="/signup"
              className="text-brand-primary font-display text-sm hover:text-brand-secondary transition-colors"
            >
              REQUEST_ACCESS
            </Link>
          </motion.p>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center mt-8 text-text-muted/50 font-mono text-xs tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          [ SECURE_CONNECTION | ENCRYPTED_TRANSFER ]
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
