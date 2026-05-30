// server.js - Production-Grade Express server for CIPHER_OS
// Enhanced with comprehensive security, rate limiting, and error handling

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// ============================================
// 1. ENVIRONMENT & CONSTANTS
// ============================================

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const NODE_ENV = process.env.NODE_ENV || 'production';
const IS_PROD = NODE_ENV === 'production';
const IS_DEV = NODE_ENV === 'development';

// Validate required environment variables
const requiredEnvVars = IS_PROD ? ['JWT_SECRET', 'TURNSTILE_SECRET', 'DATABASE_PATH', 'SESSION_SECRET'] : [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`[FATAL] Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;

// Wallet Addresses
const WALLETS = {
  BTC: 'bc1q0w8qf2gq4xa026y9shxca6enepchxwhcyqdwzk',
  LTC: 'LRkpb1veWZdmaWdDsKrQyagetxrrjZLhVd',
  ETH: '0xbd4011c9742d73024DDa776B1e2cCc3b9Cccb107'
};

// ============================================
// 2. SECURITY CONFIGURATION
// ============================================

// Rate limiting configurations
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers['cf-connecting-ip'] || 'anonymous',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Try again in ${Math.ceil(RATE_LIMIT_WINDOW_MS / 1000 / 60)} minutes.`
    });
  },
  skip: (req) => req.path === '/api/health' || req.path === '/health'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'TOO_MANY_LOGIN_ATTEMPTS', message: 'Please wait 15 minutes before trying again.' },
  keyGenerator: (req) => `${req.ip || req.headers['cf-connecting-ip']}:${req.body.username || 'unknown'}`,
  skip: () => IS_DEV
});

// CORS configuration
const corsOptions = {
  origin: IS_PROD ? [
    'https://cipheros.io',
    'https://www.cipheros.io',
    'https://vibe-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ] : '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-CSRF-Token']
};

// Security headers via Helmet
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  hsts: IS_PROD ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  xssFilter: true
});

// ============================================
// 3. EXPRESS APP SETUP
// ============================================

const app = express();
app.set('trust proxy', true);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(cookieParser(SESSION_SECRET));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 10000 }));
app.use(express.json({ limit: '10mb', strict: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.headers['cf-connecting-ip'] || 'unknown';
    console.log(`[${new Date().toISOString()}] ${ip} | ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Apply rate limiting
app.use('/api/', apiLimiter);

// ============================================
// 4. CLOUDFLARE PROXY CHECK
// ============================================

const cloudflareOnly = (req, res, next) => {
  if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') return next();
  if (IS_DEV) return next();
  
  const cfIp = req.headers['cf-connecting-ip'];
  const cfRay = req.headers['cf-ray'];
  
  if (!cfIp || !cfRay) {
    console.warn(`[SECURITY] Direct API access attempt from IP: ${req.ip || 'unknown'}`);
    return res.status(403).json({
      success: false,
      error: 'DIRECT_ACCESS_PROHIBITED',
      message: 'Access only available through Cloudflare proxy.'
    });
  }
  next();
};

app.use('/api/', cloudflareOnly);

// ============================================
// 5. DATABASE SETUP
// ============================================

const Database = require('better-sqlite3');
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../recordings/recordings.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// Initialize database tables
function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'basic', 'premium')),
      subscription_expires TEXT,
      created_at TEXT DEFAULT datetime('now'),
      updated_at TEXT DEFAULT datetime('now')
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      txid TEXT NOT NULL,
      crypto TEXT NOT NULL,
      plan_type TEXT DEFAULT 'premium',
      status TEXT DEFAULT 'verifying' CHECK(status IN ('verifying', 'approved', 'failed', 'error')),
      failure_reason TEXT,
      created_at TEXT DEFAULT datetime('now'),
      verified_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`
  ];
  
  tables.forEach(sql => {
    try { db.exec(sql); } catch (e) { console.warn('[DB] Error executing:', e.message); }
  });
}

initializeDatabase();

// Secure database query wrapper
function dbQuery(action, query, params = []) {
  try {
    const stmt = db.prepare(query);
    if (action === 'select') {
      return JSON.stringify(stmt.all(...params));
    } else {
      return stmt.run(...params);
    }
  } catch (error) {
    console.error(`[DB ERROR] Query: ${query}`, error);
    throw error;
  }
}

// ============================================
// 6. INPUT VALIDATION UTILITIES
// ============================================

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').trim();
}

function isValidDiscordId(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9]{17,19}$/.test(id);
}

