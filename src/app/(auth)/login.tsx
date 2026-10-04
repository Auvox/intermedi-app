import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { LoginForm } from '@/components/auth/login-form';
import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
import { useRouter } from 'expo-router';
export default function LoginScreen() {
  const router = useRouter(); const { colors } = useTheme();
  return <KeyboardAvoidingView style={[styles.page, { backgroundColor: colors.primarySoft }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.top}><BackButton tone="dark" onPress={() => router.replace('/welcome')} />
        <View style={styles.logo}><Wordmark height={96} /></View>
        <AppText variant="h1" color={colors.primary}>Que bom</AppText><AppText variant="h1" color={colors.primaryDarker}>te ver de volta!</AppText>
      </View>
      <View style={[styles.form, { backgroundColor: colors.surface }]}><LoginForm /></View>
    </ScrollView></SafeAreaView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center' }, top: { padding: 24, gap: 6 }, logo: { alignItems: 'center', paddingVertical: 28 }, form: { padding: 24, borderTopLeftRadius: 36, borderTopRightRadius: 36, flex: 1, marginTop: 16 } });
