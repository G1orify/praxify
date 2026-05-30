import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const API_TIMEOUT = 30000; // 30 seconds

// ============================================
// Custom Error Classes
// ============================================

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public data?: any,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends ApiError {
  constructor(message: string = 'Authentication failed', status: number = 401) {
    super(status, message, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', errors?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for rate limit errors
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(429, message, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Custom error class for not found errors
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Custom error class for quota/access errors
 */
export class QuotaError extends ApiError {
  constructor(message: string = 'Premium access required') {
    super(402, message, 'QUOTA_ERROR', {}, new Error(message));
    this.name = 'QuotaError';
  }
}

// ============================================
// API Client Setup
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; error?: string; message?: string; errors?: any }>) => {
    const { response, request, config } = error;
    
    // Network error (no response)
    if (!response) {
      if (request) {
        // Request was made but no response received
        toast.error('Network error. Please check your connection.');
      }
      return Promise.reject(new ApiError(0, 'Network error', 'NETWORK_ERROR', null, error));
    }
    
    const { status, data } = response;
    const errorMessage = data?.message || data?.error || 'An error occurred';
    const errorCode = data?.error || 'UNKNOWN_ERROR';
    
    // Handle specific error statuses
    switch (status) {
      case 400:
        if (errorCode === 'VALIDATION_ERROR') {
          return Promise.reject(new ValidationError(errorMessage, data?.errors));
        }
        return Promise.reject(new ApiError(status, errorMessage, errorCode, data));
      
      case 401:
      case 403:
        // Remove token on auth errors
        localStorage.removeItem('auth_token');
        // Don't show toast for auth errors (handled by AuthContext)
        return Promise.reject(new AuthError(errorMessage, status));
      
      case 402:
        return Promise.reject(new QuotaError(errorMessage));
      
      case 404:
        return Promise.reject(new NotFoundError(errorMessage));
      
      case 429:
        const retryAfter = response.headers['retry-after'] || response.headers['x-ratelimit-reset'];
        const waitTime = retryAfter ? Math.ceil(parseInt(retryAfter.toString()) / 60) : 15;
        toast.error(`Rate limit exceeded. Try again in ${waitTime} minutes.`);
        return Promise.reject(new RateLimitError(errorMessage, waitTime * 60));
      
      case 408: // Request Timeout
        toast.error('Request timeout. Please try again.');
        return Promise.reject(new ApiError(status, 'Request timeout', 'TIMEOUT_ERROR'));
      
      case 500:
      case 502:
      case 503:
      case 504:
        toast.error('Server error. Please try again later.');
        return Promise.reject(new ApiError(status, 'Server error', 'SERVER_ERROR'));
      
      default:
        // For other errors, show a generic message
        if (errorMessage && !errorMessage.includes('network')) {
          toast.error(errorMessage);
        }
        return Promise.reject(new ApiError(status, errorMessage, errorCode, data));
    }
  }
);

// ============================================
// Typed API Methods
// ============================================

/**
 * Generic GET request
 */
export async function get<T>(url: string, config?: any): Promise<T> {
  try {
    const response = await api.get<T>(url, config);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Request failed', 'UNKNOWN_ERROR', null, error as Error);
  }
}

/**
 * Generic POST request
 */
export async function post<T>(url: string, data?: any, config?: any): Promise<T> {
  try {
    const response = await api.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Request failed', 'UNKNOWN_ERROR', null, error as Error);
  }
}

/**
 * Generic PUT request
 */
export async function put<T>(url: string, data?: any, config?: any): Promise<T> {
  try {
    const response = await api.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Request failed', 'UNKNOWN_ERROR', null, error as Error);
  }
}

/**
 * Generic PATCH request
 */
export async function patch<T>(url: string, data?: any, config?: any): Promise<T> {
  try {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Request failed', 'UNKNOWN_ERROR', null, error as Error);
  }
}

/**
 * Generic DELETE request
 */
export async function del<T>(url: string, config?: any): Promise<T> {
  try {
    const response = await api.delete<T>(url, config);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Request failed', 'UNKNOWN_ERROR', null, error as Error);
  }
}

// ============================================
// API Endpoint Functions
// ============================================

// Auth Endpoints
export const authApi = {
  login: (username: string, password: string) => post<{ success: boolean; token: string; user: any }>('/auth/login', { username, password }),
  signup: (username: string, password: string, captchaToken: string) => post<{ success: boolean; message: string }>('/auth/signup', { username, password, captchaToken }),
  me: () => get<{ success: boolean; user: any }>('/auth/me'),
  logout: () => post<{ success: boolean; message: string }>('/auth/logout'),
};

// Stats Endpoints
export const statsApi = {
  get: () => get<{ success: boolean; stats: any }>('/stats'),
};

// Bots Endpoints
export const botsApi = {
  list: () => get<{ success: boolean; bots: any[]; count: number }>('/bots'),
  get: (botId: number) => get<{ success: boolean; bot: any }>(`/bots/${botId}`),
};

// Tracks Endpoints
export const tracksApi = {
  get: (userId: string) => get<{ success: boolean; tracks: any[]; userId: string; count: number }>(`/tracks/${userId}`),
};

// OSINT Endpoints
export const osintApi = {
  get: (userId: string) => get<{ success: boolean; blacklisted: boolean; names: string[]; guilds: string[]; messages: any[]; avatars: string[] }>(`/osint/${userId}`),
};

// Payment Endpoints
export const paymentApi = {
  submit: (txid: string, crypto: string) => post<{ success: boolean; message: string; plan: string }>('/payment/submit', { txid, crypto }),
  status: () => get<{ success: boolean; payments: any[] }>('/payment/status'),
};

// Fleet Endpoints
export const fleetApi = {
  restart: () => post<{ success: boolean; message: string }>('/fleet/restart'),
  panic: () => post<{ success: boolean; message: string }>('/fleet/panic'),
};

// Health Check
export const healthApi = {
  check: () => get<{ status: string; timestamp: string; version: string; environment: string }>('/health'),
};

// ============================================
// API Helper Functions
// ============================================

/**
 * Checks if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Checks if an error is an auth error
 */
export function isAuthError(error: any): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Checks if an error is a rate limit error
 */
export function isRateLimitError(error: any): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Checks if an error is a quota error
 */
export function isQuotaError(error: any): error is QuotaError {
  return error instanceof QuotaError;
}

/**
 * Gets error message from any error
 */
export function getErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An error occurred';
}

/**
 * Gets error code from any error
 */
export function getErrorCode(error: any): string | undefined {
  if (error instanceof ApiError) {
    return error.code;
  }
  return undefined;
}

// ============================================
// Export
// ============================================

export default {
  get,
  post,
  put,
  patch,
  del,
  // API instances
  api,
  // Endpoint groups
  auth: authApi,
  stats: statsApi,
  bots: botsApi,
  tracks: tracksApi,
  osint: osintApi,
  payment: paymentApi,
  fleet: fleetApi,
  health: healthApi,
  // Error helpers
  isApiError,
  isAuthError,
  isValidationError,
  isRateLimitError,
  isQuotaError,
  getErrorMessage,
  getErrorCode,
  // Error classes
  ApiError,
  AuthError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  QuotaError,
};
