import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, AlertCircle, Check, X, 
  Bitcoin, Litecoin, Ethereum, Copy, ExternalLink,
  Clock, ArrowRight, Sparkles
} from 'lucide-react';
import { useIsPremium, useIsAdmin, useUser, usePaymentStatus } from '../store/useStore';
import { usePaymentActions } from '../store/useStore';
import { cn } from '../utils/cn';
import { Spinner } from '../components/LoadingScreen';

// ============================================
// Payment Page Component
// ============================================

// Wallet addresses
const WALLETS = {
  BTC: { 
    address: 'bc1q0w8qf2gq4xa026y9shxca6enepchxwhcyqdwzk',
    icon: Bitcoin,
    color: '#f7931a',
    name: 'Bitcoin'
  },
  LTC: {
    address: 'LRkpb1veWZdmaWdDsKrQyagetxrrjZLhVd',
    icon: Litecoin,
    color: '#bfbbbb',
    name: 'Litecoin'
  },
  ETH: {
    address: '0xbd4011c9742d73024DDa776B1e2cCc3b9Cccb107',
    icon: Ethereum,
    color: '#627eea',
    name: 'Ethereum'
  }
} as const;

// Price data
const PRICES = {
  BTC: 65000,
  LTC: 80,
  ETH: 3500
};

interface CryptoOptionProps {
  crypto: keyof typeof WALLETS;
  selected: boolean;
  onSelect: (crypto: keyof typeof WALLETS) => void;
}

const CryptoOption: React.FC<CryptoOptionProps> = ({ crypto, selected, onSelect }) => {
  const wallet = WALLETS[crypto];
  const Icon = wallet.icon;

  return (
    <motion.button
      onClick={() => onSelect(crypto)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3',
        selected ? 'border-brand-primary bg-brand-primary/5' : 'border-border-primary bg-bg-card/30 hover:border-brand-primary/30'
      )}
      style={selected ? { borderColor: wallet.color, backgroundColor: `${wallet.color}1A` } : {}}
    >
      <Icon className="w-8 h-8" style={{ color: wallet.color }} />
      <span className="font-mono text-sm tracking-wider">{crypto}</span>
      <span className="text-text-muted font-mono text-xs">${PRICES[crypto].toLocaleString()}</span>
      {selected && (
        <motion.div
          className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <Check className="w-4 h-4 text-black" />
        </motion.div>
      )}
    </motion.button>
  );
};

interface PaymentStatusProps {
  status: 'verifying' | 'approved' | 'failed' | 'idle';
  txid: string | null;
  crypto: string | null;
  message?: string;
}

