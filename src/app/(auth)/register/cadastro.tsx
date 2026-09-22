import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AuthHeader } from "@/components/auth/auth-header";
import { useRegisterData } from "@/components/auth/context-login";
import { registerSteps, StepIndicator } from "@/components/auth/step-indicator";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export default function CadastroScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { registerData, setRegisterData } = useRegisterData();

  const [nome, setNome] = useState(registerData.nome);
  const [cpf, setCpf] = useState(registerData.cpf);
  const [telefone, setTelefone] = useState(registerData.telefone);
  const [email, setEmail] = useState(registerData.email);
  const [senha, setSenha] = useState(registerData.senha);
  const [confirmaSenha, setConfirmaSenha] = useState(
    registerData.confirmaSenha,
  );
  const [remedioFrequente, setRemedioFrequente] = useState(
    registerData.remedioFrequente,
  );

  function handleNextStep() {
    // Validação dos campos obrigatórios
    if (!nome || !cpf || !email || !senha) {
      alert("Preencha os dados obrigatórios, por favor.");
      return;
    }

    // Confirmação da senha
    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    // Apenas guarda os dados da 1ª etapa no contexto. A requisição só
    // acontece de fato quando o usuário finalizar a 2ª etapa (endereço).
    setRegisterData({
      nome,
      cpf,
      telefone,
      email,
      senha,
      confirmaSenha,
      remedioFrequente,
    });

    router.push("/register/endereco");
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.primarySoft }]}
      behavior={Platform.select({
        ios: "padding",
        default: undefined,
      })}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
      >
        <AuthHeader title="Criar Conta" showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={0} />

          <View style={styles.form}>
            <TextField boxed icon="person-outline" placeholder="Nome completo" value={nome} onChangeText={setNome} />

            <TextField
              boxed icon="card-outline" placeholder="CPF"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
            />

            <TextField
              boxed icon="call-outline" placeholder="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />

            <TextField
              boxed icon="medkit-outline" placeholder="Medicamento frequente (opcional)"
              value={remedioFrequente}
              onChangeText={setRemedioFrequente}
            />

            <TextField
              boxed icon="mail-outline" placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TextField
              boxed icon="lock-closed-outline" placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureToggle
            />

            <TextField
              boxed icon="lock-closed-outline" placeholder="Confirme a sua senha"
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              secureToggle
            />
          </View>

          <Button
            title="Próxima etapa"
            onPress={handleNextStep}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    justifyContent: "space-between",
    gap: Spacing.xl,
  },

  form: {
    gap: Spacing.md,
  },

  submitButton: {
    marginTop: Spacing.lg,
  },
});
