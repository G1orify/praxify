import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Satellite, Play, Pause, Download, Activity, HardDrive, 
  Users, Database, Terminal, Shield, RefreshCw, Lock, 
  CreditCard, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { type Recording, type Bot } from '../types';
import api from '../services/api';
import Heatmap from './Heatmap';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sniper' | 'admin'>('dashboard');
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ tracks: Recording[], osint: any, analytics: any } | null>(null);
  const [sysStats, setSysStats] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchSysStats();
    const interval = setInterval(fetchSysStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSysStats = async () => {
    try {
      const res = await api.get('/stats');
      if (res.data?.success) setSysStats(res.data.stats);
    } catch (e) {}
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d+$/.test(searchId)) return;
    
    setIsSearching(true);
    setResults(null);
    
    try {
      const [tracksRes, osintRes, analyticsRes] = await Promise.all([
        api.get(`/tracks/${searchId}`),
        api.get(`/osint/${searchId}`),
        api.get(`/analytics/heatmap/${searchId}`).catch(() => ({ data: { data: [] } }))
      ]);
      
      setResults({
        tracks: tracksRes.data.tracks || [],
        osint: osintRes.data,
        analytics: analyticsRes.data.data
      });
    } catch (err: any) {
       console.error("Search error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const isSubscribed = user?.role === 'admin' || (user?.plan === 'premium' && user?.subscription_expires && new Date(user.subscription_expires) > new Date());

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'block', maxWidth: '1400px', padding: '60px' }}
    >
      {/* Dynamic System Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px', borderBottom: '2px solid #fff', paddingBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '5px', letterSpacing: '-2px' }}>CIPHER_OS</h1>
          <div className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
            <span style={{ color: isSubscribed ? '#00ff00' : '#ff3333' }}>
              {isSubscribed ? '● PREMIUM_UPLINK_ACTIVE' : '○ ACCESS_RESTRICTED'}
            </span> 
            {isSubscribed && user?.subscription_expires && ` // EXPIRES: ${new Date(user.subscription_expires).toLocaleDateString()}`}
            {!isSubscribed && user?.role !== 'admin' && ' // PAYMENT_REQUIRED'}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 120px)', gap: '20px' }}>
          <div style={{ border: '1px solid #222', padding: '10px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '0.6rem', opacity: 0.5 }}>FLEET_UNITS</div>
            <div style={{ fontWeight: 800 }}>{sysStats?.onlineBots || '0'}</div>
          </div>
          <div style={{ border: '1px solid #222', padding: '10px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '0.6rem', opacity: 0.5 }}>DATA_SAMPLES</div>
            <div style={{ fontWeight: 800 }}>{sysStats?.totalRecordings || '0'}</div>
          </div>
          <div style={{ border: '1px solid #222', padding: '10px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '0.6rem', opacity: 0.5 }}>USER_AUTH</div>
            <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{user?.username.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '60px' }}>
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Terminal size={16} style={{ marginRight: '10px' }} /> DASHBOARD
        </button>
        {user?.role === 'admin' && (
          <>
            <button className={`tab-btn ${activeTab === 'sniper' ? 'active' : ''}`} onClick={() => setActiveTab('sniper')}>
              <Satellite size={16} style={{ marginRight: '10px' }} /> SNIPER_LINK
            </button>
            <button className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Shield size={16} style={{ marginRight: '10px' }} /> ADMIN_CONSOLE
            </button>
          </>
        )}
        <button className="tab-btn" onClick={logout} style={{ marginLeft: 'auto', borderColor: '#333' }}>DISCONNECT</button>
      </div>

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dash"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!isSubscribed ? (
                <div style={{ padding: '80px 40px', border: '2px solid #fff', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <Lock size={64} style={{ marginBottom: '30px', color: '#ff3333' }} />
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px' }}>PREMIUM ACCESS REQUIRED</h2>
                  <p className="mono" style={{ maxWidth: '600px', margin: '0 auto 40px auto', opacity: 0.7 }}>
                    Full access to the intelligence terminal, voice intercepts, and OSINT engine is restricted to Premium units.
                  </p>
                  <button 
                    onClick={() => setShowCheckout(true)}
                    style={{ padding: '20px 60px', fontSize: '1.2rem', background: '#00ff00', color: '#000', border: 'none' }}
                  >
                    <CreditCard size={20} style={{ marginRight: '15px' }} />
                    PURCHASE ACCESS [$50.00]
                  </button>
                </div>
              ) : (
                <>
                  <div className="search-block" style={{ padding: '50px', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 className="mono" style={{ fontSize: '0.8rem', marginBottom: '25px', opacity: 0.7 }}>// INITIATE_TARGET_ACQUISITION</h2>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '20px' }}>
                      <input 
                        type="text" 
                        placeholder="INPUT DISCORD SNOWFLAKE_ID..." 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        required 
                        style={{ flex: 1, fontSize: '1.2rem', padding: '20px' }}
                      />
                      <button type="submit" disabled={isSearching} style={{ padding: '0 50px' }}>
                        {isSearching ? <RefreshCw className="animate-spin" /> : '[ SEARCH ]'}
                      </button>
                    </form>
                  </div>

                  <div id="dashboard-content" style={{ marginTop: '50px' }}>
                    {results ? (
                      <ResultsView data={results} userId={searchId} />
                    ) : (
                      <div className="empty-state" style={{ padding: '150px 0', borderStyle: 'dashed' }}>
                        <Satellite size={64} style={{ marginBottom: '30px', opacity: 0.1 }} />
                        <h3 className="mono" style={{ opacity: 0.3, letterSpacing: '5px' }}>AWAITING_UPLINK_COMMAND</h3>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'sniper' && <SniperView key="sniper" />}
          {activeTab === 'admin' && <AdminView key="admin" stats={sysStats} />}
        </AnimatePresence>
      </main>

      {/* Payment Overlay */}
      <AnimatePresence>
        {showCheckout && (
          <div className="modal-overlay active" style={{ zIndex: 10001 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="auth-box" 
              style={{ maxWidth: '600px', padding: '50px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h3 className="mono">ESTABLISH_PREMIUM_LINK</h3>
                <X cursor="pointer" onClick={() => setShowCheckout(false)} />
              </div>

              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '10px' }}>$50.00</div>
                <div className="mono" style={{ opacity: 0.5 }}>PER_MONTH_ACCESS</div>
              </div>

              <div className="osint-section" style={{ border: '1px solid #333', padding: '30px', marginBottom: '30px' }}>
                <span className="osint-label">BTC_PAYMENT_UPLINK</span>
                <div className="mono" style={{ fontSize: '0.75rem', marginTop: '15px' }}>
                  BTC: <span style={{ color: '#fff' }}>bc1q0w8qf2gq4xa026y9shxca6enepchxwhcyqdwzk</span><br/><br/>
                  LTC: <span style={{ color: '#fff' }}>LRkpb1veWZdmaWdDsKrQyagetxrrjZLhVd</span><br/><br/>
                  ETH: <span style={{ color: '#fff' }}>0xbd4011c9742d73024DDa776B1e2cCc3b9Cccb107</span>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const txid = (document.getElementById('checkoutTxid') as HTMLInputElement).value;
                const crypto = (document.getElementById('checkoutAsset') as HTMLSelectElement).value;
                const res = await api.post('/payment/submit', { txid, crypto, plan_type: 'premium' });
                if (res.data.success) {
                  alert("Transaction submitted for verification. Please allow up to 10 minutes for blockchain confirmation.");
                  setShowCheckout(false);
                }
              }}>
                <select id="checkoutAsset" required style={{ marginBottom: '15px' }}>
                  <option value="" disabled selected>SELECT_ASSET</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="LTC">Litecoin</option>
                  <option value="ETH">Ethereum</option>
                </select>
                <input id="checkoutTxid" type="text" placeholder="PASTE_TRANSACTION_ID (TXID)" required />
                <button type="submit" style={{ width: '100%', marginTop: '20px', background: '#fff', color: '#000' }}>[ SUBMIT_VERIFICATION ]</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ResultsView = ({ data, userId }: { data: { tracks: Recording[], osint: any, analytics: any }, userId: string }) => {
  const { osint, tracks, analytics } = data;
  
  if (osint.blacklisted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state error-state" style={{ border: '2px solid #ff3333', background: 'rgba(255,51,51,0.05)' }}>
        <h3 style={{ color: '#ff3333', fontSize: '2rem' }}>ACCESS_DENIED</h3>
        <p className="mono" style={{ marginTop: '10px', opacity: 0.6 }}>Target ID [${userId}] is blacklisted by system security.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      {osint.success && (
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="osint-card" style={{ border: '2px solid #fff', padding: '50px', background: '#050505' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '50px' }}>
            <div className="osint-avatar" style={{ width: '120px', height: '120px', border: '4px solid #fff' }}>
              {osint.avatars[0] ? <img src={osint.avatars[0]} alt="avatar" style={{ width: '100%' }} /> : <Users size={60} />}
            </div>
            <div>
              <h3 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '5px' }}>{osint.names[0] || 'UNKNOWN_ENTITY'}</h3>
              <div className="mono" style={{ opacity: 0.5, letterSpacing: '2px' }}>IDENT_ID: {userId} // STATUS: TRACKED</div>
            </div>
          </div>
          
          <div className="osint-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="osint-section" style={{ border: '1px solid #222', padding: '25px' }}>
              <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '15px', display: 'block', letterSpacing: '2px' }}>// ALIAS_HISTORY</span>
              <div style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.8' }}>{osint.names.map((n: string) => `> ${n}`).join('\n') || '> No recorded aliases'}</div>
            </div>
            <div className="osint-section" style={{ border: '1px solid #222', padding: '25px' }}>
              <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '15px', display: 'block', letterSpacing: '2px' }}>// KNOWN_GUILDS</span>
              <div style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.8' }}>{osint.guilds.map((g: string) => `> ${g}`).join('\n') || '> No guild data'}</div>
            </div>
            <div className="osint-section" style={{ gridColumn: '1 / -1', border: '1px solid #333', padding: '25px' }}>
              <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '15px', display: 'block', letterSpacing: '2px' }}>// MESSAGE_INTERCEPTS</span>
              <div className="scrollable" style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.85rem', color: '#888', lineHeight: '1.6' }}>
                {osint.messages.map((m: string, i: number) => <div key={i} style={{ marginBottom: '12px' }}><span style={{ color: '#fff' }}>[{i}]</span> {m}</div>)}
              </div>
            </div>
          </div>

          <Heatmap data={analytics} />
        </motion.div>
      )}

      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} style={{ marginTop: '60px' }}>
        <h2 className="mono" style={{ fontSize: '1rem', marginBottom: '30px' }}>[ AUDIO_DATA_STREAM ]</h2>
        <div className="tracks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
          {tracks.map(t => <TrackCard key={t.id} track={t} />)}
        </div>
      </motion.div>
    </motion.div>
  );
};

