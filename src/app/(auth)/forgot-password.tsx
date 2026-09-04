import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/ui/brand-mark';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [contact, setContact] = useState('');

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <SafeAreaView style={styles.flex}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Wordmark height={24} />
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield" size={140} color={Colors.primary} />
            <View style={styles.iconOverlay}>
              <Ionicons name="lock-closed" size={54} color={Colors.textOnPrimary} />
            </View>
          </View>

          <AppText variant="h3" style={styles.description}>
            Informe seu <AppText variant="h3" style={styles.bold}>e-mail</AppText> ou{' '}
            <AppText variant="h3" style={styles.bold}>telefone</AppText> para receber o código de
            recuperação.
          </AppText>

          <View style={styles.form}>
            <TextField placeholder="E-mail ou Telefone" value={contact} onChangeText={setContact} />
          </View>

          <Button
            title="Enviar código"
            onPress={() => router.back()}
            style={styles.submitButton}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: Spacing.xxl,
  },
  iconOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    textAlign: 'center',
    fontWeight: '400',
  },
  bold: {
    fontWeight: '800',
  },
  form: {
    marginTop: Spacing.xxl,
  },
  submitButton: {
    marginTop: Spacing.xxl,
  },
});
