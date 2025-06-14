export const API_ROUTES = {
  CHAT: '/api/chat',
  USER: '/api/user',
  FINANCIAL: '/api/financial',
} as const;

export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
} as const;

export const CHAT_CONFIG = {
  MAX_MESSAGES: 50,
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_INDICATOR_DELAY: 1000,
} as const;

export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  INVALID_INPUT: 'Invalid input provided.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
} as const;

export const LOCAL_STORAGE_KEYS = {
  CHAT_HISTORY: 'chat_history',
  USER_PREFERENCES: 'user_preferences',
} as const; 