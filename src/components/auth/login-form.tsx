import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { Colors, Spacing } from "@/constants/theme";
import { apiRequest } from "@/constants/api";
import { type LoggedUser, useUser } from "@/context/user-context";

export function LoginForm({ showCreateAccount = true }: { showCreateAccount?: boolean }) {
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
    try {
      const data = await apiRequest<{ user: Omit<LoggedUser, 'token'>; token: string }>('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email: email.trim(), senha: password }),
      });
      await setUser({ ...data.user, token: data.token }, rememberMe);
      router.replace('/(tabs)');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally { setSubmitting(false); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <AppText style={styles.label}>E-mail</AppText>
        <TextField boxed icon="person-outline"
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.field}>
        <AppText style={styles.label}>Senha</AppText>
        <TextField boxed icon="lock-closed-outline"
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureToggle
        />
      </View>

      <View style={styles.options}>
        <Checkbox checked={rememberMe} onChange={setRememberMe} label="Lembrar de mim" />
        <Pressable onPress={() => router.push('/forgot-password')} accessibilityRole="button">
          <AppText color={Colors.primaryDark} style={styles.forgotText}>Esqueceu sua senha?</AppText>
        </Pressable>
      </View>

      <Button
        title="Entrar"
        loading={submitting}
        onPress={handleSubmit}
        style={styles.submitButton}
      />

      {showCreateAccount && <>
        <View style={styles.divider}><View style={styles.rule} /><AppText color={Colors.textMuted} style={styles.or}>ou</AppText><View style={styles.rule} /></View>
        <Button title="Criar conta" variant="outline" onPress={() => router.push('/register/cadastro')} />
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  field: {
    gap: 7
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#214640'
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700'
  },
  submitButton: {
    marginTop: Spacing.lg,
    borderRadius: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 3
  },
  rule: {
    height: 1,
    flex: 1,
    backgroundColor: '#D7E9DF'
  },
  or: {
    fontSize: 12
  },
});
