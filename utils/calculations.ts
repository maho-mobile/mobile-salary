import { TaxRates, SalaryCalculation, DailyEarning } from '@/types';

export const calculateSalary = (
  dailyEarnings: DailyEarning[],
  taxRates: TaxRates
): SalaryCalculation => {
  const grossSalary = dailyEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  const workingDays = dailyEarnings.length;
  
  const taxDeduction = (grossSalary * taxRates.tax) / 100;
  const retirementDeduction = (grossSalary * taxRates.retirement) / 100;
  const insuranceDeduction = (grossSalary * taxRates.insurance) / 100;
  
  const totalDeductions = taxDeduction + retirementDeduction + insuranceDeduction;
  const netSalary = grossSalary - totalDeductions;

  return {
    grossSalary,
    taxDeduction,
    retirementDeduction,
    insuranceDeduction,
    totalDeductions,
    netSalary,
    workingDays,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('tr-TR').format(num);
};