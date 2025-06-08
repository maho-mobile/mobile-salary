import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@/components/Card';
import { DailyEarning } from '@/types';
import { getIndividualEarnings, setIndividualEarnings } from '@/utils/storage';
import { formatCurrency } from '@/utils/calculations';
import { Plus, Calendar } from 'lucide-react-native';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<DailyEarning[]>([]);
  const [dailyAmount, setDailyAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    if (user) {
      const userEarnings = await getIndividualEarnings(user.id);
      setEarnings(userEarnings);
    }
  };

  const addEarning = async () => {
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
    const existingEarning = earnings.find(e => e.date === selectedDate);
    if (existingEarning) {
      Alert.alert('Hata', 'Bu tarih için zaten kazanç girişi yapılmış');
      return;
    }

    setIsLoading(true);

    const newEarning: DailyEarning = {
      id: Date.now().toString(),
      date: selectedDate,
      amount,
    };

    const updatedEarnings = [...earnings, newEarning];
    setEarnings(updatedEarnings);
    
    if (user) {
      await setIndividualEarnings(user.id, updatedEarnings);
    }

    setDailyAmount('');
    setIsLoading(false);
    Alert.alert('Başarılı', 'Günlük kazanç eklendi');
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Merhaba, {user?.firstName}!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {user?.role === 'individual' ? 'Bireysel Hesap' : 'Firma Hesabı'}
          </Text>
        </View>

        {user?.role === 'individual' && (
          <>
            <Card>
              <View style={styles.cardHeader}>
                <Plus size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Günlük Kazanç Ekle
                </Text>
              </View>

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
                placeholder="Kazancınızı girin"
                keyboardType="numeric"
              />

              <CustomButton
                title={isLoading ? 'Ekleniyor...' : 'Kazanç Ekle'}
                onPress={addEarning}
                disabled={isLoading}
              />
            </Card>

            <Card>
              <View style={styles.cardHeader}>
                <Calendar size={24} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Özet
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Toplam Gün:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {earnings.length}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Toplam Kazanç:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.accent }]}>
                  {formatCurrency(totalEarnings)}
                </Text>
              </View>
            </Card>

            {earnings.length > 0 && (
              <Card>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Son Kazançlar
                </Text>
                
                {earnings
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((earning) => (
                    <View key={earning.id} style={styles.earningItem}>
                      <Text style={[styles.earningDate, { color: colors.textSecondary }]}>
                        {new Date(earning.date).toLocaleDateString('tr-TR')}
                      </Text>
                      <Text style={[styles.earningAmount, { color: colors.text }]}>
                        {formatCurrency(earning.amount)}
                      </Text>
                    </View>
                  ))
                }
              </Card>
            )}
          </>
        )}

        {user?.role === 'company' && (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Firma Paneli
            </Text>
            <Text style={[styles.companyInfo, { color: colors.textSecondary }]}>
              Çalışanlarınızı yönetmek için "Çalışanlar" sekmesini kullanın.
              Maaş hesaplamalarını görmek için "Sonuçlar" sekmesine göz atın.
            </Text>
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
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  earningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  earningDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  earningAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  companyInfo: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    textAlign: 'center',
  },
});