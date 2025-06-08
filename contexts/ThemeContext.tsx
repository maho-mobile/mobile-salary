import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeContextType } from '@/types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightColors = {
  primary: '#3B82F6',
  secondary: '#6366F1',
  accent: '#F59E0B',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

const darkColors = {
  primary: '#60A5FA',
  secondary: '#818CF8',
  accent: '#FBBF24',
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#374151',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getStorageKey = () => Platform.select({
  web: 'theme_preference',
  default: '@theme_preference'
});

const getStorageValue = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      const stored = localStorage.getItem(getStorageKey()!);
      return stored === 'dark';
    } else {
      const stored = await AsyncStorage.getItem(getStorageKey()!);
      return stored === 'dark';
    }
  } catch {
    return false;
  }
};

const setStorageValue = async (isDark: boolean) => {
  try {
    const value = isDark ? 'dark' : 'light';
    if (Platform.OS === 'web') {
      localStorage.setItem(getStorageKey()!, value);
    } else {
      await AsyncStorage.setItem(getStorageKey()!, value);
    }
  } catch {
    // Handle error silently
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await getStorageValue();
      setIsDark(storedTheme);
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    setStorageValue(newTheme);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      colors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};