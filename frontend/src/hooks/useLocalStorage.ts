import { useState, useEffect } from 'react';

/**
 * Custom hook for managing state with localStorage
 * @param key - The key to use in localStorage
 * @param initialValue - The initial value if no value exists in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key: ${key}`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key: ${key}`, error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`[useLocalStorage] Error setting key: ${key}`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Custom hook for managing a single value in localStorage
 * @param key - The key to use in localStorage
 * @param initialValue - The initial value
 * @returns Object with value, setValue, and removeValue
 */
export function useLocalStorageValue<T>(key: string, initialValue: T) {
  const [value, setValue] = useLocalStorage<T>(key, initialValue);

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(`[useLocalStorageValue] Error removing key: ${key}`, error);
    }
  };

  return { value, setValue, removeValue };
}
