import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Satellite, Crosshair, Activity, Database, Shield, 
  Play, Code2, Users, BarChart3, ArrowRight, 
  Sparkles
} from 'lucide-react';
import { useIsAuthenticated } from '../store/useStore';
import { cn } from '../utils/cn';
import { Spinner } from '../components/LoadingScreen';

// ============================================
// Landing Page Component
// ============================================

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
  tag?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay = 0,
  tag
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative p-6 rounded-xl border border-border-primary bg-bg-card/50 backdrop-blur-sm"
    >
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-primary/30 rounded-tl-xl" />
      
      {/* Icon */}
      <motion.div
        className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Icon className="w-6 h-6 text-brand-primary" />
      </motion.div>

      {/* Tag */}
      {tag && (
        <motion.span
          className="inline-block px-2 py-1 mb-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/20 rounded text-xs font-mono tracking-wide"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          {tag}
        </motion.span>
      )}

      {/* Title */}
      <h3 className="text-lg font-display text-brand-primary mb-2 tracking-wide">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed font-mono">
        {description}
      </p>

      {/* Hover effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent to-brand-primary/30 rounded-b-xl"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentFeature, setCurrentFeature] = useState(0);

  // Typing effect for subtitle
  const fullText = '// CLOSED SOURCE INTELLIGENCE TERMINAL';
  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
        // Blink cursor
        const blink = setInterval(() => {
          setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(blink);
      }
    }, 50);
    return () => clearInterval(typing);
  }, []);

  // Feature rotation
  const features = [
    { 
      title: 'REAL-TIME OSINT', 
      description: 'Advanced intelligence gathering with real-time data processing and analysis.' 
    },
    { 
      title: 'AUTOMATED TRACKING', 
      description: 'Automated tracking systems with AI-powered pattern recognition.' 
    },
    { 
      title: 'MULTI-PLATFORM', 
      description: 'Support for multiple platforms with unified data collection.' 
    },
    { 
      title: 'PRECISION TARGETING', 
      description: 'Precision snipe operations with laser-focused accuracy.' 
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Handle redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    if (!loading) {
      setLoading(true);
      navigate('/login');
    }
  };

  // Stats
  const stats = [
    { label: 'BOTS_DEPLOYED', value: '24/7', subtext: 'Always Online' },
    { label: 'RECORDINGS', value: '1M+', subtext: 'Audio Logs' },
    { label: 'USERS', value: '10K+', subtext: 'Active Operatives' },
    { label: 'UPTIME', value: '99.9%', subtext: 'System Reliability' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-grid-overlay opacity-10" />
        <div className="scanner-line" />
        <div className="data-stream" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-brand-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-6 h-6 bg-brand-secondary/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-brand-accent/20 rounded-full animate-pulse delay-2000" />
        
        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main Logo */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          >
            <motion.div
              className="relative inline-flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(0, 255, 0, 0.3)',
                  '0 0 40px rgba(0, 255, 0, 0.5)',
                  '0 0 20px rgba(0, 255, 0, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Satellite className="w-20 h-20 text-brand-primary" />
              <motion.div
                className="absolute inset-0 border-2 border-brand-primary/30 rounded-full"
                style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-display text-brand-primary tracking-wider mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            CIPHER_OS
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl text-text-secondary font-mono mb-4 min-h-[32px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {typingText}
            <motion.span
              className="inline-block w-1 h-6 bg-brand-primary"
              animate={{ opacity: showCursor ? 1 : 0 }}
            />
          </motion.p>

          {/* Tagline */}
          <motion.p
            className="text-brand-primary/60 font-mono text-sm sm:text-base mb-12 tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            NEXT GENERATION CLOSED SOURCE INTELLIGENCE PLATFORM
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              disabled={loading}
              className="group relative px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-display font-semibold tracking-wider rounded-lg overflow-hidden transition-all"
            >
              <span className="relative z-10">ESTABLISH_UPLINK</span>
              {loading ? (
                <Spinner className="absolute right-4" />
              ) : (
                <ArrowRight className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              )}
              <div className="absolute inset-0 bg-white/20" />
            </motion.button>

            <Link
              to="#features"
              className="group px-8 py-4 border-2 border-border-primary hover:border-brand-primary/50 text-brand-primary font-mono tracking-wider rounded-lg transition-all"
            >
              [ SYSTEM_SPECS ]
            </Link>
          </motion.div>

          {/* Feature Rotation */}
          <motion.div
            className="mt-12 p-4 bg-bg-card/50 rounded-lg border border-border-primary/50 inline-block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Sparkles className="w-5 h-5 text-brand-primary inline-block mr-2" />
            <AnimatePresence mode="wait">
              <motion.span
                key={currentFeature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="text-brand-primary/80 font-mono text-sm"
              >
                {features[currentFeature].title} | {features[currentFeature].description}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-brand-primary/40 font-mono text-xs tracking-widest">
            SCROLL_DOWN
          </span>
          <div className="w-1 h-8 bg-brand-primary/30 rounded-full" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section 
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-display text-brand-primary text-center mb-16"
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            [ SYSTEM_CAPABILITIES ]
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Crosshair}
              title="PRECISION_SNIPE"
              description="Laser-focused targeting with AI-powered precision tracking."
              delay={0}
              tag="PREMIUM"
            />
            <FeatureCard
              icon={Activity}
              title="REALTIME_MONITOR"
              description="Continuous monitoring with instant notifications and alerts."
              delay={0.1}
              tag="PRO"
            />
            <FeatureCard
              icon={Database}
              title="DATA_VAULT"
              description="Secure encrypted storage for all recorded intelligence data."
              delay={0.2}
            />
            <FeatureCard
              icon={Shield}
              title="SECURE_GATEWAY"
              description="Military-grade encryption with multi-factor authentication."
              delay={0.3}
              tag="ENTERPRISE"
            />
            <FeatureCard
              icon={Users}
              title="TEAM_SYNC"
              description="Collaborative workspace for intelligence sharing and analysis."
              delay={0.4}
            />
            <FeatureCard
              icon={BarChart3}
              title="ADVANCED_ANALYTICS"
              description="Comprehensive data visualization with predictive insights."
              delay={0.5}
              tag="AI"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-display text-brand-primary mb-4">
            [ SYSTEM_STATISTICS ]
          </h2>
          <p className="text-text-secondary font-mono text-sm tracking-wider">
            REAL-TIME OPERATIONAL DATA
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl border border-border-primary bg-bg-card/50 backdrop-blur-sm"
            >
              <motion.div
                className="text-3xl font-display text-brand-primary mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {stat.value}
              </motion.div>
              <p className="text-text-secondary font-mono text-xs tracking-wider">
                {stat.label}
              </p>
              <p className="text-text-muted font-mono text-xs mt-1">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-display text-brand-primary mb-4">
            [ BUILT_WITH ]
          </h2>
          <p className="text-text-secondary font-mono text-sm tracking-wider">
            PRODUCTION-GRADE TECHNOLOGY STACK
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'React 18', icon: '⚛️', color: '#61DAFB' },
            { name: 'TypeScript', icon: '🔵', color: '#3178C6' },
            { name: 'Vite', icon: '⚡', color: '#646CFF' },
            { name: 'Tailwind', icon: '🌪️', color: '#38BDF8' },
            { name: 'Zustand', icon: '⚪', color: '#764ABC' },
            { name: 'Express', icon: '🚀', color: '#000000' },
            { name: 'SQLite', icon: '🗄️', color: '#003B57' },
            { name: 'Socket.IO', icon: '🔌', color: '#010101' },
          ].map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="p-6 rounded-xl border border-border-primary bg-bg-card/50 text-center cursor-pointer hover:border-brand-primary/30 transition-all"
            >
              <motion.div
                className="text-4xl mb-3"
                style={{ color: tech.color }}
              >
                {tech.icon}
              </motion.div>
              <p className="text-brand-primary font-mono text-sm tracking-wide">
                {tech.name}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          >
            <Satellite className="w-24 h-24 text-brand-primary/20 mx-auto" />
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-display text-brand-primary mb-6"
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            READY TO DEPLOY?
          </motion.h2>

          <motion.p
            className="text-text-secondary font-mono text-sm sm:text-base mb-12 tracking-wider max-w-2xl mx-auto"
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            JOIN THE ELITE RANKS OF INTELLIGENCE OPERATIVES. 
            ESTABLISH YOUR UPLINK AND START GATHERING CRITICAL DATA.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            disabled={loading}
            className="group relative px-12 py-5 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-display font-semibold tracking-wider rounded-xl overflow-hidden transition-all"
          >
            <span className="relative z-10">INITIALIZE_SYSTEM</span>
            {loading ? (
              <Spinner className="absolute right-6" />
            ) : (
              <Play className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            )}
            <div className="absolute inset-0 bg-white/20" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border-primary">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-text-muted font-mono text-xs sm:text-sm tracking-wider mb-4">
            [ CIPHER_OS v2.0.0 | PRODUCTION GRADE | ALL SYSTEMS OPERATIONAL ]
          </p>
          <p className="text-text-muted/50 font-mono text-xs">
            © 2024 CIPHER_OS. All rights reserved. Unauthorized access prohibited.
          </p>
        </motion.div>
      </footer>
    </div>
  );
};

export default LandingPage;
