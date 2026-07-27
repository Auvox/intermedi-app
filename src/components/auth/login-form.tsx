import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TextField } from '@/components/ui/text-field';
import { Colors, Spacing } from '@/constants/theme';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  function handleSubmit() {
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <TextField
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextField
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureToggle
      />

      <Checkbox checked={rememberMe} onChange={setRememberMe} label="lembre de mim" />

      <Button title="Entrar" onPress={handleSubmit} style={styles.submitButton} />

      <Pressable
        style={styles.forgotLink}
        onPress={() => router.push('/forgot-password')}
        accessibilityRole="button">
        <AppText variant="link" color={Colors.primary}>
          Esqueceu da senha ?
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  forgotLink: {
    alignItems: 'center',
  },
});
