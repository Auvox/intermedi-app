import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { CrossPatternBackground } from '@/components/ui/cross-pattern-background';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/ui/brand-mark';
import { Colors, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CrossPatternBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <Wordmark height={90} variant="light" />
        </View>

        <View style={styles.textBlock}>
          <AppText variant="h2" color={Colors.textOnPrimary} style={styles.centerText}>
            Encontre medicamentos perto de você
          </AppText>
          <AppText variant="h3" color={Colors.textOnPrimary} style={styles.centerText}>
            Consulte a disponibilidade nas farmácias{' '}
            <AppText variant="h3" color={Colors.textOnPrimary} style={styles.bold}>
              SUS
            </AppText>
          </AppText>
        </View>

        <View style={styles.buttons}>
          <Button title="Entrar" variant="solidLight" onPress={() => router.push('/login')} />
          <Button
            title="Criar Conta"
            variant="outlineLight"
            onPress={() => router.push('/register/cadastro')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  textBlock: {
    gap: Spacing.md,
  },
  centerText: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: '800',
  },
  buttons: {
    gap: Spacing.md,
  },
});
