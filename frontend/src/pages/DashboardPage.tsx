import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Satellite, Play, Pause, Download, Activity, HardDrive, 
  Users, Database, Terminal, Shield, RefreshCw, Search,
  BarChart3, Settings, Bell, Filter, MoreVertical
} from 'lucide-react';
import { useStats, useBots, useIsPremium, useIsAdmin, useUser } from '../store/useStore';
import { useStatsActions, useBotsActions, useSearchActions } from '../store/useStore';
import { cn, formatNumber, formatBytes } from '../utils/cn';
import { Skeleton, Spinner } from '../components/LoadingScreen';
import Heatmap from '../components/Heatmap';

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  loading?: boolean;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  subtext,
  loading = false,
  color = 'brand-primary'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-border-primary bg-bg-card/50 backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <motion.div
          className={cn(`w-12 h-12 rounded-lg flex items-center justify-center`, {
            'bg-brand-primary/10': !loading,
            'bg-skeleton': loading
          })}
          animate={loading ? { pulse: [0, 1, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {loading ? (
            <Skeleton variant="circular" className="w-6 h-6" />
          ) : (
            <Icon className={cn(
              'w-6 h-6',
              color === 'brand-primary' ? 'text-brand-primary' :
              color === 'brand-secondary' ? 'text-brand-secondary' :
              color === 'brand-success' ? 'text-brand-success' :
              color === 'brand-accent' ? 'text-brand-accent' :
              color === 'brand-error' ? 'text-brand-error' :
              'text-brand-primary'
            )} />
          )}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <p className="text-text-muted font-mono text-xs tracking-wider uppercase">
            {label}
          </p>
          <motion.p
            className="text-2xl font-display text-brand-primary truncate"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? <Skeleton className="w-24 h-6" /> : value}
          </motion.p>
          {subtext && !loading && (
            <p className="text-text-muted font-mono text-xs mt-1">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Bot Status Card Component
// ============================================

interface BotStatusCardProps {
  bot: any;
}

const BotStatusCard: React.FC<BotStatusCardProps> = ({ bot }) => {
  const isOnline = bot.online !== false;
  const isRecording = bot.state?.includes('Recording') || bot.state?.includes('Sniper');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-border-primary bg-bg-card/30 hover:border-brand-primary/30 transition-all"
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
        <motion.span
          className={cn(
            'px-2 py-1 rounded text-xs font-mono',
            isRecording 
              ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
              : isOnline
                ? 'bg-brand-success/10 text-brand-success border border-brand-success/20'
                : 'bg-brand-error/10 text-brand-error border border-brand-error/20'
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {bot.state || 'OFFLINE'}
        </motion.span>
      </div>

      {bot.log && (
        <p className="text-text-muted font-mono text-xs mt-2 truncate">
          {bot.log}
        </p>
      )}
    </motion.div>
  );
};

// ============================================
// Dashboard Page
// ============================================

const DashboardPage: React.FC = () => {
  const stats = useStats();
  const bots = useBots();
  const isPremium = useIsPremium();
  const isAdmin = useIsAdmin();
  const user = useUser();
  
  const { fetchStats } = useStatsActions();
  const { fetchBots } = useBotsActions();
  const { search, setSearchQuery } = useSearchActions();
  
  const [searchQuery, setLocalSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'bots' | 'recordings' | 'analytics'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    if (isAdmin) {
      fetchBots();
    }
  }, [fetchStats, fetchBots, isAdmin]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      if (isAdmin) {
        fetchBots();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchBots, isAdmin]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery(searchQuery);
      search(searchQuery);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchStats(),
        isAdmin ? fetchBots() : Promise.resolve()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Tab change
  const handleTabChange = (tab: 'overview' | 'bots' | 'recordings' | 'analytics') => {
    setActiveTab(tab);
  };

  // Calculate stats
  const onlineBots = bots.filter(b => b.online).length;
  const offlineBots = bots.length - onlineBots;

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
              DASHBOARD
            </motion.h1>
            <motion.p
              className="text-text-secondary font-mono text-sm tracking-wider mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              [ SYSTEM_OVERVIEW ]
            </motion.p>
          </div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="SEARCH_USER_ID"
                value={searchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-bg-card/50 border border-border-primary rounded-lg font-mono text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </form>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-lg border border-border-primary hover:border-brand-primary/30 transition-colors"
            >
              {refreshing ? (
                <Spinner size="sm" />
              ) : (
                <RefreshCw className="w-5 h-5 text-brand-primary" />
              )}
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
        {[
          { id: 'overview', label: 'OVERVIEW' },
          { id: 'bots', label: 'BOTS', adminOnly: true },
          { id: 'recordings', label: 'RECORDINGS' },
          { id: 'analytics', label: 'ANALYTICS' },
        ].map((tab) => {
          if (tab.adminOnly && !isAdmin) return null;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={cn(
                'px-4 py-3 font-mono text-sm tracking-wider relative',
                activeTab === tab.id
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-text-muted hover:text-brand-primary/70'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
            </motion.button>
          );
        })}
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <StatCard
                  icon={Activity}
                  label="TOTAL_RECORDINGS"
                  value={stats?.totalRecordings || 0}
                  subtext="Audio Logs"
                  loading={false}
                />
                <StatCard
                  icon={HardDrive}
                  label="DISK_USAGE"
                  value={stats?.diskUsageFormatted || '0 GB'}
                  subtext="Storage"
                  loading={false}
                />
                <StatCard
                  icon={Users}
                  label="TOTAL_USERS"
                  value={stats?.totalUsers || 0}
                  subtext="Operatives"
                  loading={false}
                />
                <StatCard
                  icon={Shield}
                  label="ONLINE_BOTS"
                  value={onlineBots}
                  subtext="Active"
                  loading={false}
                  color="brand-success"
                />
              </motion.div>

              {/* Premium Stats */}
              {isPremium && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <StatCard
                    icon={Database}
                    label="RECENT_RECORDINGS"
                    value={stats?.recentRecordings || 0}
                    subtext="Last 24h"
                    loading={false}
                    color="brand-secondary"
                  />
                  <StatCard
                    icon={BarChart3}
                    label="PREMIUM_USERS"
                    value={stats?.premiumUsers || 0}
                    subtext="Subscribed"
                    loading={false}
                    color="brand-accent"
                  />
                </motion.div>
              )}

              {/* Quick Actions */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl border border-border-primary bg-bg-card/50 text-left hover:border-brand-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <Play className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-brand-primary font-mono text-sm">
                        START_RECORDING
                      </p>
                      <p className="text-text-muted font-mono text-xs">
                        Begin new session
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl border border-border-primary bg-bg-card/50 text-left hover:border-brand-secondary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-secondary/10 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-brand-secondary" />
                    </div>
                    <div>
                      <p className="text-brand-secondary font-mono text-sm">
                        VIEW_RECORDINGS
                      </p>
                      <p className="text-text-muted font-mono text-xs">
                        Access archive
                      </p>
                    </div>
                  </div>
                </motion.button>

                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 rounded-xl border border-border-primary bg-bg-card/50 text-left hover:border-brand-accent/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-brand-accent font-mono text-sm">
                          SYSTEM_SETTINGS
                        </p>
                        <p className="text-text-muted font-mono text-xs">
                          Admin Panel
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )}
              </motion.div>

              {/* Heatmap */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-6 rounded-xl border border-border-primary bg-bg-card/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-brand-primary font-mono text-sm tracking-wider">
                    ACTIVITY_HEATMAP
                  </h3>
                  <Filter className="w-4 h-4 text-text-muted" />
                </div>
                <Heatmap />
              </motion.div>
            </div>
          )}

          {/* Bots Tab */}
          {activeTab === 'bots' && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-brand-primary font-mono text-sm tracking-wider">
                  BOT_FLEET ({bots.length})
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-brand-success/10 text-brand-success border border-brand-success/20 rounded text-xs font-mono">
                    {onlineBots} ONLINE
                  </span>
                  <span className="px-2 py-1 bg-brand-error/10 text-brand-error border border-brand-error/20 rounded text-xs font-mono">
                    {offlineBots} OFFLINE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bots.map((bot) => (
                  <BotStatusCard key={bot.bot_id} bot={bot} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Recordings Tab */}
          {activeTab === 'recordings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
              >
                <Database className="w-20 h-20 text-brand-primary/30 mx-auto mb-4" />
                <h3 className="text-brand-primary font-mono text-lg">
                  RECORDINGS_ARCHIVE
                </h3>
                <p className="text-text-muted font-mono text-sm mt-2">
                  Access premium feature to view recordings
                </p>
                {!isPremium && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-mono text-sm rounded-lg"
                  >
                    UNLOCK_PREMIUM
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
              >
                <BarChart3 className="w-20 h-20 text-brand-primary/30 mx-auto mb-4" />
                <h3 className="text-brand-primary font-mono text-lg">
                  ADVANCED_ANALYTICS
                </h3>
                <p className="text-text-muted font-mono text-sm mt-2">
                  Comprehensive data visualization and insights
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-accent to-brand-primary text-white font-mono text-sm rounded-lg"
                >
                  VIEW_DASHBOARD
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {false && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <Terminal className="w-20 h-20 text-brand-primary/30 mx-auto mb-4" />
          <h3 className="text-brand-primary font-mono text-lg">
            NO_DATA_AVAILABLE
          </h3>
          <p className="text-text-muted font-mono text-sm mt-2">
            Perform a search or check back later
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