function isValidTxid(txid) {
  if (typeof txid !== 'string') return false;
  return /^[a-fA-F0-9]{64,66}$/.test(txid);
}

function isValidCrypto(crypto) {
  return ['BTC', 'LTC', 'ETH'].includes(crypto);
}

function isValidUsername(username) {
  if (typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]{3,32}$/.test(username);
}

// ============================================
// 7. SERVE STATIC FILES
// ============================================

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: IS_PROD ? '1d' : 0,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use('/recordings', (req, res, next) => {
  const requestedPath = req.path;
  if (requestedPath.includes('..') || requestedPath.includes('\\') || requestedPath.startsWith('/')) {
    return res.status(403).json({ success: false, error: 'INVALID_PATH' });
  }
  const allowedExtensions = ['.mp3', '.wav', '.ogg', '.json', '.txt'];
  const hasValidExtension = allowedExtensions.some(ext => requestedPath.includes(ext));
  if (req.path !== '/' && !hasValidExtension && !requestedPath.endsWith('/')) {
    return res.status(403).json({ success: false, error: 'INVALID_FILE_TYPE' });
  }
  next();
}, express.static(path.join(__dirname, '../recordings'), {
  maxAge: IS_PROD ? '1h' : 0
}));

// ============================================
// 8. HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ success: false, error: 'DATABASE_CONNECTION_FAILED' });
  }
});

// ============================================
// 9. CRYPTO VERIFICATION ENGINE
// ============================================

const httpsAgent = new https.Agent({ keepAlive: true, timeout: 10000 });
const priceCache = new Map();

