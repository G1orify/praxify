import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Cpu, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCaptchaToken(null);
      const renderTurnstile = () => {
        if ((window as any).turnstile && widgetRef.current) {
          try {
            if (widgetId.current) {
              (window as any).turnstile.remove(widgetId.current);
              widgetId.current = null;
            }
            
            widgetId.current = (window as any).turnstile.render(widgetRef.current, {
              sitekey: '0x4AAAAAADZG6f2ROqJOuI5m',
              theme: 'dark',
              callback: (token: string) => {
                setCaptchaToken(token);
              },
              'error-callback': () => {
                showToast("Verification Error", 'error');
              },
              'expired-callback': () => {
                setCaptchaToken(null);
                showToast("Verification expired", 'info');
              }
            });
          } catch (e) {
            console.error("Turnstile error:", e);
          }
        }
      };

      const timer = setTimeout(renderTurnstile, 200);
      return () => {
        clearTimeout(timer);
        if (widgetId.current && (window as any).turnstile) {
          (window as any).turnstile.remove(widgetId.current);
          widgetId.current = null;
        }
      };
    }
  }, [isOpen, mode, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      showToast("Please complete the human verification", 'error');
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const res = await api.post(endpoint, { username, password, captchaToken });
      
      if (res.data.success) {
        if (mode === 'signup') {
          showToast(res.data.message || "Account created. Please login.", 'success');
          setMode('login');
          setUsername('');
          setPassword('');
          if (widgetId.current) (window as any).turnstile.reset(widgetId.current);
        } else {
          login(res.data.token);
          onClose();
          showToast(`Uplink Established: ${username}`, 'success');
        }
      } else {
        showToast(res.data.error || "Auth failed", 'error');
        if (widgetId.current) (window as any).turnstile.reset(widgetId.current);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Network error", 'error');
      if (widgetId.current) (window as any).turnstile.reset(widgetId.current);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div 
            className="auth-box"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{ 
              width: '100%', 
              maxWidth: '450px', 
              padding: '50px', 
              border: '2px solid #fff',
              boxShadow: '20px 20px 0px rgba(255,255,255,0.1)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '-10px', left: '20px', background: '#fff', color: '#000', padding: '2px 10px', fontSize: '0.6rem', fontWeight: 900 }}>
              <Cpu size={10} style={{ marginRight: '5px' }} /> SECURE_UPLINK_v4
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '4px', fontSize: '1.4rem', fontWeight: 900 }}>{mode} // AUTH</h3>
              <X cursor="pointer" onClick={onClose} size={24} />
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
              <button 
                type="button"
                className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
                style={{ flex: 1, padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <LogIn size={16} /> LOGIN
              </button>
              <button 
                type="button"
                className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => setMode('signup')}
                style={{ flex: 1, padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <UserPlus size={16} /> SIGNUP
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ marginBottom: '25px' }}>
                <input 
                  type="text" 
                  placeholder="IDENTIFICATION / USERNAME" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  autoComplete="username"
                  style={{ padding: '18px', border: '1px solid #444' }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '35px' }}>
                <input 
                  type="password" 
                  placeholder="PASSCODE / PASSWORD" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  autoComplete="current-password"
                  style={{ padding: '18px', border: '1px solid #444' }}
                />
              </div>
              
              <div ref={widgetRef} id="turnstile-widget" style={{ minHeight: '65px', display: 'flex', justifyContent: 'center', marginBottom: '30px' }}></div>

              <button type="submit" style={{ width: '100%', padding: '20px', fontWeight: 900, fontSize: '1.1rem', background: '#fff', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <ShieldCheck size={20} />
                [ {mode === 'login' ? 'ESTABLISH CONNECTION' : 'CREATE ACCOUNT'} ]
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
