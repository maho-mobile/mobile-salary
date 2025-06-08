export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: 'company' | 'individual';
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  dailyEarnings: DailyEarning[];
  userId: string;
}

export interface DailyEarning {
  id: string;
  date: string;
  amount: number;
  employeeId?: string;
}

export interface TaxRates {
  tax: number;
  retirement: number;
  insurance: number;
}

export interface SalaryCalculation {
  grossSalary: number;
  taxDeduction: number;
  retirementDeduction: number;
  insuranceDeduction: number;
  totalDeductions: number;
  netSalary: number;
  workingDays: number;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
  };
}