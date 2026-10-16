import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthHeader } from "@/components/auth/auth-header";
import { useRegisterData } from "@/components/auth/context-login";
import { Button } from "@/components/ui/button";
import { AppText } from '@/components/ui/app-text';
import { TextField } from "@/components/ui/text-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (s: string) => s.length >= 8 },
  { label: 'Uma letra maiúscula', test: (s: string) => /[A-Z]/.test(s) },
  { label: 'Uma letra minúscula', test: (s: string) => /[a-z]/.test(s) },
  { label: 'Um caractere especial (&, @, !)', test: (s: string) => /[^A-Za-z0-9\s]/.test(s) },
];

export default function CadastroScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { registerData, setRegisterData } = useRegisterData();

  const [stage, setStage] = useState(0);
  const [nome, setNome] = useState(registerData.nome);
  const [cpf, setCpf] = useState(registerData.cpf);
  const [telefone, setTelefone] = useState(registerData.telefone);
  const [email, setEmail] = useState(registerData.email);
  const [senha, setSenha] = useState(registerData.senha);

  function handleNextStep() {
    // Validação dos campos obrigatórios
    if (!cpf.trim() || !senha) {
      alert("Preencha CPF e senha, por favor.");
      return;
    }
    if (!PASSWORD_RULES.every(rule => rule.test(senha))) {
      alert("A senha precisa cumprir todos os requisitos.");
      return;
    }

    // Apenas guarda os dados no contexto. A requisição só acontece de fato
    // quando o usuário finalizar a última etapa (mascote).
    setRegisterData({
      nome: nome.trim(),
      cpf,
      telefone,
      email: email.trim(),
      senha,
      confirmaSenha: senha,
    });

    router.push("/register/endereco");
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({
        ios: "padding",
        default: undefined,
      })}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader step={stage + 1} title={stage === 0 ? "Como você se chama e qual é o seu e-mail?" : "Agora, vamos proteger a sua conta!"}
          onBack={() => stage === 1 ? setStage(0) : router.canGoBack() ? router.back() : router.replace('/welcome')} />

        <View style={styles.body}>
          <AppText variant="label">{stage === 0 ? 'Usamos esses dados para identificar seu perfil e enviar suas atualizações.' : 'Seu CPF e telefone garantem a segurança dos seus pedidos e receitas.'}</AppText>
          <View style={styles.form}>
            {stage === 0 ? <>
              <TextField label="Nome completo" icon="person-outline" placeholder="ex: João da Silva" autoCapitalize="words" value={nome} onChangeText={setNome} />
              <TextField label="E-mail" icon="mail-outline" placeholder="ex: joao@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            </> : <>
              <TextField label="CPF" icon="document-outline" placeholder="ex: 123.456.789-10" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
              <TextField label="Telefone" icon="call-outline" placeholder="ex: (11) 91234-5678" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
              <TextField label="Senha" icon="lock-closed-outline" placeholder="Crie uma senha" value={senha} onChangeText={setSenha} secureToggle />
              <View style={styles.rules} accessibilityLabel="Requisitos da senha">
                {PASSWORD_RULES.map(rule => {
                  const ok = rule.test(senha);
                  return <View key={rule.label} style={styles.rule}>
                    <Ionicons name="checkmark-circle" size={18} color={ok ? colors.primaryBright : colors.textMuted} />
                    <AppText variant="label" color={ok ? colors.primaryDark : colors.textMuted}>{rule.label}</AppText>
                  </View>;
                })}
              </View>
            </>}
          </View>

          <Button
            title="Continuar"
            onPress={() => {
              if (stage === 0) {
                if (!nome.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { alert('Informe seu nome e um e-mail válido.'); return; }
                setStage(1);
              } else handleNextStep();
            }}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  body: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
  },

  form: {
    gap: Spacing.lg,
  },

  rules: { gap: 4, marginTop: -4 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  submitButton: {
    marginTop: 'auto',
  },
});
