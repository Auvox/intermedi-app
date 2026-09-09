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
import { registerSteps, StepIndicator } from "@/components/auth/step-indicator";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export default function CadastroScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [remedioFrequente, setRemedioFrequente] = useState("");

  async function handleRegister() {
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

    try {
      const response = await fetch("http://localhost:3000/paciente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomePaciente: nome,
          cpfPaciente: cpf,
          telPaciente: telefone,
          emailPaciente: email,
          senhaPaciente: senha,
          medicamentoFrequentePaciente: remedioFrequente,

          // Endereço será preenchido na próxima etapa
          cepPaciente: null,
          ruaPaciente: null,
          numeroPaciente: null,
          bairroPaciente: null,
          cidadePaciente: null,
          estadoPaciente: null,
          complementoPaciente: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro da API:", data);

        alert(data.error || "Erro ao finalizar o cadastro.");
        return;
      }

      console.log("Paciente cadastrado com sucesso:", data);

      alert("Conta criada com sucesso!");

      // Vai para a tela de endereço
      router.replace("/register/endereco");
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);

      alert("Não foi possível conectar ao servidor de cadastro.");
    }
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
        <AuthHeader title="Criar Conta" showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={0} />

          <View style={styles.form}>
            <TextField placeholder="Nome" value={nome} onChangeText={setNome} />

            <TextField
              placeholder="CPF"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
            />

            <TextField
              placeholder="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />

            <TextField
              placeholder="Medicamento frequente (opcional)"
              value={remedioFrequente}
              onChangeText={setRemedioFrequente}
            />

            <TextField
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TextField
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureToggle
            />

            <TextField
              placeholder="Confirme a sua Senha"
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              secureToggle
            />
          </View>

          <Button
            title="Próxima etapa"
            onPress={handleRegister}
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
