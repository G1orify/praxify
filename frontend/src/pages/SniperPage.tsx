import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, Search, Target, Play, Pause, Stop, 
  Activity, Clock, Users, Shield, AlertCircle,
  Settings, Filter, MoreVertical, Loader2
} from 'lucide-react';
import { useIsPremium, useIsAdmin, useStats, useUser } from '../store/useStore';
import { useSearchActions } from '../store/useStore';
import { cn } from '../utils/cn';
import { Spinner, Skeleton } from '../components/LoadingScreen';

// ============================================
// Sniper Page Component
// ============================================

interface TargetCardProps {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'completed' | 'error';
  type: 'user' | 'channel' | 'server';
  duration?: string;
  progress?: number;
  onAction?: () => void;
}

const TargetCard: React.FC<TargetCardProps> = ({
  id,
  name,
  status,
  type,
  duration,
  progress,
  onAction
}) => {
  const statusConfig = {
    active: { icon: Activity, color: 'brand-primary', bg: 'bg-brand-primary/10', text: 'ACTIVE' },
    inactive: { icon: Pause, color: 'brand-secondary', bg: 'bg-brand-secondary/10', text: 'PAUSED' },
    completed: { icon: Shield, color: 'brand-success', bg: 'bg-brand-success/10', text: 'COMPLETED' },
    error: { icon: AlertCircle, color: 'brand-error', bg: 'bg-brand-error/10', text: 'ERROR' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="p-4 rounded-lg border border-border-primary bg-bg-card/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-3 h-3 rounded-full',
            config.color === 'brand-primary' ? 'bg-brand-primary' :
            config.color === 'brand-secondary' ? 'bg-brand-secondary' :
            config.color === 'brand-success' ? 'bg-brand-success' :
            config.color === 'brand-error' ? 'bg-brand-error' :
            'bg-brand-primary'
          )} />
          <span className="text-brand-primary font-mono text-sm">
            {name || id}
          </span>
          <span className="px-2 py-1 text-xs font-mono bg-bg-secondary rounded">
            {type.toUpperCase()}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAction}
          className={cn(
            'px-2 py-1 rounded text-xs font-mono',
            config.bg,
            config.color === 'brand-primary' ? 'text-brand-primary' :
            config.color === 'brand-secondary' ? 'text-brand-secondary' :
            config.color === 'brand-success' ? 'text-brand-success' :
            config.color === 'brand-error' ? 'text-brand-error' :
            'text-brand-primary'
          )}
        >
          {config.text}
        </motion.button>
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="text-text-muted font-mono text-xs">PROGRESS</span>
            <span className="text-brand-primary font-mono text-xs">{Math.round(progress)}%</span>
          </div>
          <motion.div
            className="h-2 bg-bg-secondary rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={cn(
                'h-full rounded-full',
                config.color === 'brand-primary' ? 'bg-brand-primary' :
                config.color === 'brand-secondary' ? 'bg-brand-secondary' :
                config.color === 'brand-success' ? 'bg-brand-success' :
                config.color === 'brand-error' ? 'bg-brand-error' :
                'bg-brand-primary'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </motion.div>
        </div>
      )}

      {duration && (
        <p className="text-text-muted font-mono text-xs mt-2">
          DURATION: {duration}
        </p>
      )}
    </motion.div>
  );
};

// ============================================
// Sniper Page
// ============================================

