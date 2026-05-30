// ============================================
// CIPHER_OS Type Definitions
// ============================================

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: number | bigint;
  username: string;
  role: UserRole;
  plan: UserPlan;
  subscription_expires?: string;
  searches_used?: number;
  created_at?: string;
  updated_at?: string;
  isSubscribed?: boolean;
}

export type UserRole = 'user' | 'admin' | 'moderator';
export type UserPlan = 'free' | 'basic' | 'premium';

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  captchaToken: string;
}

export interface PaymentInfo {
  user_id: number | string;
  txid: string;
  crypto: CryptoType;
  plan_type: UserPlan;
  status: PaymentStatus;
  failure_reason?: string;
  created_at?: string;
  verified_at?: string;
}

export type PaymentStatus = 'verifying' | 'approved' | 'failed' | 'error';
export type CryptoType = 'BTC' | 'LTC' | 'ETH';

// ============================================
// Bot & Fleet Types
// ============================================

export interface Bot {
  bot_id: number;
  bot_name: string;
  current_vc?: string;
  state: BotState;
  log?: string;
  updated_at?: string;
  target_channel_id?: string | null;
  target_user_id?: string | null;
  override_presence?: string | null;
  disabled?: boolean;
  force_kick?: boolean;
  online?: boolean;
}

export type BotState = 
  | 'Idle'
  | 'Recording'
  | 'Moving'
  | 'Sniper Mode'
  | 'User Sniper'
  | 'Crowd-Seeking'
  | 'Deep-Sweep'
  | 'Disabled'
  | 'Offline'
  | 'Error'
  | string;

export interface BotConfig {
  target_channel_id?: string;
  target_user_id?: string;
  override_presence?: string;
  disabled: boolean;
}

export interface FleetConfig {
  id: number;
  freeze_all: boolean;
  panic_disconnect: boolean;
}

export interface FleetStatus {
  online: number;
  offline: number;
  total: number;
  freeze_all: boolean;
  panic_disconnect: boolean;
}

// ============================================
// Recording & Track Types
// ============================================

export interface Recording {
  id: number;
  user_id: string | number | bigint;
  user_name: string;
  display_name?: string;
  guild_name?: string;
  channel_name: string;
  filepath: string;
  start_time: string;
  duration_seconds: number;
  timestamp?: string;
  end_time?: string;
  total_packets?: number;
  total_bytes?: number;
}

export interface Track extends Recording {
  url?: string;
  duration: string;
  filename?: string;
}

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  size: number;
  duration: number;
  createdAt: string;
  userId: string;
  channelName: string;
}

// ============================================
// OSINT (Open Source Intelligence) Types
// ============================================

export interface OSINTData {
  success: boolean;
  blacklisted: boolean;
  userId: string;
  names: string[];
  guilds: string[];
  messages: OSINTMessage[];
  avatars: string[];
}

export interface OSINTMessage {
  content: string;
  timestamp?: string;
  channel_id?: string;
  guild_id?: string;
  message_id?: string;
}

export interface OSINTProfile {
  userId: string;
  usernames: string[];
  displayNames: string[];
  guilds: OSINTGuild[];
  messages: OSINTMessage[];
  avatars: OSINTAvatar[];
  firstSeen?: string;
  lastSeen?: string;
  activityPattern?: ActivityPattern;
}

export interface OSINTGuild {
  id: string;
  name: string;
  joinedAt?: string;
  leftAt?: string;
}

export interface OSINTAvatar {
  url: string;
  capturedAt: string;
}

export interface ActivityPattern {
  // Activity heatmap data
  heatmap: HeatmapData[];
  // Most active days
  activeDays: string[];
  // Most active hours
  activeHours: number[];
  // Total activity count
  totalActivity: number;
}

// ============================================
// Heatmap & Analytics Types
// ============================================

export interface HeatmapData {
  dow: number; // Day of week (0-6)
  hour: number; // Hour of day (0-23)
  count: number; // Activity count
}

export interface ActivityStats {
  totalRecordings: number;
  totalDuration: number; // in seconds
  averageDuration: number;
  mostActiveDay: string;
  mostActiveHour: number;
  activityByChannel: Record<string, number>;
  activityByGuild: Record<string, number>;
}

export interface UserAnalytics {
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  sessionsByDay: Record<string, number>;
  sessionsByHour: Record<number, number>;
  heatmap: HeatmapData[];
}

// ============================================
// Statistics & Metrics Types
// ============================================

export interface Stats {
  totalRecordings: number;
  onlineBots: number;
  totalUsers: number;
  premiumUsers?: number;
  recentRecordings?: number;
  diskUsage?: number;
  diskUsageFormatted?: string;
  activeSessions?: number;
  totalGuilds?: number;
}

