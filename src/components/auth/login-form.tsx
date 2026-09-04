import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TextField } from '@/components/ui/text-field';
import { Colors, Spacing } from '@/constants/theme';
import { API_URL } from '@/constants/api';
import { useUser } from '@/context/user-context';

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit() {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        senha: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Email ou senha incorretos');
      return;
    }

    if (!data.user?.nome) {
      alert('O servidor não retornou os dados do usuário');
      return;
    }

    await setUser(data.user);

    router.replace('/(tabs)');

  } catch (error) {
    console.error('Erro ao conectar com o backend:', error);
    alert('Não foi possível conectar ao servidor');
  }
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
