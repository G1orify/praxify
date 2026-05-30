import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Bot, Recording, Stats } from '../types';
import api from '../services/api';
import { ApiError, isAuthError } from '../services/api';

// ============================================
// Types
// ============================================

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface BotsState {
  bots: Bot[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface StatsState {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface SearchState {
  query: string;
  results: {
    tracks: Recording[];
    osint: any;
  } | null;
  isSearching: boolean;
  error: string | null;
  searchHistory: string[];
}

interface UiState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  modalOpen: boolean;
  toastMessages: { id: string; type: 'success' | 'error' | 'info'; message: string }[];
}

interface PaymentState {
  paymentStatus: 'idle' | 'verifying' | 'approved' | 'failed';
  txid: string | null;
  crypto: string | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Combined Store State
// ============================================

interface AppState {
  // Auth
  auth: AuthState;
  
  // Data
  bots: BotsState;
  stats: StatsState;
  search: SearchState;
  
  // UI
  ui: UiState;
  
  // Payment
  payment: PaymentState;
}

// ============================================
// Actions
// ============================================

interface AppActions {
  // Auth Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, captchaToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearAuthError: () => void;
  
  // Bots Actions
  fetchBots: () => Promise<void>;
  setBots: (bots: Bot[]) => void;
  clearBotsError: () => void;
  
  // Stats Actions
  fetchStats: () => Promise<void>;
  setStats: (stats: Stats) => void;
  clearStatsError: () => void;
  
  // Search Actions
  setSearchQuery: (query: string) => void;
  search: (userId: string) => Promise<void>;
  clearSearch: () => void;
  clearSearchError: () => void;
  addToSearchHistory: (query: string) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Payment Actions
  submitPayment: (txid: string, crypto: string) => Promise<void>;
  setPaymentTxid: (txid: string) => void;
  setPaymentCrypto: (crypto: string) => void;
  clearPayment: () => void;
  clearPaymentError: () => void;
  
  // General
  reset: () => void;
}

// ============================================
// Store Definition
// ============================================

type AppStore = AppState & AppActions;

const initialAuthState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const initialBotsState: BotsState = {
  bots: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const initialStatsState: StatsState = {
  stats: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const initialSearchState: SearchState = {
  query: '',
  results: null,
  isSearching: false,
  error: null,
  searchHistory: [],
};

const initialUiState: UiState = {
  theme: 'dark',
  sidebarOpen: false,
  modalOpen: false,
  toastMessages: [],
};

const initialPaymentState: PaymentState = {
  paymentStatus: 'idle',
  txid: null,
  crypto: null,
  isLoading: false,
  error: null,
};

const initialState: AppState = {
  auth: initialAuthState,
  bots: initialBotsState,
  stats: initialStatsState,
  search: initialSearchState,
  ui: initialUiState,
  payment: initialPaymentState,
};

// ============================================
// Store Creation
// ============================================

const useStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,
        
        // Auth Actions
        setToken: (token) => {
          set((state) => ({
            auth: {
              ...state.auth,
              token,
              isAuthenticated: !!token,
            },
          }));
        },
        
        setUser: (user) => {
          set((state) => ({
            auth: {
              ...state.auth,
              user,
              isAuthenticated: !!user,
            },
          }));
        },
        
        login: async (username, password) => {
          try {
            set((state) => ({
              auth: {
                ...state.auth,
                isLoading: true,
                error: null,
              },
            }));
            
            const response = await api.auth.login(username, password);
            
            if (response.success && response.token) {
              localStorage.setItem('auth_token', response.token);
              set((state) => ({
                auth: {
                  ...state.auth,
                  token: response.token,
                  user: response.user,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                },
              }));
              get().addToast('success', `Welcome back, ${username}!`);
            } else {
              throw new Error(response.message || 'Login failed');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            set((state) => ({
              auth: {
                ...state.auth,
                isLoading: false,
                error: message,
              },
            }));
            if (isAuthError(error)) {
              // Session expired or invalid - force logout
              get().logout();
            } else {
              get().addToast('error', message);
            }
          }
        },
        
        signup: async (username, password, captchaToken) => {
          try {
            set((state) => ({
              auth: {
                ...state.auth,
                isLoading: true,
                error: null,
              },
            }));
            
            const response = await api.auth.signup(username, password, captchaToken);
            
            if (response.success) {
              get().addToast('success', response.message || 'Account created! Please login.');
              set((state) => ({
                auth: {
                  ...state.auth,
                  isLoading: false,
                },
              }));
            } else {
              throw new Error(response.message || 'Signup failed');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Signup failed';
            set((state) => ({
              auth: {
                ...state.auth,
                isLoading: false,
                error: message,
              },
            }));
            get().addToast('error', message);
          }
        },
        
        logout: () => {
          localStorage.removeItem('auth_token');
          set((state) => ({
            auth: {
              ...initialAuthState,
            },
            search: {
              ...initialSearchState,
            },
          }));
          get().addToast('info', 'You have been logged out.');
        },
        
        refreshUser: async () => {
          try {
            set((state) => ({
              auth: {
                ...state.auth,
                isLoading: true,
              },
            }));
            
            const response = await api.auth.me();
            
            if (response.success && response.user) {
              set((state) => ({
                auth: {
                  ...state.auth,
                  user: response.user,
                  isAuthenticated: true,
                  isLoading: false,
                },
              }));
            } else {
              throw new Error('User not found');
            }
          } catch (error) {
            if (isAuthError(error)) {
              // Token expired - force logout
              get().logout();
            }
            set((state) => ({
              auth: {
                ...state.auth,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to refresh user',
              },
            }));
          }
        },
        
        clearAuthError: () => {
          set((state) => ({
            auth: {
              ...state.auth,
              error: null,
            },
          }));
        },
        
        // Bots Actions
        fetchBots: async () => {
          try {
            set((state) => ({
              bots: {
                ...state.bots,
                isLoading: true,
                error: null,
              },
            }));
            
            const response = await api.bots.list();
            
            if (response.success) {
              set((state) => ({
                bots: {
                  ...state.bots,
                  bots: response.bots || [],
                  isLoading: false,
                  error: null,
                  lastUpdated: Date.now(),
                },
              }));
            } else {
              throw new Error(response.message || 'Failed to fetch bots');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch bots';
            set((state) => ({
              bots: {
                ...state.bots,
                isLoading: false,
                error: message,
              },
            }));
          }
        },
        
        setBots: (bots) => {
          set((state) => ({
            bots: {
              ...state.bots,
              bots,
              lastUpdated: Date.now(),
            },
          }));
        },
        
        clearBotsError: () => {
          set((state) => ({
            bots: {
              ...state.bots,
              error: null,
            },
          }));
        },
        
        // Stats Actions
        fetchStats: async () => {
          try {
            set((state) => ({
              stats: {
                ...state.stats,
                isLoading: true,
                error: null,
              },
            }));
            
            const response = await api.stats.get();
            
            if (response.success && response.stats) {
              set((state) => ({
                stats: {
                  ...state.stats,
                  stats: response.stats,
                  isLoading: false,
                  error: null,
                  lastUpdated: Date.now(),
                },
              }));
            } else {
              throw new Error(response.message || 'Failed to fetch stats');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch stats';
            set((state) => ({
              stats: {
                ...state.stats,
                isLoading: false,
                error: message,
              },
            }));
          }
        },
        
        setStats: (stats) => {
          set((state) => ({
            stats: {
              ...state.stats,
              stats,
              lastUpdated: Date.now(),
            },
          }));
        },
        
        clearStatsError: () => {
          set((state) => ({
            stats: {
              ...state.stats,
              error: null,
            },
          }));
        },
        
        // Search Actions
        setSearchQuery: (query) => {
          set((state) => ({
            search: {
              ...state.search,
              query,
            },
          }));
        },
        
        search: async (userId: string) => {
          try {
            set((state) => ({
              search: {
                ...state.search,
                isSearching: true,
                error: null,
                query: userId,
              },
            }));
            
            const [tracksResponse, osintResponse] = await Promise.all([
              api.tracks.get(userId),
              api.osint.get(userId),
            ]);
            
            if (tracksResponse.success && osintResponse.success) {
              set((state) => ({
                search: {
                  ...state.search,
                  results: {
                    tracks: tracksResponse.tracks || [],
                    osint: osintResponse,
                  },
                  isSearching: false,
                  error: null,
                },
              }));
              
              // Add to history if not already there
              if (!state.search.searchHistory.includes(userId)) {
                get().addToSearchHistory(userId);
              }
            } else {
              throw new Error(tracksResponse.message || osintResponse.message || 'Search failed');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Search failed';
            set((state) => ({
              search: {
                ...state.search,
                isSearching: false,
                error: message,
              },
            }));
            get().addToast('error', message);
          }
        },
        
        clearSearch: () => {
          set((state) => ({
            search: {
              ...state.search,
              query: '',
              results: null,
              isSearching: false,
              error: null,
            },
          }));
        },
        
        clearSearchError: () => {
          set((state) => ({
            search: {
              ...state.search,
              error: null,
            },
          }));
        },
        
        addToSearchHistory: (query) => {
          set((state) => ({
            search: {
              ...state.search,
              searchHistory: [query, ...state.search.searchHistory].slice(0, 10),
            },
          }));
        },
        
        // UI Actions
        toggleSidebar: () => {
          set((state) => ({
            ui: {
              ...state.ui,
              sidebarOpen: !state.ui.sidebarOpen,
            },
          }));
        },
        
        setSidebarOpen: (open) => {
          set((state) => ({
            ui: {
              ...state.ui,
              sidebarOpen: open,
            },
          }));
        },
        
        toggleTheme: () => {
          const currentTheme = get().ui.theme;
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          set((state) => ({
            ui: {
              ...state.ui,
              theme: newTheme,
            },
          }));
          
          // Update document class
          document.documentElement.classList.remove(currentTheme);
          document.documentElement.classList.add(newTheme);
          
          // Save to localStorage
          localStorage.setItem('theme', newTheme);
        },
        
        setTheme: (theme) => {
          set((state) => ({
            ui: {
              ...state.ui,
              theme,
            },
          }));
          
          // Update document class
          const currentTheme = get().ui.theme;
          document.documentElement.classList.remove(currentTheme);
          document.documentElement.classList.add(theme);
          
          // Save to localStorage
          localStorage.setItem('theme', theme);
        },
        
        addToast: (type, message) => {
          const id = Math.random().toString(36).substring(2, 9);
          set((state) => ({
            ui: {
              ...state.ui,
              toastMessages: [...state.ui.toastMessages, { id, type, message }],
            },
          }));
          
          // Auto-remove after 4 seconds
          setTimeout(() => {
            get().removeToast(id);
          }, 4000);
        },
        
        removeToast: (id) => {
          set((state) => ({
            ui: {
              ...state.ui,
              toastMessages: state.ui.toastMessages.filter(t => t.id !== id),
            },
          }));
        },
        
        clearToasts: () => {
          set((state) => ({
            ui: {
              ...state.ui,
              toastMessages: [],
            },
          }));
        },
        
        // Payment Actions
        submitPayment: async (txid, crypto) => {
          try {
            set((state) => ({
              payment: {
                ...state.payment,
                isLoading: true,
                error: null,
                paymentStatus: 'verifying',
                txid,
                crypto,
              },
            }));
            
            const response = await api.payment.submit(txid, crypto);
            
            if (response.success) {
              set((state) => ({
                payment: {
                  ...state.payment,
                  paymentStatus: 'approved',
                  isLoading: false,
                  error: null,
                },
              }));
              get().addToast('success', response.message || 'Payment verified!');
              
              // Refresh user to update subscription status
              await get().refreshUser();
            } else {
              throw new Error(response.message || 'Payment verification failed');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Payment failed';
            set((state) => ({
              payment: {
                ...state.payment,
                paymentStatus: 'failed',
                isLoading: false,
                error: message,
              },
            }));
            get().addToast('error', message);
          }
        },
        
        setPaymentTxid: (txid) => {
          set((state) => ({
            payment: {
              ...state.payment,
              txid,
            },
          }));
        },
        
        setPaymentCrypto: (crypto) => {
          set((state) => ({
            payment: {
              ...state.payment,
              crypto,
            },
          }));
        },
        
        clearPayment: () => {
          set((state) => ({
            payment: {
              ...initialPaymentState,
            },
          }));
        },
        
        clearPaymentError: () => {
          set((state) => ({
            payment: {
              ...state.payment,
              error: null,
            },
          }));
        },
        
        // General
        reset: () => {
          localStorage.removeItem('auth_token');
          set(initialState);
        },
      }),
      {
        name: 'cipheros-store',
        partialize: (state) => ({
          // Only persist these parts
          auth: {
            token: state.auth.token,
            user: state.auth.user,
            isAuthenticated: state.auth.isAuthenticated,
          },
          ui: {
            theme: state.ui.theme,
          },
          search: {
            searchHistory: state.search.searchHistory,
          },
        }),
      }
    ),
    {
      name: 'CIPHER_OS Store',
      serialize: {
        // Custom serialization to handle BigInt in user IDs
        serialize: (state) => JSON.stringify(state, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString();
          }
          return value;
        }),
        deserialize: (str) => JSON.parse(str, (key, value) => {
          // Handle potential BigInt strings
          if (typeof value === 'string' && /^[0-9]+$/.test(value) && value.length > 15) {
            try {
              return BigInt(value);
            } catch {
              return value;
            }
          }
          return value;
        }),
      },
    }
  )
);

// ============================================
// Selectors (Optimized state access)
// ============================================

// Auth selectors
export const useAuth = () => useStore((state) => state.auth);
export const useToken = () => useStore((state) => state.auth.token);
export const useUser = () => useStore((state) => state.auth.user);
export const useIsAuthenticated = () => useStore((state) => state.auth.isAuthenticated);
export const useIsAuthLoading = () => useStore((state) => state.auth.isLoading);

// Bots selectors
export const useBots = () => useStore((state) => state.bots.bots);
export const useBotsLoading = () => useStore((state) => state.bots.isLoading);

// Stats selectors
export const useStats = () => useStore((state) => state.stats.stats);
export const useStatsLoading = () => useStore((state) => state.stats.isLoading);

// Search selectors
export const useSearchQuery = () => useStore((state) => state.search.query);
export const useSearchResults = () => useStore((state) => state.search.results);
export const useIsSearching = () => useStore((state) => state.search.isSearching);
export const useSearchHistory = () => useStore((state) => state.search.searchHistory);

// UI selectors
export const useTheme = () => useStore((state) => state.ui.theme);
export const useSidebarOpen = () => useStore((state) => state.ui.sidebarOpen);
export const useToasts = () => useStore((state) => state.ui.toastMessages);

// Payment selectors
export const usePaymentStatus = () => useStore((state) => state.payment.paymentStatus);
export const useIsPaymentLoading = () => useStore((state) => state.payment.isLoading);

// ============================================
// Action Hooks (Bound actions for components)
// ============================================

// Auth actions
export const useAuthActions = () => {
  const store = useStore();
  return {
    login: store.login,
    signup: store.signup,
    logout: store.logout,
    refreshUser: store.refreshUser,
    clearAuthError: store.clearAuthError,
    setToken: store.setToken,
    setUser: store.setUser,
  };
};

// Bots actions
export const useBotsActions = () => {
  const store = useStore();
  return {
    fetchBots: store.fetchBots,
    setBots: store.setBots,
    clearBotsError: store.clearBotsError,
  };
};

// Stats actions
export const useStatsActions = () => {
  const store = useStore();
  return {
    fetchStats: store.fetchStats,
    setStats: store.setStats,
    clearStatsError: store.clearStatsError,
  };
};

// Search actions
export const useSearchActions = () => {
  const store = useStore();
  return {
    setSearchQuery: store.setSearchQuery,
    search: store.search,
    clearSearch: store.clearSearch,
    clearSearchError: store.clearSearchError,
    addToSearchHistory: store.addToSearchHistory,
  };
};

// UI actions
export const useUiActions = () => {
  const store = useStore();
  return {
    toggleSidebar: store.toggleSidebar,
    setSidebarOpen: store.setSidebarOpen,
    toggleTheme: store.toggleTheme,
    setTheme: store.setTheme,
    addToast: store.addToast,
    removeToast: store.removeToast,
    clearToasts: store.clearToasts,
  };
};

// Payment actions
export const usePaymentActions = () => {
  const store = useStore();
  return {
    submitPayment: store.submitPayment,
    setPaymentTxid: store.setPaymentTxid,
    setPaymentCrypto: store.setPaymentCrypto,
    clearPayment: store.clearPayment,
    clearPaymentError: store.clearPaymentError,
  };
};

// ============================================
// User helpers
export const useIsPremium = () => {
  const user = useUser();
  return user?.plan === 'premium' && user?.subscription_expires && new Date(user.subscription_expires) > new Date();
};

export const useIsAdmin = () => {
  const user = useUser();
  return user?.role === 'admin';
};

// ============================================
// Export
export default useStore;