export interface SystemStats extends Stats {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseSize: number;
  requestsPerMinute: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  code?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================
// Search & Filter Types
// ============================================

export interface SearchParams {
  query: string;
  userId?: string;
  guildId?: string;
  channelId?: string;
  dateFrom?: string;
  dateTo?: string;
  durationMin?: number;
  durationMax?: number;
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

// ============================================
// UI & Component Types
// ============================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export interface StatCardProps {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export interface TableColumn<T> {
  key: string;
  header: string | React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

// ============================================
// Navigation Types
// ============================================

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
  requireAuth?: boolean;
  requirePremium?: boolean;
  requireAdmin?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// ============================================
// Event Types
// ============================================

export interface SocketEvent {
  type: string;
  data: any;
  timestamp: number;
}

export type SocketEventType = 
  | 'bot:status'
  | 'bot:connected'
  | 'bot:disconnected'
  | 'recording:started'
  | 'recording:completed'
  | 'recording:error'
  | 'fleet:status'
  | 'user:subscribed'
  | 'stats:updated';

export interface SocketEventMap {
  'bot:status': { botId: number; status: BotState; };
  'bot:connected': { botId: number; botName: string; };
  'bot:disconnected': { botId: number; botName: string; };
  'recording:started': { botId: number; userId: string; channelName: string; };
  'recording:completed': { botId: number; userId: string; filepath: string; duration: number; };
  'recording:error': { botId: number; userId: string; error: string; };
  'fleet:status': FleetStatus;
  'user:subscribed': { userId: number; plan: UserPlan; };
  'stats:updated': Stats;
}

// ============================================
// Form Types
// ============================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  options?: { value: any; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  pattern?: string;
  autoComplete?: string;
}

export interface FormErrors {
  [key: string]: string | string[] | undefined;
}

// ============================================
// Payment & Billing Types
// ============================================

export interface PriceInfo {
  crypto: CryptoType;
  address: string;
  amountUsd: number;
  amountCrypto: number;
  convertedAt: string;
}

export interface Plan {
  id: UserPlan;
  name: string;
  price: number;
  priceId: string;
  currency: string;
  features: string[];
  isPopular: boolean;
  description: string;
}

export interface Subscription {
  userId: number;
  plan: UserPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';

// ============================================
// Settings Types
// ============================================

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  playback: PlaybackSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  recordingComplete: boolean;
  botStatusChange: boolean;
  paymentReceived: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  analytics: boolean;
  publicProfile: boolean;
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

export interface PlaybackSettings {
  volume: number; // 0-100
  playbackRate: number; // 0.5-2.0
  autoPlay: boolean;
  quality: 'low' | 'medium' | 'high';
}

// ============================================
// Blacklist & Moderation Types
// ============================================

export interface BlacklistEntry {
  id: string | number;
  type: 'user' | 'guild' | 'channel';
  reason?: string;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
}

export interface ModerationAction {
  type: 'warn' | 'mute' | 'kick' | 'ban';
  targetId: string;
  targetType: 'user' | 'guild' | 'channel';
  reason: string;
  duration?: number; // in minutes
  createdAt: string;
  createdBy: string;
}

// ============================================
// Export
// ============================================

export type {
  UserRole,
  UserPlan,
  PaymentStatus,
  CryptoType,
  BotState,
  ToastMessage,
  SocketEventType,
  SubscriptionStatus,
};

export default {
  User,
  UserRole,
  UserPlan,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  PaymentInfo,
  PaymentStatus,
  CryptoType,
  Bot,
  BotState,
  BotConfig,
  FleetConfig,
  FleetStatus,
  Recording,
  Track,
  AudioFile,
  OSINTData,
  OSINTMessage,
  OSINTProfile,
  OSINTGuild,
  OSINTAvatar,
  ActivityPattern,
  HeatmapData,
  ActivityStats,
  UserAnalytics,
  Stats,
  SystemStats,
  ApiResponse,
  PaginatedResponse,
  Pagination,
  SearchParams,
  FilterOptions,
  SortOption,
  ToastMessage,
  ModalProps,
  CardProps,
  StatCardProps,
  TableColumn,
  NavItem,
  BreadcrumbItem,
  SocketEvent,
  SocketEventType,
  SocketEventMap,
  FormField,
  FormErrors,
  PriceInfo,
  Plan,
  Subscription,
  SubscriptionStatus,
  UserSettings,
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
  PlaybackSettings,
  BlacklistEntry,
  ModerationAction,
};
