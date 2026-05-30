import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ============================================
// Theme Context Types
// ============================================

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// Theme Provider Component
// ============================================

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
}

export function ThemeProvider({ children, theme: initialTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Initialize from localStorage or props
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initial = savedTheme || (prefersDark ? 'dark' : 'light');
    if (initial !== theme) {
      setTheme(initial);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
