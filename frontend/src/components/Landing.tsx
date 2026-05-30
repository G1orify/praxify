import React from 'react';
import { motion } from 'framer-motion';
import { Satellite, Crosshair, Activity, Database } from 'lucide-react';

const Landing: React.FC<{ onConnect: () => void }> = ({ onConnect }) => {
  return (
    <div id="landing-hero" className="landing-page">
      <motion.section 
        className="landing-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-content">
          <motion.h1 
            className="glitch" 
            data-text="CIPHER_OS"
          >
            CIPHER_OS
          </motion.h1>
          <motion.p 
            className="landing-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            // CLOSED SOURCE INTELLIGENCE TERMINAL
          </motion.p>
          <div className="hero-actions" style={{ marginTop: '40px', justifyContent: 'center' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConnect}
            >
              [ ESTABLISH_UPLINK ]
            </motion.button>
          </div>
        </div>
        <motion.div 
          className="scroll-hint"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          SCROLL_TO_DETAILS
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="landing-section">
        <h2 style={{ marginBottom: '60px' }}>[ SYSTEM_CAPABILITIES ]</h2>
        <div className="features-grid">
          <FeatureBox 
            icon={<Satellite size={32} />} 
            title="VOICE_INTERCEPT" 
            desc="Real-time autonomous monitoring of encrypted voice channels across high-priority guilds." 
          />
          <FeatureBox 
            icon={<Database size={32} />} 
            title="OSINT_ENGINE" 
            desc="Deep historical indexing of aliases, guild transitions, and activity logs." 
          />
          <FeatureBox 
            icon={<Crosshair size={32} />} 
            title="TARGET_SNIPE" 
            desc="Precision target acquisition with automated fleet deployment and persistence." 
          />
        </div>
      </section>

      {/* Network Stats */}
      <section className="landing-section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 style={{ marginBottom: '60px' }}>[ LIVE_NETWORK_STATUS ]</h2>
        <div className="features-grid">
          <StatBox value="142" label="ACTIVE_NODES" />
          <StatBox value="4.2M" label="REQUESTS_PROCESSED" />
          <StatBox value="89.4GB" label="DATA_INDEXED" />
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-section">
        <h2 style={{ marginBottom: '60px' }}>[ ACCESS_LEVELS ]</h2>
        <div className="pricing-section">
          <PricingCard 
            tier="BASIC_ACCESS" 
            price="10.00" 
            features={["10 SEARCHES / DAY", "MEDIA_DOWNLOADS", "BASIC_PROFILING"]} 
          />
          <PricingCard 
            tier="PREMIUM_UPLINK" 
            price="25.00" 
            premium 
            features={["100 SEARCHES / DAY", "DEEP_OSINT_INDEX", "PRIORITY_FLEET_QUEUE"]} 
          />
        </div>
      </section>
    </div>
  );
};

const FeatureBox = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="feature-box">
    <div style={{ marginBottom: '20px' }}>{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const StatBox = ({ value, label }: { value: string, label: string }) => (
  <div className="feature-box" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '10px' }}>{value}</div>
    <p style={{ color: '#fff', letterSpacing: '2px' }}>{label}</p>
  </div>
);

const PricingCard = ({ tier, price, features, premium = false }: { tier: string, price: string, features: string[], premium?: boolean }) => (
  <div className={`pricing-card ${premium ? 'premium' : ''}`}>
    <h3>{tier}</h3>
    <div className="price">{price} <span>/ BTC</span></div>
    <ul style={{ listStyle: 'none' }}>
      {features.map((f, i) => (
        <li key={i}><Activity size={14} style={{ marginRight: '10px', display: 'inline-block' }} /> {f}</li>
      ))}
    </ul>
  </div>
);

export default Landing;
