import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingScreen, LOADING_CYCLE_MS } from '@/components/ui/loading-screen';
import { TextField } from "@/components/ui/text-field";
import { Colors, Spacing } from "@/constants/theme";
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
        placeholder="ex: joaodasilva@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextField
        label="Senha"
        icon="lock-closed"
        placeholder="Sua senha"
        value={password}
        onChangeText={setPassword}
        secureToggle
      />

      <Checkbox
        checked={rememberMe}
        onChange={setRememberMe}
        label="lembre de mim"
      />

      <Button
        title="Entrar"
        loading={submitting}
        onPress={handleSubmit}
        style={styles.submitButton}
      />

      <Pressable
        style={styles.forgotLink}
        onPress={() => router.push("/forgot-password")}
        accessibilityRole="button"
      >
        <AppText variant="link" color={Colors.primary}>
          Esqueceu da senha ?
        </AppText>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.push('/register/cadastro')} style={{ alignItems: 'center', padding: 12 }}><AppText variant="label">Não tem uma conta ainda? <AppText variant="link">Criar</AppText></AppText></Pressable>
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
    alignItems: "center",
  },
});
