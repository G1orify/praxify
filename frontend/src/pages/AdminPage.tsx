import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Users, Settings, Bell, Activity, 
  Play, Stop, Restart, AlertTriangle, Terminal,
  Search, MoreVertical, Edit, Trash2, UserPlus,
  BarChart3, Database, RefreshCw, Filter
} from 'lucide-react';
import { useIsAdmin, useStats, useBots, useUser } from '../store/useStore';
import { useAuthActions, useBotsActions, useStatsActions } from '../store/useStore';
import { cn } from '../utils/cn';
import { Spinner } from '../components/LoadingScreen';

// ============================================
// Admin Page Component
// ============================================

interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AdminPage: React.FC = () => {
  const isAdmin = useIsAdmin();
  const user = useUser();
  const stats = useStats();
  const bots = useBots();
  
  const { logout } = useAuthActions();
  const { fetchBots } = useBotsActions();
  const { fetchStats } = useStatsActions();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bots' | 'settings' | 'system'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      logout();
    }
  }, [isAdmin, logout]);

  // Initial data fetch
  useEffect(() => {
    if (isAdmin) {
      fetchBots();
      fetchStats();
    }
  }, [isAdmin, fetchBots, fetchStats]);

  // Tab navigation
  const handleTabChange = (tab: 'dashboard' | 'users' | 'bots' | 'settings' | 'system') => {
    setActiveTab(tab);
  };

  // Handle action
  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'refresh':
          await Promise.all([fetchStats(), fetchBots()]);
          break;
        case 'restart':
          // Simulate restart
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        case 'panic':
          // Simulate panic
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        default:
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // Admin stats
  const adminStats = [
    { label: 'TOTAL_USERS', value: stats?.totalUsers || 0, icon: Users, color: 'brand-primary' },
    { label: 'ONLINE_BOTS', value: bots.filter(b => b.online).length, icon: Activity, color: 'brand-success' },
    { label: 'PREMIUM_USERS', value: stats?.premiumUsers || 0, icon: Shield, color: 'brand-accent' },
    { label: 'DISK_USAGE', value: stats?.diskUsageFormatted || '0 GB', icon: Database, color: 'brand-secondary' },
  ];

  // Navigation items
  const navItems: AdminNavItem[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: Shield },
    { id: 'users', label: 'USERS', icon: Users },
    { id: 'bots', label: 'BOTS', icon: Activity },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
    { id: 'system', label: 'SYSTEM', icon: Terminal },
  ];

  // Quick actions
  const quickActions = [
    { 
      id: 'restart', 
      label: 'FLEET_RESTART', 
      icon: Restart,
      color: 'brand-secondary',
      bg: 'bg-brand-secondary/10',
      border: 'border-brand-secondary/20'
    },
    { 
      id: 'panic', 
      label: 'PANIC_DISCONNECT', 
      icon: AlertTriangle,
      color: 'brand-error',
      bg: 'bg-brand-error/10',
      border: 'border-brand-error/20'
    },
    { 
      id: 'notify', 
      label: 'SYSTEM_ALERT', 
      icon: Bell,
      color: 'brand-warning',
      bg: 'bg-brand-warning/10',
      border: 'border-brand-warning/20'
    },
    { 
      id: 'update', 
      label: 'FORCE_UPDATE', 
      icon: RefreshCw,
      color: 'brand-primary',
      bg: 'bg-brand-primary/10',
      border: 'border-brand-primary/20'
    },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Shield className="w-20 h-20 text-brand-primary/30 mx-auto mb-6" />
          <h2 className="text-2xl font-display text-brand-primary mb-4">
            ACCESS_DENIED
          </h2>
          <p className="text-text-secondary font-mono text-sm max-w-md mx-auto">
            Administrative access required. Please authenticate with elevated privileges.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              className="text-3xl font-display text-brand-primary tracking-wider"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ADMIN_PANEL
            </motion.h1>
            <motion.p
              className="text-text-secondary font-mono text-sm tracking-wider mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              [ SYSTEM_ADMINISTRATION ]
            </motion.p>
          </div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-4 px-4 py-2 bg-bg-card/50 rounded-lg border border-border-primary">
              <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-brand-primary font-mono text-sm">{user?.username}</p>
                <p className="text-text-muted font-mono text-xs">ADMINISTRATOR</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAction.bind(null, 'refresh')}
              disabled={loading}
              className="p-3 rounded-lg border border-border-primary hover:border-brand-primary/30 transition-colors"
            >
              {loading ? <Spinner size="sm" /> : <RefreshCw className="w-5 h-5 text-brand-primary" />}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex gap-2 mb-8 border-b border-border-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleTabChange(item.id as any)}
            className={cn(
              'px-4 py-3 font-mono text-sm tracking-wider relative',
              activeTab === item.id
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-text-muted hover:text-brand-primary/70'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-4 h-4 inline-block mr-2" />
            {item.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {adminStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="p-6 rounded-xl border border-border-primary bg-bg-card/50"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          stat.color === 'brand-primary' ? 'bg-brand-primary/10' :
                          stat.color === 'brand-success' ? 'bg-brand-success/10' :
                          stat.color === 'brand-accent' ? 'bg-brand-accent/10' :
                          stat.color === 'brand-secondary' ? 'bg-brand-secondary/10' :
                          'bg-brand-primary/10'
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <stat.icon className={cn(
                          'w-6 h-6',
                          stat.color === 'brand-primary' ? 'text-brand-primary' :
                          stat.color === 'brand-success' ? 'text-brand-success' :
                          stat.color === 'brand-accent' ? 'text-brand-accent' :
                          stat.color === 'brand-secondary' ? 'text-brand-secondary' :
                          'text-brand-primary'
                        )} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-muted font-mono text-xs tracking-wider uppercase">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-display text-brand-primary truncate">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-brand-primary font-mono text-sm tracking-wider mb-6">
                  QUICK_ACTIONS
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(action.id)}
                      className={cn(
                        'p-6 rounded-xl border border-border-primary bg-bg-card/30 text-center hover:border-brand-primary/30 transition-all flex flex-col items-center gap-3'
                      )}
                    >
                      <action.icon className={cn(
                        'w-8 h-8',
                        action.color === 'brand-primary' ? 'text-brand-primary' :
                        action.color === 'brand-secondary' ? 'text-brand-secondary' :
                        action.color === 'brand-error' ? 'text-brand-error' :
                        action.color === 'brand-warning' ? 'text-brand-warning' :
                        'text-brand-primary'
                      )} />
                      <span className="text-brand-primary font-mono text-xs tracking-wider">
                        {action.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* System Health */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-6 rounded-xl border border-border-primary bg-bg-card/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-brand-primary font-mono text-sm tracking-wider">
                    SYSTEM_HEALTH
                  </h3>
                  <motion.span
                    className="px-3 py-1 bg-brand-success/10 text-brand-success border border-brand-success/20 rounded text-xs font-mono"
                    animate={{ boxShadow: ['0 0 0 0 rgba(0, 255, 136, 0.4)', '0 0 0 10px rgba(0, 255, 136, 0)', '0 0 0 0 rgba(0, 255, 136, 0.4)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ALL_SYSTEMS_OPERATIONAL
                  </motion.span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'API_STATUS', value: 'ONLINE', status: 'success' },
                    { label: 'DATABASE', value: 'CONNECTED', status: 'success' },
                    { label: 'BOT_NETWORK', value: 'ACTIVE', status: 'success' },
                    { label: 'STORAGE', value: `${stats?.diskUsageFormatted || '0 GB'} USED`, status: 'warning' },
                  ].map((item, index) => (
                    <div key={item.label} className="p-3 bg-bg-card/30 rounded-lg border border-border-primary">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          item.status === 'success' ? 'bg-brand-success' :
                          item.status === 'warning' ? 'bg-brand-warning' :
                          item.status === 'error' ? 'bg-brand-error' :
                          'bg-brand-secondary'
                        )} />
                        <div>
                          <p className="text-text-muted font-mono text-xs tracking-wider">
                            {item.label}
                          </p>
                          <p className="text-brand-primary font-mono text-sm">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-brand-primary font-mono text-sm tracking-wider">
                  USER_MANAGEMENT
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 border border-border-primary rounded-lg font-mono text-xs hover:border-brand-primary/30 transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    ADD_USER
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 border border-border-primary rounded-lg font-mono text-xs hover:border-brand-primary/30 transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    FILTER
                  </motion.button>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border-primary bg-bg-card/50">
                <div className="text-center py-12">
                  <Users className="w-20 h-20 text-brand-primary/30 mx-auto mb-4" />
                  <h4 className="text-brand-primary font-mono text-lg">
                    USER_LIST
                  </h4>
                  <p className="text-text-muted font-mono text-sm mt-2">
                    {stats?.totalUsers || 0} total users registered
                  </p>
                  <motion.p
                    className="text-text-muted/50 font-mono text-xs mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    [ FEATURE_COMING_SOON ]
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bots Tab */}
          {activeTab === 'bots' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-brand-primary font-mono text-sm tracking-wider">
                  BOT_FLEET ({bots.length})
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-lg font-mono text-xs text-brand-primary hover:bg-brand-primary/20 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    START_ALL
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-brand-error/10 border border-brand-error/20 rounded-lg font-mono text-xs text-brand-error hover:bg-brand-error/20 transition-colors flex items-center gap-2"
                  >
                    <Stop className="w-4 h-4" />
                    STOP_ALL
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bots.map((bot) => {
                  const isOnline = bot.online !== false;
                  const isRecording = bot.state?.includes('Recording') || bot.state?.includes('Sniper');

                  return (
                    <motion.div
                      key={bot.bot_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="p-4 rounded-lg border border-border-primary bg-bg-card/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            isOnline ? 'bg-brand-success' : 'bg-brand-error'
                          )} />
                          <span className="text-brand-primary font-mono text-sm">
                            {bot.bot_name || `BOT_${bot.bot_id}`}
                          </span>
                          <span className="text-text-muted font-mono text-xs">
                            ID: {bot.bot_id}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-text-muted hover:text-brand-primary transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary font-mono text-xs">
                          {bot.current_vc || 'IDLE'}
                        </span>
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-mono',
                          isRecording 
                            ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                            : isOnline
                              ? 'bg-brand-success/10 text-brand-success border border-brand-success/20'
                              : 'bg-brand-error/10 text-brand-error border border-brand-error/20'
                        )}>
                          {bot.state || 'OFFLINE'}
                        </span>
                      </div>

                      {bot.log && (
                        <p className="text-text-muted font-mono text-xs mt-2 truncate">
                          {bot.log}
                        </p>
                      )}

                      <motion.div
                        className="mt-3 pt-3 border-t border-border-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-2 bg-bg-secondary rounded-lg font-mono text-xs text-text-muted hover:bg-brand-primary/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          CONFIGURE
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl border border-border-primary bg-bg-card/50"
            >
              <div className="text-center py-12">
                <Settings className="w-20 h-20 text-brand-primary/30 mx-auto mb-4" />
                <h4 className="text-brand-primary font-mono text-lg">
                  ADMIN_SETTINGS
                </h4>
                <p className="text-text-muted font-mono text-sm mt-2">
                  Configure system-wide parameters
                </p>
                <motion.p
                  className="text-text-muted/50 font-mono text-xs mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  [ FEATURE_COMING_SOON ]
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-brand-primary font-mono text-sm tracking-wider">
                  SYSTEM_CONTROLS
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="p-6 rounded-lg border border-border-primary bg-bg-card/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <Restart className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="text-brand-primary font-mono text-sm">FLEET_RESTART</h4>
                      <p className="text-text-muted font-mono text-xs">
                        Restart all active bots
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('restart')}
                    disabled={loading}
                    className="w-full py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg font-mono text-xs text-brand-primary hover:bg-brand-primary/20 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Spinner size="sm" /> : <Restart className="w-4 h-4" />}
                    INITIATE_RESTART
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="p-6 rounded-lg border border-border-primary bg-bg-card/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-error/10 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-brand-error" />
                    </div>
                    <div>
                      <h4 className="text-brand-error font-mono text-sm">PANIC_DISCONNECT</h4>
                      <p className="text-text-muted font-mono text-xs">
                        Emergency shutdown
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('panic')}
                    disabled={loading}
                    className="w-full py-3 bg-brand-error/10 border border-brand-error/20 rounded-lg font-mono text-xs text-brand-error hover:bg-brand-error/20 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Spinner size="sm" /> : <AlertTriangle className="w-4 h-4" />}
                    ACTIVATE_PANIC
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="p-6 rounded-lg border border-border-primary bg-bg-card/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-secondary/10 rounded-lg flex items-center justify-center">
                      <Bell className="w-6 h-6 text-brand-secondary" />
                    </div>
                    <div>
                      <h4 className="text-brand-secondary font-mono text-sm">SYSTEM_ALERT</h4>
                      <p className="text-text-muted font-mono text-xs">
                        Broadcast notification
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('notify')}
                    disabled={loading}
                    className="w-full py-3 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg font-mono text-xs text-brand-secondary hover:bg-brand-secondary/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    SEND_ALERT
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="p-6 rounded-lg border border-border-primary bg-bg-card/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="text-brand-primary font-mono text-sm">FORCE_UPDATE</h4>
                      <p className="text-text-muted font-mono text-xs">
                        Update all systems
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('update')}
                    disabled={loading}
                    className="w-full py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg font-mono text-xs text-brand-primary hover:bg-brand-primary/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    FORCE_UPDATE
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Scanner Effect */}
      <div className="scanner-line" />
    </div>
  );
};

export default AdminPage;
