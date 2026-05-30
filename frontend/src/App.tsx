import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import useStore, {
  useIsAuthenticated,
  useTheme,
  useUiActions,
  useAuthActions,
  useStatsActions,
} from './store/useStore';
import { useLocalStorage } from './hooks/useLocalStorage';

// Layout Components
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';

// Page Components
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SniperPage from './pages/SniperPage';
import AdminPage from './pages/AdminPage';
import PaymentPage from './pages/PaymentPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingScreen from './components/LoadingScreen';

// Components
import ThemeProvider from './components/ThemeProvider';
import SocketProvider from './components/SocketProvider';

// Styles
import './styles/globals.css';

// ============================================
// Route Protection Components
// ============================================

/**
 * Protected route that redirects to login if not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Route that redirects to dashboard if already authenticated
 */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Route that requires admin privileges
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { user } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Route that requires premium subscription
 */
function PremiumRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { user } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const isPremium = user?.plan === 'premium' && 
    user?.subscription_expires && 
    new Date(user.subscription_expires) > new Date();
  
  if (!isPremium && user?.role !== 'admin') {
    return <Navigate to="/payment" replace />;
  }
  
  return <>{children}</>;
}

// ============================================
// App Component
// ============================================

function App() {
  const theme = useTheme();
  const { setTheme } = useUiActions();
  const { refreshUser, logout } = useAuthActions();
  const { fetchStats } = useStatsActions();
  
  // Initialize theme from localStorage
  const [initialTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
  
  useEffect(() => {
    // Set initial theme
    setTheme(initialTheme);
    
    // Check for auth token and refresh user
    const token = localStorage.getItem('auth_token');
    if (token) {
      refreshUser().catch((error) => {
        console.error('[App] Failed to refresh user:', error);
        logout();
      });
    }
    
    // Fetch initial stats
    fetchStats().catch((error) => {
      console.error('[App] Failed to fetch stats:', error);
    });
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <SocketProvider>
        <Router>
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
                  <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                </Route>
                
                {/* Protected Routes */}
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/sniper" element={<AdminRoute><SniperPage /></AdminRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                  <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Router>
        
        {/* Global Toaster */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md) var(--spacing-xl)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: 'var(--brand-success)',
                secondary: 'var(--bg-card)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--brand-error)',
                secondary: 'var(--bg-card)',
              },
            },
          }}
        />
        
        {/* System Overlays */}
        <div className="scanner-line" />
        <div className="data-stream" />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