const TrackCard = ({ track }: { track: Recording }) => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = async () => {
    if (!audioRef.current || loading) return;
    try {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        setLoading(true);
        await audioRef.current.play();
        setPlaying(true);
      }
    } catch (error) {
      console.error("Audio error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      className="track-card" 
      style={{ border: '2px solid #fff', padding: '30px', background: '#000' }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.channel_name.toUpperCase()}</h4>
        <div className="mono" style={{ fontSize: '0.65rem', opacity: 0.5 }}>CAPTURED: {track.start_time} // LEN: {track.duration_seconds}s</div>
      </div>
      
      <audio ref={audioRef} src={`/recordings/${track.filepath}`} onEnded={() => setPlaying(false)} onTimeUpdate={updateProgress} preload="metadata" />
      
      <div style={{ background: '#111', height: '4px', width: '100%', marginBottom: '25px', position: 'relative' }}>
        <div style={{ background: '#fff', height: '100%', width: `${progress}%`, transition: 'width 0.1s linear' }} />
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button onClick={toggle} style={{ flex: 1, padding: '15px', background: loading ? '#222' : '#fff', cursor: loading ? 'wait' : 'pointer' }} disabled={loading}>
          {loading ? '...' : (playing ? <Pause size={18} /> : <Play size={18} />)}
        </button>
        <a href={`/recordings/${track.filepath}`} download style={{ textDecoration: 'none' }}>
          <button style={{ padding: '15px 20px' }}><Download size={18} /></button>
        </a>
      </div>
    </motion.div>
  );
};