async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Request timeout: ${url}`)), 10000);
    https.get(url, { headers: { 'User-Agent': 'CipherOS-Payment-Bot/2.0' }, agent: httpsAgent, ...options }, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`Invalid JSON: ${e.message}`)); }
      });
    }).on('error', (err) => { clearTimeout(timeout); reject(err); });
  });
}

async function getUsdPrice(crypto) {
  const cacheKey = `price_${crypto}`;
  const cached = priceCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < 3600000) return cached.price;
  
  try {
    const coingeckoId = crypto === 'BTC' ? 'bitcoin' : crypto === 'LTC' ? 'litecoin' : 'ethereum';
    const data = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
    const price = data[coingeckoId]?.usd;
    if (price) { priceCache.set(cacheKey, { price, timestamp: Date.now() }); return price; }
    throw new Error('Price not found');
  } catch (e) {
    console.warn(`[PRICE] Error fetching ${crypto}:`, e.message);
    return { BTC: 65000, LTC: 80, ETH: 3500 }[crypto] || 50000;
  }
}

async function verifyTxid(txid, asset) {
  if (!isValidTxid(txid)) return { success: false, error: "INVALID_TXID_FORMAT" };
  if (!isValidCrypto(asset)) return { success: false, error: "UNSUPPORTED_ASSET" };
  
  const targetAddr = WALLETS[asset];
  if (!targetAddr) return { success: false, error: "CONFIGURATION_ERROR" };
  
  try {
    const usdPrice = await getUsdPrice(asset);
    const minCrypto = 50 / usdPrice;
    
    switch (asset) {
      case 'BTC': {
        const data = await fetchJson(`https://blockchain.info/rawtx/${txid}`);
        if (!data?.out) return { success: false, error: "TXID_NOT_FOUND", message: "Transaction not found on Bitcoin blockchain." };
        const output = data.out.find(o => o.addr === targetAddr);
        if (!output) return { success: false, error: "ADDRESS_MISMATCH", message: `Address mismatch. Expected: ${targetAddr}` };
        const amountBtc = output.value / 100000000;
        if (amountBtc < minCrypto * 0.95) return { success: false, error: "INSUFFICIENT_AMOUNT", message: `Min: ~${minCrypto.toFixed(8)} BTC. Got: ${amountBtc} BTC` };
        return { success: true };
      }
      case 'LTC': {
        const data = await fetchJson(`https://api.blockcypher.com/v1/ltc/main/txs/${txid}`);
        if (!data?.outputs) return { success: false, error: "TXID_NOT_FOUND", message: "Transaction not found on Litecoin blockchain." };
        const output = data.outputs.find(o => o.addresses?.includes(targetAddr));
        if (!output) return { success: false, error: "ADDRESS_MISMATCH", message: `Address mismatch. Expected: ${targetAddr}` };
        const amountLtc = output.value / 100000000;
        if (amountLtc < minCrypto * 0.95) return { success: false, error: "INSUFFICIENT_AMOUNT", message: `Min: ~${minCrypto.toFixed(8)} LTC. Got: ${amountLtc} LTC` };
        return { success: true };
      }
      case 'ETH': {
        const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
        const data = await fetchJson(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txid}&apikey=${apiKey}`);
        if (!data?.result) return { success: false, error: "TXID_NOT_FOUND", message: "Transaction not found on Ethereum blockchain." };
        if (data.result.to.toLowerCase() !== targetAddr.toLowerCase()) return { success: false, error: "ADDRESS_MISMATCH", message: `Address mismatch. Expected: ${targetAddr}` };
        const amountEth = parseInt(data.result.value, 16) / 1e18;
        if (amountEth < minCrypto * 0.95) return { success: false, error: "INSUFFICIENT_AMOUNT", message: `Min: ~${minCrypto.toFixed(8)} ETH. Got: ${amountEth} ETH` };
        return { success: true };
      }
      default: return { success: false, error: "UNSUPPORTED_ASSET" };
    }
  } catch (e) {
    console.error(`[PAYMENT] Verify error for ${txid} (${asset}):`, e.message);
    return { success: false, error: "VERIFICATION_FAILED", message: "Blockchain lookup failed. Please verify the TXID." };
  }
}

// ============================================
// 10. AUTH MIDDLEWARE
// ============================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'AUTH_REQUIRED', message: 'Authorization token is required.' });
  }
  
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) {
      const errorMessage = err.name === 'TokenExpiredError' ? 'Session expired. Please login again.' : 'Invalid token.';
      return res.status(403).json({ success: false, error: 'INVALID_TOKEN', message: errorMessage });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'AUTH_REQUIRED' });
  if (req.user.role !== 'admin') {
    console.warn(`[SECURITY] Admin attempt by ${req.user.username} (${req.user.userId})`);
    return res.status(403).json({ success: false, error: 'ADMIN_REQUIRED', message: 'Administrative access required.' });
  }
  next();
};

const enforceQuota = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  try {
    const userRes = dbQuery("select", "SELECT plan, subscription_expires FROM users WHERE id = ?", [req.user.userId]);
    const users = userRes ? JSON.parse(userRes) : [];
    if (users.length === 0) return res.status(401).json({ success: false, error: 'USER_NOT_FOUND' });
    const user = users[0];
    const isPremium = user.plan === 'premium' && user.subscription_expires && new Date(user.subscription_expires) > new Date();
    if (!isPremium) {
      return res.status(402).json({
        success: false,
        error: 'PREMIUM_REQUIRED',
        message: 'Premium subscription required.',
        requiresPayment: true
      });
    }
    next();
  } catch (e) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: 'Access check failed.' });
  }
};

// ============================================
// 11. API ENDPOINTS
// ============================================

// Auth
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { username, password, captchaToken } = req.body;
  
  if (!isValidUsername(username)) {
    return res.status(400).json({ success: false, error: 'INVALID_USERNAME', message: 'Username must be 3-32 alphanumeric characters.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters.' });
  }
  
  if (IS_PROD) {
    if (!captchaToken) return res.status(400).json({ success: false, error: 'CAPTCHA_REQUIRED' });
    try {
      const formData = `secret=${TURNSTILE_SECRET}&response=${captchaToken}`;
      const response = await fetchJson('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': formData.length }
      });
      if (!response.success) return res.status(400).json({ success: false, error: 'CAPTCHA_FAILED' });
    } catch (e) {
      return res.status(500).json({ success: false, error: 'CAPTCHA_ERROR' });
    }
  }
  
  try {
    const existing = JSON.parse(dbQuery("select", "SELECT id FROM users WHERE username = ?", [username]));
    if (existing.length > 0) return res.status(409).json({ success: false, error: 'USERNAME_TAKEN' });
    
    const hashed = await bcrypt.hash(password, 12);
    dbQuery("update", "INSERT INTO users (username, password, role, plan) VALUES (?, ?, ?, ?)", [username, hashed, 'user', 'free']);
    
    res.status(201).json({ success: true, message: 'Account created. Please login.' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'DB_ERROR', message: 'Registration failed.' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const userRes = dbQuery("select", "SELECT id, username, password, role, plan, subscription_expires FROM users WHERE username = ?", [username]);
    const users = userRes ? JSON.parse(userRes) : [];
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' });
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' });
    }
    
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role, plan: user.plan, subscription_expires: user.subscription_expires }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'AUTH_ERROR', message: 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const userRes = dbQuery("select", "SELECT id, username, role, plan, subscription_expires FROM users WHERE id = ?", [req.user.userId]);
    const users = userRes ? JSON.parse(userRes) : [];
    if (users.length === 0) return res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
    
    const user = users[0];
    const isSubscribed = user.plan === 'premium' && user.subscription_expires && new Date(user.subscription_expires) > new Date();
    
    res.json({ success: true, user: { ...user, isSubscribed } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Bots
app.get('/api/bots', authenticateToken, requireAdmin, (req, res) => {
  try {
    const result = dbQuery("select", "SELECT bot_id, bot_name, current_vc, state, log, updated_at FROM bot_state ORDER BY bot_id");
    const bots = result ? JSON.parse(result) : [];
    res.json({ success: true, bots: bots.map(b => ({ ...b, online: b.state && !b.state.includes('Offline') })), count: bots.length });
  } catch (e) {
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

// Stats
app.get('/api/stats', (req, res) => {
  try {
    const getCount = (table, condition = '') => {
      const query = condition ? `SELECT COUNT(*) as count FROM ${table} WHERE ${condition}` : `SELECT COUNT(*) as count FROM ${table}`;
      return JSON.parse(dbQuery("select", query) || "[{"count":0}]")[0].count;
    };
    
    let diskUsage = 0;
    try {
      const RECORDINGS_DIR = path.join(__dirname, '../recordings');
      if (fs.existsSync(RECORDINGS_DIR)) {
        const getSize = (dir) => fs.readdirSync(dir).reduce((acc, f) => {
          const fp = path.join(dir, f);
          const stat = fs.statSync(fp);
          return acc + (stat.isDirectory() ? getSize(fp) : stat.size);
        }, 0);
        diskUsage = getSize(RECORDINGS_DIR);
      }
    } catch (e) { /* ignore */ }
    
    res.json({
      success: true,
      stats: {
        totalRecordings: getCount('recordings'),
        onlineBots: getCount('bot_state'),
        totalUsers: getCount('users'),
        premiumUsers: getCount('users', "plan = 'premium'"),
        recentRecordings: getCount('recordings', "timestamp > datetime('now', '-24 hours')"),
        diskUsage,
        diskUsageFormatted: formatBytes(diskUsage)
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
});

// Tracks
app.get('/api/tracks/:userId', authenticateToken, enforceQuota, (req, res) => {
  try {
    if (!isValidDiscordId(req.params.userId)) {
      return res.status(400).json({ success: false, error: 'INVALID_USER_ID' });
    }
    const tracks = getUserMp3s(req.params.userId);
    res.json({ success: true, tracks, userId: req.params.userId, count: tracks.length });
  } catch (e) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
});

// OSINT
app.get('/api/osint/:userId', authenticateToken, enforceQuota, (req, res) => {
  try {
    if (!isValidDiscordId(req.params.userId)) {
      return res.status(400).json({ success: false, error: 'INVALID_USER_ID' });
    }
    
    const userId = req.params.userId;
    const rawNames = dbQuery("select", "SELECT DISTINCT user_name FROM recordings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10", [userId]);
    const rawGuilds = dbQuery("select", "SELECT DISTINCT guild_name FROM recordings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10", [userId]);
    const rawMessages = dbQuery("select", "SELECT content, timestamp FROM osint_messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10", [userId]);
    const rawAvatars = dbQuery("select", "SELECT avatar_url FROM osint_avatars WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1", [userId]);
    const blacklist = JSON.parse(dbQuery("select", "SELECT COUNT(*) as count FROM blacklisted_users WHERE user_id = ?", [userId]) || "[{"count":0}]")[0].count;
    
    res.json({
      success: true,
      blacklisted: blacklist > 0,
      names: rawNames ? JSON.parse(rawNames).map(r => r.user_name) : [],
      guilds: rawGuilds ? JSON.parse(rawGuilds).map(r => r.guild_name) : [],
      messages: rawMessages ? JSON.parse(rawMessages).map(r => ({ content: r.content, timestamp: r.timestamp })) : [],
      avatars: rawAvatars ? JSON.parse(rawAvatars).map(r => r.avatar_url) : []
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
});

// Payment
app.post('/api/payment/submit', authenticateToken, async (req, res) => {
  const { txid, crypto } = req.body;
  const userId = req.user.userId;
  
  if (!isValidTxid(txid) || !isValidCrypto(crypto)) {
    return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
  }
  
  try {
    const existing = JSON.parse(dbQuery("select", "SELECT id FROM payments WHERE user_id = ? AND status = 'verifying'", [userId]));
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'PENDING_PAYMENT', message: 'You already have a payment pending.' });
    }
    
    dbQuery("update", "INSERT INTO payments (user_id, txid, crypto, plan_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, txid, crypto, 'premium', 'verifying', new Date().toISOString()]);
    
    const result = await verifyTxid(txid, crypto);
    if (result.success) {
      dbQuery("update", "UPDATE payments SET status = 'approved', verified_at = datetime('now') WHERE txid = ?", [txid]);
      dbQuery("update", "UPDATE users SET subscription_expires = datetime('now', '+30 days'), plan = 'premium' WHERE id = ?", [userId]);
      res.json({ success: true, message: 'Premium access granted!', plan: 'premium' });
    } else {
      dbQuery("update", "UPDATE payments SET status = 'failed', failure_reason = ? WHERE txid = ?", [result.error || result.message, txid]);
      res.status(400).json({ success: false, error: result.error || 'VERIFICATION_FAILED', message: result.message });
    }
  } catch (e) {
    console.error(`[PAYMENT] Error for user ${userId}:`, e.message);
    dbQuery("update", "UPDATE payments SET status = 'error', failure_reason = ? WHERE txid = ?", [e.message, txid]);
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
});

// Fleet
app.post('/api/fleet/restart', authenticateToken, requireAdmin, (req, res) => {
  try {
    dbQuery("update", "UPDATE bot_state SET force_kick = 1, target_channel_id = NULL, target_user_id = NULL");
    res.json({ success: true, message: 'Fleet restart signal sent.' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

app.post('/api/fleet/panic', authenticateToken, requireAdmin, (req, res) => {
  try {
    dbQuery("update", "UPDATE fleet_config SET panic_disconnect = 1 WHERE id = 1");
    dbQuery("update", "UPDATE bot_state SET force_kick = 1, disabled = 1");
    res.json({ success: true, message: 'PANIC DISCONNECT activated.' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

// ============================================
// 12. UTILITY FUNCTIONS
// ============================================

function getUserMp3s(userId) {
  const userDir = path.resolve(path.join(__dirname, '../recordings'), userId);
  if (!fs.existsSync(userDir)) return [];
  try {
    return fs.readdirSync(userDir)
      .filter(f => f.endsWith('.mp3'))
      .map((f, i) => {
        const match = f.match(/^(\d{8})_(\d{6})/);
        const startTime = match ? match[1] + '_' + match[2] : f.substring(0, 15);
        const channelName = f.replace(/^\d{8}_\d{6}_/, '').replace('.mp3', '');
        return { id: i, user_id: userId, channel_name: channelName, filepath: `${userId}/${f}`, start_time: startTime, duration_seconds: 0, filename: f };
      });
  } catch (e) {
    return [];
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; 
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// 13. ERROR HANDLING
// ============================================

app.use('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/recordings/')) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: IS_PROD ? 'Internal server error.' : err.message
  });
});

// ============================================
// 14. START SERVER
// ============================================

const PORT = process.env.PORT || 80;
const server = app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║           CIPHER_OS v2.0.0 - Production Server Active           ║`);
  console.log(`╠════════════════════════════════════════════════════════════╣`);
  console.log(`║  Environment: ${NODE_ENV.toUpperCase().padEnd(40)}║`);
  console.log(`║  Port: ${String(PORT).padEnd(48)}║`);
  console.log(`║  Security: Enhanced (Rate Limiting, Helmet, CORS)             ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
});

// Graceful shutdown
['SIGTERM', 'SIGINT'].forEach(sig => {
  process.on(sig, () => {
    console.log(`\n[SYSTEM] ${sig} received. Shutting down gracefully...`);
    server.close(() => { console.log('[SYSTEM] Server closed.'); db.close(); process.exit(0); });
    setTimeout(() => { console.error('[SYSTEM] Force shutdown'); process.exit(1); }, 30000);
  });
});

process.on('uncaughtException', (err) => { console.error('[CRITICAL] Uncaught Exception:', err); process.exit(1); });
process.on('unhandledRejection', (reason) => { console.error('[CRITICAL] Unhandled Rejection:', reason); });

module.exports = app;
