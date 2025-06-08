import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { User } from '@/types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStorageKey = (key: string) => Platform.select({
  web: key,
  default: `@${key}`
});

const getStorageValue = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(getStorageKey(key)!);
    } else {
      return await AsyncStorage.getItem(getStorageKey(key)!);
    }
  } catch {
    return null;
  }
};

const setStorageValue = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(getStorageKey(key)!, value);
    } else {
      await AsyncStorage.setItem(getStorageKey(key)!, value);
    }
  } catch {
    // Handle error silently
  }
};

const removeStorageValue = async (key: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(getStorageKey(key)!);
    } else {
      await AsyncStorage.removeItem(getStorageKey(key)!);
    }
  } catch {
    // Handle error silently
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getStorageValue('current_user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          // Invalid user data, ignore
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const usersData = await getStorageValue('users');
    
    if (!usersData) {
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }

    try {
      const users: User[] = JSON.parse(usersData);
      const foundUser = users.find(u => u.username === username && u.password === password);
      
      if (!foundUser) {
        return { success: false, error: 'Kullanıcı adı veya şifre hatalı' };
      }

      setUser(foundUser);
      await setStorageValue('current_user', JSON.stringify(foundUser));
      return { success: true };
    } catch {
      return { success: false, error: 'Giriş sırasında bir hata oluştu' };
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    // Validation
    if (!userData.firstName.trim()) {
      return { success: false, error: 'Ad gereklidir' };
    }
    if (!userData.lastName.trim()) {
      return { success: false, error: 'Soyad gereklidir' };
    }
    if (!userData.username.trim()) {
      return { success: false, error: 'Kullanıcı adı gereklidir' };
    }
    if (userData.password.length < 4) {
      return { success: false, error: 'Şifre en az 4 karakter olmalıdır' };
    }

    const usersData = await getStorageValue('users');
    let users: User[] = [];
    
    if (usersData) {
      try {
        users = JSON.parse(usersData);
      } catch {
        users = [];
      }
    }

    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      return { success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' };
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await setStorageValue('users', JSON.stringify(users));
    setUser(newUser);
    await setStorageValue('current_user', JSON.stringify(newUser));

    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    await removeStorageValue('current_user');
    // Navigate to login screen after logout
    router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};