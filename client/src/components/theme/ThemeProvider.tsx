import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    // Initialize theme from tenant settings or localStorage
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      setTheme(stored);
    } else if (tenant?.theme) {
      setTheme(tenant.theme as Theme);
    }
  }, [tenant]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      setActualTheme(isDark ? 'dark' : 'light');
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(systemTheme.matches);
      
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      systemTheme.addEventListener('change', listener);
      return () => systemTheme.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
