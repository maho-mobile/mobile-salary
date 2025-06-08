import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          Bu sayfa mevcut değil.
        </Text>
        <Link href="/" style={[styles.link, { color: colors.primary }]}>
          <Text>Ana sayfaya dön!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});