const SniperView = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/bots');
        setBots(res.data);
      } catch (e) {}
    };
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '30px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {bots.map(b => (
        <div key={b.bot_id} className="sniper-card" style={{ border: '2px solid #fff', padding: '40px', background: '#050505' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Satellite size={20} />
              <strong style={{ fontSize: '1.4rem', fontWeight: 900 }}>{b.bot_name.toUpperCase()}</strong>
            </div>
            <span className="badge" style={{ padding: '5px 15px', fontSize: '0.8rem' }}>{b.state}</span>
          </div>
          <div className="mono" style={{ margin: '25px 0', fontSize: '0.85rem', lineHeight: '2' }}>
            <div style={{ color: '#fff' }}><span style={{ opacity: 0.4 }}>{'>'}</span> LOCATION: {b.current_vc || 'IDLE'}</div>
            <div style={{ color: '#888' }}><span style={{ opacity: 0.4 }}>{'>'}</span> STATUS_LOG: {b.log}</div>
          </div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '35px' }}>
            <input type="text" placeholder="TARGET_ID" id={`snipe-${b.bot_id}`} style={{ flex: 1, padding: '15px', border: '1px solid #333' }} />
            <button onClick={() => {}} style={{ padding: '15px 30px' }}>OVERRIDE</button>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const AdminView = ({ stats }: { stats: any }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        <StatCard icon={<Database size={24} />} value={stats?.totalRecordings || '0'} label="ARCHIVED_RECS" />
        <StatCard icon={<Activity size={24} />} value={stats?.onlineBots || '0'} label="ACTIVE_FLEET" />
        <StatCard icon={<Users size={24} />} value={stats?.totalUsers || '0'} label="AUTH_CLIENTS" />
        <StatCard icon={<HardDrive size={24} />} value={stats?.diskUsageFormatted || '0MB'} label="STORAGE_USAGE" />
      </div>
      
      <div className="search-block" style={{ border: '2px solid #fff', padding: '50px' }}>
        <h3 className="mono" style={{ fontSize: '1.2rem', marginBottom: '30px' }}>[ FLEET_COMMAND_CENTER ]</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => api.post('/fleet/restart')} style={{ background: '#fff', color: '#000' }}>EMERGENCY_RESTART</button>
          <button style={{ background: 'transparent', color: '#ff3333', border: '2px solid #ff3333' }}>PANIC_DISCONNECT</button>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, value, label }: { icon: any, value: string | number, label: string }) => (
  <div className="stat-card" style={{ textAlign: 'left', border: '2px solid #fff', padding: '40px', background: '#050505' }}>
    <div style={{ marginBottom: '25px', opacity: 0.3 }}>{icon}</div>
    <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '10px' }}>{value}</div>
    <label className="mono" style={{ fontSize: '0.7rem', letterSpacing: '3px', opacity: 0.5 }}>{label}</label>
  </div>
);

export default Dashboard;
