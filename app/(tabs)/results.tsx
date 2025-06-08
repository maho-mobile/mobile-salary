import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Employee, DailyEarning, TaxRates, SalaryCalculation } from '@/types';
import { getEmployees, getIndividualEarnings, getTaxRates } from '@/utils/storage';
import { calculateSalary, formatCurrency, formatNumber } from '@/utils/calculations';
import { ChartBar as BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react-native';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [individualEarnings, setIndividualEarnings] = useState<DailyEarning[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRates>({ tax: 10, retirement: 10, insurance: 5 });
  const [calculations, setCalculations] = useState<{ [key: string]: SalaryCalculation }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const rates = await getTaxRates();
    setTaxRates(rates);

    if (user.role === 'company') {
      const userEmployees = await getEmployees(user.id);
      setEmployees(userEmployees);
      
      // Calculate salary for each employee
      const employeeCalculations: { [key: string]: SalaryCalculation } = {};
      userEmployees.forEach(employee => {
        employeeCalculations[employee.id] = calculateSalary(employee.dailyEarnings, rates);
      });
      setCalculations(employeeCalculations);
    } else {
      const earnings = await getIndividualEarnings(user.id);
      setIndividualEarnings(earnings);
      
      // Calculate individual salary
      const individualCalculation = calculateSalary(earnings, rates);
      setCalculations({ individual: individualCalculation });
    }
  };

  const getTotalCalculations = (): SalaryCalculation => {
    if (user?.role === 'individual') {
      return calculations.individual || {
        grossSalary: 0,
        taxDeduction: 0,
        retirementDeduction: 0,
        insuranceDeduction: 0,
        totalDeductions: 0,
        netSalary: 0,
        workingDays: 0,
      };
    }

    // Company totals
    const totals = Object.values(calculations).reduce((acc, calc) => ({
      grossSalary: acc.grossSalary + calc.grossSalary,
      taxDeduction: acc.taxDeduction + calc.taxDeduction,
      retirementDeduction: acc.retirementDeduction + calc.retirementDeduction,
      insuranceDeduction: acc.insuranceDeduction + calc.insuranceDeduction,
      totalDeductions: acc.totalDeductions + calc.totalDeductions,
      netSalary: acc.netSalary + calc.netSalary,
      workingDays: acc.workingDays + calc.workingDays,
    }), {
      grossSalary: 0,
      taxDeduction: 0,
      retirementDeduction: 0,
      insuranceDeduction: 0,
      totalDeductions: 0,
      netSalary: 0,
      workingDays: 0,
    });

    return totals;
  };

  const totalCalcs = getTotalCalculations();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Maaş Hesaplamaları
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Detaylı maaş raporları
          </Text>
        </View>

        {/* Summary Card */}
        <Card>
          <View style={styles.cardHeader}>
            <BarChart3 size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Genel Özet
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Users size={20} color={colors.accent} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {user?.role === 'individual' ? 'Çalışılan Gün' : 'Toplam Gün'}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatNumber(totalCalcs.workingDays)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <DollarSign size={20} color={colors.success} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Brüt Maaş
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(totalCalcs.grossSalary)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <TrendingUp size={20} color={colors.error} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Toplam Kesinti
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(totalCalcs.totalDeductions)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <BarChart3 size={20} color={colors.primary} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Net Maaş
              </Text>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>
                {formatCurrency(totalCalcs.netSalary)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Deduction Details */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Kesinti Detayları
          </Text>
          
          <View style={styles.deductionItem}>
            <Text style={[styles.deductionLabel, { color: colors.textSecondary }]}>
              Vergi ({taxRates.tax}%):
            </Text>
            <Text style={[styles.deductionValue, { color: colors.text }]}>
              {formatCurrency(totalCalcs.taxDeduction)}
            </Text>
          </View>

          <View style={styles.deductionItem}>
            <Text style={[styles.deductionLabel, { color: colors.textSecondary }]}>
              Emeklilik ({taxRates.retirement}%):
            </Text>
            <Text style={[styles.deductionValue, { color: colors.text }]}>
              {formatCurrency(totalCalcs.retirementDeduction)}
            </Text>
          </View>

          <View style={styles.deductionItem}>
            <Text style={[styles.deductionLabel, { color: colors.textSecondary }]}>
              Sigorta ({taxRates.insurance}%):
            </Text>
            <Text style={[styles.deductionValue, { color: colors.text }]}>
              {formatCurrency(totalCalcs.insuranceDeduction)}
            </Text>
          </View>

          <View style={[styles.deductionItem, styles.totalDeduction]}>
            <Text style={[styles.deductionLabel, { color: colors.text, fontWeight: '600' }]}>
              Toplam Kesinti:
            </Text>
            <Text style={[styles.deductionValue, { color: colors.error, fontWeight: '700' }]}>
              {formatCurrency(totalCalcs.totalDeductions)}
            </Text>
          </View>
        </Card>

        {/* Employee Details for Company */}
        {user?.role === 'company' && employees.length > 0 && (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Çalışan Detayları
            </Text>
            
            {employees.map((employee) => {
              const calc = calculations[employee.id];
              if (!calc) return null;

              return (
                <View key={employee.id} style={styles.employeeDetail}>
                  <Text style={[styles.employeeName, { color: colors.text }]}>
                    {employee.name}
                  </Text>
                  
                  <View style={styles.employeeRow}>
                    <Text style={[styles.employeeLabel, { color: colors.textSecondary }]}>
                      Çalışılan Gün:
                    </Text>
                    <Text style={[styles.employeeValue, { color: colors.text }]}>
                      {calc.workingDays}
                    </Text>
                  </View>

                  <View style={styles.employeeRow}>
                    <Text style={[styles.employeeLabel, { color: colors.textSecondary }]}>
                      Brüt Maaş:
                    </Text>
                    <Text style={[styles.employeeValue, { color: colors.text }]}>
                      {formatCurrency(calc.grossSalary)}
                    </Text>
                  </View>

                  <View style={styles.employeeRow}>
                    <Text style={[styles.employeeLabel, { color: colors.textSecondary }]}>
                      Toplam Kesinti:
                    </Text>
                    <Text style={[styles.employeeValue, { color: colors.error }]}>
                      {formatCurrency(calc.totalDeductions)}
                    </Text>
                  </View>

                  <View style={styles.employeeRow}>
                    <Text style={[styles.employeeLabel, { color: colors.text, fontWeight: '600' }]}>
                      Net Maaş:
                    </Text>
                    <Text style={[styles.employeeValue, { color: colors.accent, fontWeight: '700' }]}>
                      {formatCurrency(calc.netSalary)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  deductionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  deductionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  deductionValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  totalDeduction: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 8,
    paddingTop: 16,
  },
  employeeDetail: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  employeeName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  employeeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  employeeValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});