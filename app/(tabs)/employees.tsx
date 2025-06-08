import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@/components/Card';
import { Employee, DailyEarning } from '@/types';
import { getEmployees, setEmployees } from '@/utils/storage';
import { formatCurrency } from '@/utils/calculations';
import { UserPlus, User, Plus, Calendar } from 'lucide-react-native';

export default function EmployeesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dailyAmount, setDailyAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    if (user) {
      const userEmployees = await getEmployees(user.id);
      setEmployeesState(userEmployees);
    }
  };

  const addEmployee = async () => {
    if (!newEmployeeName.trim()) {
      Alert.alert('Hata', 'Çalışan adı gereklidir');
      return;
    }

    // Check if employee already exists
    if (employees.some(emp => emp.name.toLowerCase() === newEmployeeName.toLowerCase())) {
      Alert.alert('Hata', 'Bu isimde bir çalışan zaten mevcut');
      return;
    }

    setIsLoading(true);

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: newEmployeeName.trim(),
      dailyEarnings: [],
      userId: user!.id,
    };

    const updatedEmployees = [...employees, newEmployee];
    setEmployeesState(updatedEmployees);
    
    if (user) {
      await setEmployees(user.id, updatedEmployees);
    }

    setNewEmployeeName('');
    setIsLoading(false);
    Alert.alert('Başarılı', 'Çalışan eklendi');
  };

  const addEarningToEmployee = async () => {
    if (!selectedEmployee) {
      Alert.alert('Hata', 'Çalışan seçin');
      return;
    }

    if (!dailyAmount.trim() || isNaN(Number(dailyAmount))) {
      Alert.alert('Hata', 'Geçerli bir miktar girin');
      return;
    }

    const amount = Number(dailyAmount);
    if (amount <= 0) {
      Alert.alert('Hata', 'Miktar sıfırdan büyük olmalıdır');
      return;
    }

    // Check if already has earning for this date
    const existingEarning = selectedEmployee.dailyEarnings.find(e => e.date === selectedDate);
    if (existingEarning) {
      Alert.alert('Hata', 'Bu tarih için zaten kazanç girişi yapılmış');
      return;
    }

    setIsLoading(true);

    const newEarning: DailyEarning = {
      id: Date.now().toString(),
      date: selectedDate,
      amount,
      employeeId: selectedEmployee.id,
    };

    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return {
          ...emp,
          dailyEarnings: [...emp.dailyEarnings, newEarning],
        };
      }
      return emp;
    });

    setEmployeesState(updatedEmployees);
    
    if (user) {
      await setEmployees(user.id, updatedEmployees);
    }

    setDailyAmount('');
    setSelectedEmployee(null);
    setIsLoading(false);
    Alert.alert('Başarılı', 'Günlük kazanç eklendi');
  };

  // Redirect if not company user
  if (user?.role !== 'company') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Bu sayfa yalnızca firma hesapları için kullanılabilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Çalışan Yönetimi
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Çalışanlarınızı ve kazançlarını yönetin
          </Text>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <UserPlus size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Yeni Çalışan Ekle
            </Text>
          </View>

          <CustomInput
            label="Çalışan Adı"
            value={newEmployeeName}
            onChangeText={setNewEmployeeName}
            placeholder="Çalışan adını girin"
          />

          <CustomButton
            title={isLoading ? 'Ekleniyor...' : 'Çalışan Ekle'}
            onPress={addEmployee}
            disabled={isLoading}
          />
        </Card>

        {employees.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <Plus size={24} color={colors.accent} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Günlük Kazanç Ekle
              </Text>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Çalışan Seçin
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeSelector}>
              {employees.map((employee) => (
                <TouchableOpacity
                  key={employee.id}
                  style={[
                    styles.employeeButton,
                    {
                      backgroundColor: selectedEmployee?.id === employee.id ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSelectedEmployee(employee)}
                >
                  <Text
                    style={[
                      styles.employeeButtonText,
                      {
                        color: selectedEmployee?.id === employee.id ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {employee.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedEmployee && (
              <View style={styles.earningInputs}>
                <CustomInput
                  label="Tarih"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                />

                <CustomInput
                  label="Günlük Kazanç (₺)"
                  value={dailyAmount}
                  onChangeText={setDailyAmount}
                  placeholder="Kazancı girin"
                  keyboardType="numeric"
                />

                <CustomButton
                  title={isLoading ? 'Ekleniyor...' : 'Kazanç Ekle'}
                  onPress={addEarningToEmployee}
                  disabled={isLoading}
                />
              </View>
            )}
          </Card>
        )}

        {employees.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <User size={24} color={colors.success} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Çalışan Listesi
              </Text>
            </View>

            {employees.map((employee) => {
              const totalEarnings = employee.dailyEarnings.reduce((sum, earning) => sum + earning.amount, 0);
              return (
                <View key={employee.id} style={styles.employeeItem}>
                  <View>
                    <Text style={[styles.employeeName, { color: colors.text }]}>
                      {employee.name}
                    </Text>
                    <Text style={[styles.employeeStats, { color: colors.textSecondary }]}>
                      {employee.dailyEarnings.length} gün çalıştı
                    </Text>
                  </View>
                  <Text style={[styles.employeeEarnings, { color: colors.accent }]}>
                    {formatCurrency(totalEarnings)}
                  </Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  employeeSelector: {
    marginBottom: 16,
  },
  employeeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  employeeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  earningInputs: {
    marginTop: 16,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  employeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  employeeStats: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  employeeEarnings: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});