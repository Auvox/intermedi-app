import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { LoginForm } from '@/components/auth/login-form';
import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { HeaderDecor } from '@/components/ui/screen-header';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useRouter } from 'expo-router';
export default function LoginScreen() {
  const router = useRouter(); const { colors } = useTheme(); const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView style={[styles.page, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.top, { backgroundColor: colors.header, paddingTop: insets.top + 16 }]}>
        <HeaderDecor size={340} cross={false} />
        <BackButton onPress={() => router.replace('/welcome')} />
        <Wordmark height={72} variant="light" />
        <AppText variant="h1" color="#FFFFFF" style={styles.title}>Que bom te ver <AppText variant="h1" color="#8FE0B5" style={styles.title}>de volta!</AppText></AppText>
      </View>
      <View style={[styles.form, { backgroundColor: colors.surface }, Shadow]}><LoginForm /></View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/register/cadastro')} style={styles.create}>
        <AppText variant="label">Não tem uma conta ainda? <AppText variant="link">Criar</AppText></AppText>
      </Pressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  page: { flex: 1 }, content: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingBottom: 32 },
  top: { paddingHorizontal: 24, paddingBottom: 72, gap: 18, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' },
  title: { fontSize: 30, lineHeight: 38 },
  form: { marginHorizontal: 16, marginTop: -44, padding: 22, borderRadius: 26 },
  create: { alignItems: 'center', padding: 20 },
});
