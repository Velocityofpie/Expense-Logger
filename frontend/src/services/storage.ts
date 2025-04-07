// src/services/storage.ts
/**
 * Local storage service
 * Provides utilities for working with browser's localStorage
 */

// Key constants for storage items
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'dark_mode',
  PREFERENCES: 'user_preferences',
  SESSION_EXPIRES: 'session_expires_at'
};

/**
 * Set a value in localStorage with optional expiration
 * @param key Storage key
 * @param value Value to store
 * @param expirationHours Optional expiration time in hours
 */
export const setStorageItem = <T>(key: string, value: T, expirationHours?: number): void => {
  try {
    const item = {
      value,
      expiry: expirationHours ? new Date().getTime() + expirationHours * 60 * 60 * 1000 : null
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
    // Fallback: try without stringifying for simple string values
    if (typeof value === 'string') {
      try {
        localStorage.setItem(key, value);
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${key}:`, fallbackError);
      }
    }
  }
};

/**
 * Get a value from localStorage, checking expiration if applicable
 * @param key Storage key
 * @param defaultValue Optional default value if the key doesn't exist
 * @returns Stored value or default value
 */
export const getStorageItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return defaultValue || null;

    try {
      const item = JSON.parse(itemStr);
      
      // Check if the item has an expiry timestamp and is expired
      if (item.expiry && new Date().getTime() > item.expiry) {
        localStorage.removeItem(key);
        return defaultValue || null;
      }
      
      return item.value as T;
    } catch (parseError) {
      // If parsing fails, the item might be a simple string
      return itemStr as unknown as T;
    }
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue || null;
  }
};

/**
 * Remove an item from localStorage
 * @param key Storage key
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
  }
};

/**
 * Clear all items from localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Auth token specific methods
export const setToken = (token: string, expirationHours?: number): void => {
  setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token, expirationHours);
};

export const getToken = (): string | null => {
  return getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
};

export const removeToken = (): void => {
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
};

// User data specific methods
export const setUserData = <T>(userData: T): void => {
  setStorageItem(STORAGE_KEYS.USER_DATA, userData);
};

export const getUserData = <T>(): T | null => {
  return getStorageItem<T>(STORAGE_KEYS.USER_DATA);
};

export const removeUserData = (): void => {
  removeStorageItem(STORAGE_KEYS.USER_DATA);
};

// Theme preference methods
export const setThemePreference = (isDarkMode: boolean): void => {
  setStorageItem(STORAGE_KEYS.THEME, isDarkMode);
};

export const getThemePreference = (): boolean | null => {
  return getStorageItem<boolean>(STORAGE_KEYS.THEME);
};

// User preferences methods
export const setPreferences = <T>(preferences: T): void => {
  setStorageItem(STORAGE_KEYS.PREFERENCES, preferences);
};

export const getPreferences = <T>(): T | null => {
  return getStorageItem<T>(STORAGE_KEYS.PREFERENCES);
};

export const updatePreferences = <T>(newPreferences: Partial<T>): T | null => {
  const currentPreferences = getPreferences<T>() || {} as T;
  const updatedPreferences = { ...currentPreferences, ...newPreferences };
  setPreferences(updatedPreferences);
  return updatedPreferences;
};

// Check if session token is still valid
export const isSessionValid = (): boolean => {
  const expiresAt = getStorageItem<number>(STORAGE_KEYS.SESSION_EXPIRES);
  return !!expiresAt && expiresAt > new Date().getTime();
};

export default {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  setToken,
  getToken,
  removeToken,
  setUserData,
  getUserData,
  removeUserData,
  setThemePreference,
  getThemePreference,
  setPreferences,
  getPreferences,
  updatePreferences,
  isSessionValid,
  STORAGE_KEYS
};