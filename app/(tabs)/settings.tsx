import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@/components/Card';
import { TaxRates } from '@/types';
import { getTaxRates, setTaxRates } from '@/utils/storage';
import { Settings as SettingsIcon, Moon, Sun, Percent, LogOut, User } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [taxRatesState, setTaxRatesState] = useState<TaxRates>({ tax: 10, retirement: 10, insurance: 5 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTaxRates();
  }, []);

  const loadTaxRates = async () => {
    const rates = await getTaxRates();
    setTaxRatesState(rates);
  };

  const updateTaxRate = (field: keyof TaxRates, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTaxRatesState(prev => ({ ...prev, [field]: numValue }));
  };

  const saveTaxRates = async () => {
    // Validation
    if (taxRatesState.tax < 0 || taxRatesState.tax > 100) {
      Alert.alert('Hata', 'Vergi oranı 0-100 arasında olmalıdır');
      return;
    }
    if (taxRatesState.retirement < 0 || taxRatesState.retirement > 100) {
      Alert.alert('Hata', 'Emeklilik oranı 0-100 arasında olmalıdır');
      return;
    }
    if (taxRatesState.insurance < 0 || taxRatesState.insurance > 100) {
      Alert.alert('Hata', 'Sigorta oranı 0-100 arasında olmalıdır');
      return;
    }

    setIsLoading(true);
    await setTaxRates(taxRatesState);
    setIsLoading(false);
    Alert.alert('Başarılı', 'Vergi oranları güncellendi');
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Ayarlar
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Uygulama ayarlarını yönetin
          </Text>
        </View>

        {/* User Info */}
        <Card>
          <View style={styles.cardHeader}>
            <User size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Kullanıcı Bilgileri
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
              Ad Soyad:
            </Text>
            <Text style={[styles.userInfoValue, { color: colors.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
              Kullanıcı Adı:
            </Text>
            <Text style={[styles.userInfoValue, { color: colors.text }]}>
              {user?.username}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
              Hesap Türü:
            </Text>
            <Text style={[styles.userInfoValue, { color: colors.accent }]}>
              {user?.role === 'individual' ? 'Bireysel' : 'Firma'}
            </Text>
          </View>
        </Card>

        {/* Theme Settings */}
        <Card>
          <View style={styles.cardHeader}>
            {isDark ? (
              <Moon size={24} color={colors.primary} />
            ) : (
              <Sun size={24} color={colors.primary} />
            )}
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Tema Ayarları
            </Text>
          </View>

          <View style={styles.themeOption}>
            <View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Karanlık Mod
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Uygulamanın karanlık temasını aktifleştirin
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : colors.textSecondary}
            />
          </View>
        </Card>

        {/* Tax Rates */}
        <Card>
          <View style={styles.cardHeader}>
            <Percent size={24} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Vergi Oranları
            </Text>
          </View>

          <Text style={[styles.ratesDescription, { color: colors.textSecondary }]}>
            Maaş hesaplamalarında kullanılacak vergi oranlarını ayarlayın
          </Text>

          <CustomInput
            label="Vergi Oranı (%)"
            value={taxRatesState.tax.toString()}
            onChangeText={(value) => updateTaxRate('tax', value)}
            placeholder="10"
            keyboardType="numeric"
          />

          <CustomInput
            label="Emeklilik Oranı (%)"
            value={taxRatesState.retirement.toString()}
            onChangeText={(value) => updateTaxRate('retirement', value)}
            placeholder="10"
            keyboardType="numeric"
          />

          <CustomInput
            label="Sigorta Oranı (%)"
            value={taxRatesState.insurance.toString()}
            onChangeText={(value) => updateTaxRate('insurance', value)}
            placeholder="5"
            keyboardType="numeric"
          />

          <CustomButton
            title={isLoading ? 'Kaydediliyor...' : 'Oranları Kaydet'}
            onPress={saveTaxRates}
            disabled={isLoading}
            variant="secondary"
          />
        </Card>

        {/* Logout */}
        <Card>
          <View style={styles.cardHeader}>
            <LogOut size={24} color={colors.error} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Hesap İşlemleri
            </Text>
          </View>

          <CustomButton
            title="Çıkış Yap"
            onPress={handleLogout}
            variant="outline"
            textStyle={{ color: colors.error }}
            style={{ borderColor: colors.error }}
          />
        </Card>
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
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  userInfoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  ratesDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
});