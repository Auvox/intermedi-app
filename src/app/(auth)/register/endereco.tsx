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
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { brazilianStates } from "@/constants/mock-data";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export default function EnderecoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { registerData, resetRegisterData } = useRegisterData();

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [complemento, setComplemento] = useState("");

  async function handleRegister() {
    // Validação dos campos obrigatórios do endereço
    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      alert("Preencha os dados de endereço, por favor.");
      return;
    }

    try {
      // Só aqui, na 2ª etapa, a requisição acontece — com os dados da 1ª
      // etapa (guardados no contexto) e os dados de endereço juntos.
      const response = await fetch(`http://localhost:3000/paciente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomePaciente: registerData.nome,
          cpfPaciente: registerData.cpf,
          telPaciente: registerData.telefone,
          emailPaciente: registerData.email,
          senhaPaciente: registerData.senha,
          medicamentoFrequentePaciente: registerData.remedioFrequente,

          cepPaciente: cep,
          ruaPaciente: rua,
          numeroPaciente: numero,
          bairroPaciente: bairro,
          cidadePaciente: cidade,
          estadoPaciente: estado,
          complementoPaciente: complemento,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro da API:", data);

        alert(data.message || "Erro ao finalizar o cadastro.");
        return;
      }

      console.log("Paciente cadastrado com sucesso:", data);

      alert("Conta criada com sucesso!");

      resetRegisterData();

      router.replace("/register/login");
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);

      alert("Não foi possível conectar ao servidor de cadastro.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: "padding", default: undefined })}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
      >
        <AuthHeader title="Seu Endereço" showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={1} />

          <View style={styles.form}>
            <TextField
              placeholder="CEP"
              value={cep}
              onChangeText={setCep}
              keyboardType="numeric"
            />
            <TextField placeholder="Rua" value={rua} onChangeText={setRua} />
            <TextField
              placeholder="Número"
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
            <TextField
              placeholder="Bairro"
              value={bairro}
              onChangeText={setBairro}
            />
            <TextField
              placeholder="Cidade"
              value={cidade}
              onChangeText={setCidade}
            />
            <SelectField
              placeholder="Estado"
              value={estado}
              options={brazilianStates}
              onSelect={setEstado}
            />
            <TextField
              placeholder="Complemento (opcional)"
              value={complemento}
              onChangeText={setComplemento}
            />
          </View>

          <Button
            title="Cadastrar"
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
