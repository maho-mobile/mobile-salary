import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@/components/Card';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    }
    if (!password.trim()) {
      newErrors.password = 'Şifre gereklidir';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Hata', result.error || 'Giriş yapılamadı');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Maaş Hesaplayıcı
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Hesabınıza giriş yapın
          </Text>
        </View>

        <Card>
          <CustomInput
            label="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            placeholder="Kullanıcı adınızı girin"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <CustomInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="Şifrenizi girin"
            secureTextEntry
          />

          <CustomButton
            title={isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.linkContainer}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Hesabınız yok mu?{' '}
            </Text>
            <Link href="/auth/register" style={[styles.link, { color: colors.primary }]}>
              Kayıt ol
            </Link>
          </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  loginButton: {
    marginTop: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  link: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});