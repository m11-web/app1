import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // 'dark' | 'light' | null
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    // If user has manually saved a preference, honour it.
    // Otherwise stay with the system default.
    AsyncStorage.getItem('rh_theme').then(saved => {
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    });
  }, []);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('rh_theme', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