const PaymentStatusDisplay: React.FC<PaymentStatusProps> = ({ status, txid, crypto, message }) => {
  const statusConfig = {
    verifying: { icon: Clock, color: 'brand-secondary', label: 'VERIFYING', message: 'Transaction is being verified...' },
    approved: { icon: ShieldCheck, color: 'brand-success', label: 'APPROVED', message: 'Payment verified! Premium access granted.' },
    failed: { icon: AlertCircle, color: 'brand-error', label: 'FAILED', message: message || 'Verification failed' },
    idle: { icon: CreditCard, color: 'brand-primary', label: 'PENDING', message: 'Awaiting transaction' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-6 rounded-xl border-2 flex items-center gap-4',
        config.color === 'brand-primary' ? 'border-brand-primary/30 bg-brand-primary/5' :
        config.color === 'brand-secondary' ? 'border-brand-secondary/30 bg-brand-secondary/5' :
        config.color === 'brand-success' ? 'border-brand-success/30 bg-brand-success/5' :
        config.color === 'brand-error' ? 'border-brand-error/30 bg-brand-error/5' :
        'border-brand-primary/30 bg-brand-primary/5'
      )}
    >
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center',
        config.color === 'brand-primary' ? 'bg-brand-primary/10' :
        config.color === 'brand-secondary' ? 'bg-brand-secondary/10' :
        config.color === 'brand-success' ? 'bg-brand-success/10' :
        config.color === 'brand-error' ? 'bg-brand-error/10' :
        'bg-brand-primary/10'
      )}>
        <Icon className={cn(
          'w-8 h-8',
          config.color === 'brand-primary' ? 'text-brand-primary' :
          config.color === 'brand-secondary' ? 'text-brand-secondary' :
          config.color === 'brand-success' ? 'text-brand-success' :
          config.color === 'brand-error' ? 'text-brand-error' :
          'text-brand-primary'
        )} />
      </div>
      <div className="flex-1">
        <motion.h3
          className={cn(
            'font-display text-lg',
            config.color === 'brand-primary' ? 'text-brand-primary' :
            config.color === 'brand-secondary' ? 'text-brand-secondary' :
            config.color === 'brand-success' ? 'text-brand-success' :
            config.color === 'brand-error' ? 'text-brand-error' :
            'text-brand-primary'
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {config.label}
        </motion.h3>
        <motion.p
          className="text-text-secondary font-mono text-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {config.message}
        </motion.p>
        {txid && (
          <motion.div
            className="mt-3 p-2 bg-bg-card rounded border border-border-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-text-muted font-mono text-xs tracking-wider mb-1">
              TRANSACTION_ID
            </p>
            <p className="text-brand-primary font-mono text-sm truncate">
              {txid}
            </p>
          </motion.div>
        )}
        {crypto && (
          <motion.span
            className="mt-2 inline-block px-3 py-1 bg-bg-secondary rounded text-xs font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {crypto.toUpperCase()}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

const PaymentPage: React.FC = () => {
  const isPremium = useIsPremium();
  const isAdmin = useIsAdmin();
  const user = useUser();
  const paymentStatus = usePaymentStatus();
  
  const { submitPayment, clearPayment, setPaymentTxid, setPaymentCrypto } = usePaymentActions();
  
  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof WALLETS>('BTC');
  const [txid, setLocalTxid] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(50);

  // Redirect if already premium
  useEffect(() => {
    if (isPremium) {
      // Stay on page for premium users to see their status
    }
  }, [isPremium]);

  // Handle crypto selection
  const handleCryptoSelect = (crypto: keyof typeof WALLETS) => {
    setSelectedCrypto(crypto);
    setPaymentCrypto(crypto);
  };

  // Handle TXID change
  const handleTxidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTxid(e.target.value);
    setPaymentTxid(e.target.value);
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  // Calculate required crypto amount
  const getRequiredAmount = (crypto: keyof typeof WALLETS) => {
    return (amount / PRICES[crypto]).toFixed(8);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!txid.trim()) {
      return;
    }

    try {
      setLoading(true);
      clearPayment();
      await submitPayment(txid, selectedCrypto);
    } finally {
      setLoading(false);
    }
  };

  // Handle copy wallet address
  const handleCopy = (crypto: keyof typeof WALLETS) => {
    const address = WALLETS[crypto].address;
    navigator.clipboard.writeText(address);
    setCopied(crypto);
    setTimeout(() => setCopied(null), 2000);
  };

  // Clear payment
  const handleClear = () => {
    clearPayment();
    setLocalTxid('');
  };

  // Check if payment is being processed
  const isProcessing = paymentStatus === 'verifying' || loading;

  // Show success state
  const showSuccess = paymentStatus === 'approved' || (isPremium && !loading);

  // If already premium and not processing
  if (showSuccess && !isProcessing) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          >
            <ShieldCheck className="w-20 h-20 text-brand-success" />
            <motion.div
              className="absolute inset-0 border-2 border-brand-success/30 rounded-full"
              style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
          
          <motion.h2
            className="text-3xl font-display text-brand-success mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            PREMIUM_ACCESS
          </motion.h2>
          
          <motion.p
            className="text-text-secondary font-mono text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            YOUR_SUBSCRIPTION_IS_ACTIVE
          </motion.p>

          <motion.div
            className="p-6 rounded-xl border border-brand-success/30 bg-brand-success/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-mono text-xs tracking-wider">
                  SUBSCRIPTION_STATUS
                </span>
                <span className="text-brand-success font-mono text-sm">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-mono text-xs tracking-wider">
                  PLAN_TYPE
                </span>
                <span className="text-brand-primary font-mono text-sm">
                  PREMIUM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-mono text-xs tracking-wider">
                  ACCESS_LEVEL
                </span>
                <span className="text-brand-primary font-mono text-sm">
                  ALPHA
                </span>
              </div>
            </div>
          </motion.div>

          <motion.p
            className="text-text-muted/50 font-mono text-xs mt-8 tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            [ ALL_FEATURES_UNLOCKED ]
          </motion.p>
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
              PREMIUM_ACCESS
            </motion.h1>
            <motion.p
              className="text-text-secondary font-mono text-sm tracking-wider mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              [ UNLOCK_ADVANCED_FEATURES ]
            </motion.p>
          </div>

          {isPremium && (
            <motion.div
              className="px-4 py-2 bg-brand-success/10 border border-brand-success/20 rounded-lg"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-brand-success font-mono text-sm">
                ALREADY_PREMIUM
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Current Payment Status */}
      <AnimatePresence>
        {(paymentStatus !== 'idle' || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <PaymentStatusDisplay
              status={paymentStatus}
              txid={txid || null}
              crypto={selectedCrypto || null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Card */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="p-8 rounded-2xl border-2 border-brand-primary/30 bg-gradient-to-br from-bg-card/30 to-bg-secondary/30 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          >
            <Sparkles className="w-12 h-12 text-brand-primary mx-auto mb-6" />
            
            <motion.h3
              className="text-2xl font-display text-brand-primary mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              PREMIUM_SUBSCRIPTION
            </motion.h3>
            
            <motion.div
              className="text-5xl font-display text-brand-primary mb-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              ${amount}
            </motion.div>
            
            <motion.p
              className="text-text-secondary font-mono text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ONE_TIME_PAYMENT
            </motion.p>

            <motion.div
              className="p-4 bg-bg-primary/10 rounded-lg border border-border-primary mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-text-muted font-mono text-xs tracking-wider mb-2">
                INCLUDED_FEATURES
              </p>
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  'UNLIMITED_SEARCHES',
                  'ADVANCED_ANALYTICS',
                  'SNIPE_CENTER',
                  'PRIORITY_SUPPORT',
                  'EARLY_ACCESS',
                  'CUSTOM_CONFIGS'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-brand-primary" />
                    <span className="text-brand-primary font-mono text-xs">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-mono text-xs">
                  PRICE:
                </span>
                <select
                  value={amount}
                  onChange={handleAmountChange}
                  className="bg-bg-card border border-border-primary rounded px-3 py-2 font-mono text-sm"
                >
                  <option value={50}>$50 USD</option>
                  <option value={100}>$100 USD</option>
                </select>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Payment Form */}
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="p-8 rounded-xl border border-border-primary bg-bg-card/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.h3
            className="text-brand-primary font-mono text-sm tracking-wider mb-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            COMPLETE_PAYMENT
          </motion.h3>

          {/* Crypto Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <p className="text-text-muted font-mono text-xs tracking-wider mb-4">
              SELECT_CRYPTOCURRENCY
            </p>
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(WALLETS) as Array<keyof typeof WALLETS>).map((crypto) => (
                <CryptoOption
                  key={crypto}
                  crypto={crypto}
                  selected={selectedCrypto === crypto}
                  onSelect={handleCryptoSelect}
                />
              ))}
            </div>
          </motion.div>

          {/* Wallet Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 p-4 bg-bg-secondary rounded-lg border border-border-primary"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted font-mono text-xs tracking-wider">
                SEND_TO_ADDRESS
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopy(selectedCrypto)}
                className={cn(
                  'px-2 py-1 rounded text-xs font-mono flex items-center gap-1',
                  copied === selectedCrypto 
                    ? 'bg-brand-success/10 text-brand-success border border-brand-success/20'
                    : 'bg-bg-card text-text-muted border border-border-primary'
                )}
              >
                {copied === selectedCrypto ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === selectedCrypto ? 'COPIED' : 'COPY'}
              </motion.button>
            </div>
            <p className="text-brand-primary font-mono text-sm break-all">
              {WALLETS[selectedCrypto].address}
            </p>
            <p className="text-text-muted font-mono text-xs mt-2">
              {WALLETS[selectedCrypto].name} ({selectedCrypto})
            </p>
            <motion.p
              className="text-text-muted/50 font-mono text-xs mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              MINIMUM: {getRequiredAmount(selectedCrypto)} {selectedCrypto}
            </motion.p>
          </motion.div>

          {/* TXID Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label className="text-text-muted font-mono text-xs tracking-wider mb-2 block">
              TRANSACTION_ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={`ENTER_${selectedCrypto}_TXID`}
                value={txid}
                onChange={handleTxidChange}
                className="w-full pl-4 pr-12 py-3 bg-bg-card/50 border border-border-primary rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
              {txid && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-brand-error transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isProcessing || !txid.trim()}
            className="w-full py-4 mt-6 bg-gradient-to-r from-brand-primary to-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed text-black font-display font-semibold tracking-wider rounded-lg overflow-hidden transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" />
                <span>VERIFYING_TRANSACTION</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>SUBMIT_PAYMENT</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
            <div className="absolute inset-0 bg-white/20" />
          </motion.button>

          {/* Info */}
          <motion.p
            className="text-center mt-6 text-text-muted/50 font-mono text-xs tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            [ TRANSACTIONS_TYPICALLY_VERIFY_IN_5-30_MINUTES ]
          </motion.p>
        </motion.div>

        {/* External Links */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p className="text-text-muted font-mono text-xs tracking-wider mb-4">
            NEED_CRYPTO?
          </p>
          <div className="flex justify-center gap-4">
            {[
              { name: 'Coinbase', url: 'https://coinbase.com' },
              { name: 'Binance', url: 'https://binance.com' },
              { name: 'Kraken', url: 'https://kraken.com' },
            ].map((exchange, index) => (
              <motion.a
                key={exchange.name}
                href={exchange.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 border border-border-primary rounded-lg font-mono text-xs hover:border-brand-primary/30 transition-colors flex items-center gap-2"
              >
                {exchange.name}
                <ExternalLink className="w-3 h-3" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scanner Effect */}
      <div className="scanner-line" />
    </div>
  );
};

export default PaymentPage;
