import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingScreen, LOADING_CYCLE_MS } from '@/components/ui/loading-screen';
import { TextField } from "@/components/ui/text-field";
import { Spacing } from "@/constants/theme";
import { apiRequest } from "@/constants/api";
import { type LoggedUser, useUser } from "@/context/user-context";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    if (!email.trim() || !password) { alert('Informe e-mail e senha.'); return; }
    setSubmitting(true);
    const minimumLoading = new Promise<void>(resolve => setTimeout(resolve, LOADING_CYCLE_MS));
    try {
      const data = await apiRequest<{ user: Omit<LoggedUser, 'token'>; token: string }>('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email: email.trim(), senha: password }),
      });
      await minimumLoading;
      await setUser({ ...data.user, token: data.token }, rememberMe);
      router.replace('/(tabs)');
    } catch (error) {
      await minimumLoading;
      alert(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally { setSubmitting(false); }
  }

  return (
    <View style={styles.container}>
      <Modal visible={submitting} animationType="fade"><LoadingScreen message="Entrando na sua conta…" /></Modal>
      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="ex: joao@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureToggle
      />

      <View style={styles.options}>
        <Checkbox
          checked={rememberMe}
          onChange={setRememberMe}
          label="Lembrar de mim"
        />
        <Pressable
          onPress={() => router.push("/forgot-password")}
          accessibilityRole="button"
          hitSlop={8}
        >
          <AppText variant="link">Esqueceu a senha?</AppText>
        </Pressable>
      </View>

      <Button
        title="Entrar"
        loading={submitting}
        onPress={handleSubmit}
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
});