const SniperPage: React.FC = () => {
  const isPremium = useIsPremium();
  const isAdmin = useIsAdmin();
  const user = useUser();
  const stats = useStats();
  const { search, setSearchQuery } = useSearchActions();
  
  const [activeTargets, setActiveTargets] = useState<TargetCardProps[]>([ 
    { id: '1', name: 'TARGET_ALPHA', status: 'active', type: 'user', progress: 75, duration: '00:45:33' },
    { id: '2', name: 'TARGET_BETA', status: 'active', type: 'channel', progress: 42, duration: '00:22:18' },
    { id: '3', name: 'TARGET_GAMMA', status: 'inactive', type: 'server', duration: '00:00:00' },
    { id: '4', name: 'TARGET_DELTA', status: 'completed', type: 'user', progress: 100, duration: '01:15:42' },
  ]);
  
  const [searchQuery, setLocalSearchQuery] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'user' | 'channel' | 'server'>('user');

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery(searchQuery);
      search(searchQuery);
    }
  };

  // Handle add target
  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.trim()) return;

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setActiveTargets(prev => [
      ...prev,
      { 
        id: Date.now().toString(), 
        name: newTarget, 
        status: 'inactive', 
        type: selectedType 
      }
    ]);
    
    setNewTarget('');
    setLoading(false);
  };

  // Handle start tracking
  const handleStartTracking = (id: string) => {
    setActiveTargets(prev => prev.map(target => 
      target.id === id ? { ...target, status: 'active', progress: 0, duration: '00:00:00' } : target
    ));
  };

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTargets(prev => prev.map(target => {
        if (target.status === 'active' && target.progress && target.progress < 100) {
          return { 
            ...target, 
            progress: Math.min(target.progress + Math.random() * 5, 100),
            duration: formatDuration((target.duration || '00:00:00').split(':').map(Number) as [number, number, number])
          };
        }
        return target;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format duration
  const formatDuration = ([hours, minutes, seconds]: [number, number, number]): string => {
    seconds += Math.floor(Math.random() * 2);
    if (seconds >= 60) {
      minutes += 1;
      seconds = 0;
    }
    if (minutes >= 60) {
      hours += 1;
      minutes = 0;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Get status counts
  const activeCount = activeTargets.filter(t => t.status === 'active').length;
  const inactiveCount = activeTargets.filter(t => t.status === 'inactive').length;
  const completedCount = activeTargets.filter(t => t.status === 'completed').length;
  const errorCount = activeTargets.filter(t => t.status === 'error').length;

  // Check access
  if (!isPremium && !isAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Shield className="w-20 h-20 text-brand-primary/30 mx-auto mb-6" />
          <h2 className="text-2xl font-display text-brand-primary mb-4">
            ACCESS_RESTRICTED
          </h2>
          <p className="text-text-secondary font-mono text-sm max-w-md mx-auto">
            This feature requires PREMIUM access. Please upgrade your subscription to unlock advanced snipe capabilities.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-4 bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-mono rounded-lg"
          >
            UNLOCK_PREMIUM
          </motion.button>
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
              SNIPE_CENTER
            </motion.h1>
            <motion.p
              className="text-text-secondary font-mono text-sm tracking-wider mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              [ PRECISION_TARGETING_SYSTEM ]
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
                placeholder="SEARCH_TARGETS"
                value={searchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-bg-card/50 border border-border-primary rounded-lg font-mono text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center">
          <p className="text-2xl font-display text-brand-primary">{activeCount}</p>
          <p className="text-text-muted font-mono text-xs tracking-wider">ACTIVE</p>
        </div>
        <div className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center">
          <p className="text-2xl font-display text-brand-secondary">{inactiveCount}</p>
          <p className="text-text-muted font-mono text-xs tracking-wider">INACTIVE</p>
        </div>
        <div className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center">
          <p className="text-2xl font-display text-brand-success">{completedCount}</p>
          <p className="text-text-muted font-mono text-xs tracking-wider">COMPLETED</p>
        </div>
        <div className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center">
          <p className="text-2xl font-display text-brand-error">{errorCount}</p>
          <p className="text-text-muted font-mono text-xs tracking-wider">ERRORS</p>
        </div>
      </motion.div>

      {/* Add New Target */}
      <motion.div
        className="mb-8 p-6 rounded-xl border border-border-primary bg-bg-card/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-brand-primary font-mono text-sm tracking-wider">
            ADD_NEW_TARGET
          </h3>
          <div className="flex gap-2">
            {(['user', 'channel', 'server'] as const).map(type => (
              <motion.button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-3 py-1 rounded text-xs font-mono',
                  selectedType === type 
                    ? `bg-${type === 'user' ? 'brand-primary' : type === 'channel' ? 'brand-secondary' : 'brand-accent'}/10 text-${type === 'user' ? 'brand-primary' : type === 'channel' ? 'brand-secondary' : 'brand-accent'}`
                    : 'bg-bg-secondary text-text-muted'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {type.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddTarget} className="flex gap-4">
          <div className="flex-1 relative">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder={`ENTER_${selectedType.toUpperCase()}_ID`}
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg-card/50 border border-border-primary rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading || !newTarget.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono text-sm rounded-lg"
          >
            {loading ? <Spinner size="sm" /> : 'ADD_TARGET'}
          </motion.button>
        </form>
      </motion.div>

      {/* Active Targets */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-brand-primary font-mono text-sm tracking-wider">
            ACTIVE_TARGETS ({activeTargets.length})
          </h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 border border-border-primary rounded-lg font-mono text-xs hover:border-brand-primary/30 transition-colors"
            >
              PAUSE_ALL
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 bg-brand-error/10 border border-brand-error/30 rounded-lg font-mono text-xs text-brand-error hover:bg-brand-error/20 transition-colors"
            >
              STOP_ALL
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTargets.map((target) => (
            <TargetCard
              key={target.id}
              {...target}
              onAction={() => handleStartTracking(target.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Snipe Controls */}
      <motion.div
        className="mt-8 p-6 rounded-xl border border-border-primary bg-bg-card/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-brand-primary font-mono text-sm tracking-wider mb-6">
          QUICK_SNIPE_CONTROLS
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center hover:border-brand-primary/30 transition-all"
          >
            <Crosshair className="w-8 h-8 text-brand-primary mx-auto mb-2" />
            <p className="text-brand-primary font-mono text-xs">PRECISION_SNIPE</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center hover:border-brand-secondary/30 transition-all"
          >
            <Activity className="w-8 h-8 text-brand-secondary mx-auto mb-2" />
            <p className="text-brand-secondary font-mono text-xs">CONTINUOUS_TRACK</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center hover:border-brand-accent/30 transition-all"
          >
            <Users className="w-8 h-8 text-brand-accent mx-auto mb-2" />
            <p className="text-brand-accent font-mono text-xs">MASS_SURVEILLANCE</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-lg border border-border-primary bg-bg-card/30 text-center hover:border-brand-success/30 transition-all"
          >
            <Shield className="w-8 h-8 text-brand-success mx-auto mb-2" />
            <p className="text-brand-success font-mono text-xs">STEALTH_MODE</p>
          </motion.button>
        </div>

        <motion.div
          className="mt-6 pt-6 border-t border-border-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h4 className="text-text-secondary font-mono text-xs tracking-wider mb-4">
            CUSTOM_CONFIGURATION
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="CUSTOM_PARAMETER"
                className="w-full pl-12 pr-4 py-3 bg-bg-card/50 border border-border-primary rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <select className="pl-4 pr-4 py-3 bg-bg-card/50 border border-border-primary rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
              <option>SELECT_MODE</option>
              <option>AGGRESSIVE</option>
              <option>STEALTH</option>
              <option>BALANCED</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-mono text-xs rounded-lg"
            >
              APPLY
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Scanner Effect */}
      <div className="scanner-line" />
    </div>
  );
};

export default SniperPage;
