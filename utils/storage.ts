import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaxRates, Employee, DailyEarning } from '@/types';

const getStorageKey = (key: string) => Platform.select({
  web: key,
  default: `@${key}`
});

export const getStorageValue = async (key: string): Promise<string | null> => {
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

export const setStorageValue = async (key: string, value: string) => {
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

export const removeStorageValue = async (key: string) => {
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

// Tax rates
export const getTaxRates = async (): Promise<TaxRates> => {
  const data = await getStorageValue('tax_rates');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Return default rates
    }
  }
  return { tax: 10, retirement: 10, insurance: 5 };
};

export const setTaxRates = async (rates: TaxRates) => {
  await setStorageValue('tax_rates', JSON.stringify(rates));
};

// Employees
export const getEmployees = async (userId: string): Promise<Employee[]> => {
  const data = await getStorageValue(`employees_${userId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

export const setEmployees = async (userId: string, employees: Employee[]) => {
  await setStorageValue(`employees_${userId}`, JSON.stringify(employees));
};

// Individual earnings
export const getIndividualEarnings = async (userId: string): Promise<DailyEarning[]> => {
  const data = await getStorageValue(`individual_earnings_${userId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

export const setIndividualEarnings = async (userId: string, earnings: DailyEarning[]) => {
  await setStorageValue(`individual_earnings_${userId}`, JSON.stringify(earnings));
};