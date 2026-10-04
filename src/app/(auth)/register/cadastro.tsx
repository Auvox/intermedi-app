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
import { AppText } from '@/components/ui/app-text';
import { TextField } from "@/components/ui/text-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export default function CadastroScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { registerData, setRegisterData } = useRegisterData();

  const [stage, setStage] = useState(0);
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
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({
        ios: "padding",
        default: undefined,
      })}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
      >
        <AuthHeader title={stage === 0 ? "Como você se chama e qual é o seu e-mail?" : "Agora, vamos proteger a sua conta!"} showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={stage} />

          <AppText variant="label" style={{ textAlign: 'center' }}>{stage === 0 ? 'Usaremos essas informações para identificar seu perfil e enviar suas atualizações.' : 'Confira seus dados e escolha uma senha para acessar sua conta.'}</AppText>
          <View style={styles.form}>
            {stage === 0 ? <>
              <TextField label="Nome completo" icon="person" placeholder="ex: João da Silva" autoCapitalize="words" value={nome} onChangeText={setNome} />
              <TextField label="E-mail" icon="mail-outline" placeholder="ex: joaodasilva@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            </> : <>

              <TextField
                label="CPF" icon="document-text-outline" placeholder="ex: 123.456.789-10"
                value={cpf}
                onChangeText={setCpf}
                keyboardType="numeric"
              />

              <TextField
                label="Telefone" icon="call" placeholder="ex: (11) 91234-5678"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
              />

              <TextField
                label="Medicamento frequente (opcional)"
                placeholder="Nome do medicamento"
                value={remedioFrequente}
                onChangeText={setRemedioFrequente}
              />

              <TextField
                label="Senha" icon="lock-closed" placeholder="Sua senha"
                value={senha}
                onChangeText={setSenha}
                secureToggle
              />

              <TextField
                label="Confirme sua senha" icon="lock-closed-outline" placeholder="Repita sua senha"
                value={confirmaSenha}
                onChangeText={setConfirmaSenha}
                secureToggle
              />
            </>}
          </View>

          {stage === 1 && <Button title="Voltar aos dados pessoais" variant="ghost" onPress={() => setStage(0)} />}

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
    paddingBottom: Spacing.xxl,
    justifyContent: "space-between",
    gap: Spacing.xxl,
  },

  form: {
    gap: Spacing.xl,
  },

  submitButton: {
    marginTop: Spacing.lg,
  },
});
