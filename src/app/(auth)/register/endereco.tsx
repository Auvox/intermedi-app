import { apiRequest } from "@/constants/api";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { AppText } from "@/components/ui/app-text";
import { LoadingScreen } from '@/components/ui/loading-screen';
import { buscarEnderecoPorCep, type CepAddress } from "@/services/cep";
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

  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState("");
  const [cepError, setCepError] = useState(false);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const editedFields = useRef(new Set<keyof CepAddress>());
  const currentCep = useRef("");

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits === cep) return;
    currentCep.current = digits;
    editedFields.current.clear();
    setCep(digits);
    setRua(''); setBairro(''); setCidade(''); setEstado(undefined);
    setCepMessage(''); setCepError(false);
    setCepLoading(digits.length === 8);
  }

  useEffect(() => {
    if (cep.length !== 8) return;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCepLoading(true); setCepError(false); setCepMessage('');
      try {
        const address = await buscarEnderecoPorCep(cep, controller.signal);
        if (!active || currentCep.current !== cep) return;
        // Preserve corrections entered while the request was in progress.
        if (!editedFields.current.has('rua')) setRua(address.rua);
        if (!editedFields.current.has('bairro')) setBairro(address.bairro);
        if (!editedFields.current.has('cidade')) setCidade(address.cidade);
        if (!editedFields.current.has('estado')) setEstado(address.estado);
        setCepMessage(address.rua && address.bairro
          ? 'Endereço encontrado. Confira os dados e informe o número e o complemento, se houver.'
          : 'Cidade e estado encontrados. Complete e confira os demais campos do endereço.');
      } catch (error) {
        if (!active || currentCep.current !== cep) return;
        setCepError(true);
        setCepMessage(error instanceof Error ? error.message : 'Preencha o endereço manualmente.');
      } finally {
        if (active && currentCep.current === cep) setCepLoading(false);
      }
    }, 350);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [cep, lookupAttempt]);

  async function handleRegister() {
    if (submitting || cepLoading) return;
    if (!/^\d{8}$/.test(cep)) {
      alert('Informe um CEP com 8 números.');
      return;
    }
    // Validação dos campos obrigatórios do endereço
    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      alert("Preencha os dados de endereço, por favor.");
      return;
    }

    setSubmitting(true);
    try {
      // Só aqui, na 2ª etapa, a requisição acontece — com os dados da 1ª
      // etapa (guardados no contexto) e os dados de endereço juntos.
      await apiRequest('/api/auth/register', {
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


      resetRegisterData();

      router.replace("/register/login");
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);

      alert(error instanceof Error ? error.message : 'Não foi possível cadastrar.');
    } finally { setSubmitting(false); }
  }

  if (submitting) return <LoadingScreen message="Criando sua conta…" />;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: "padding", default: undefined })}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
      >
        <AuthHeader title="Qual é o seu endereço?" showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={2} />

          <AppText variant="label" style={{ textAlign: 'center' }}>Digite o seu CEP para preenchermos sua localização automaticamente.</AppText>
          <View style={styles.form}>
            <TextField
              label="CEP"
              placeholder="ex: 01001-000"
              accessibilityLabel="CEP"
              value={cep.length > 5 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep}
              onChangeText={handleCepChange}
              keyboardType="numeric"
              maxLength={9}
            />
            {(cepLoading || cepMessage.length > 0) && <AppText
              accessibilityLiveRegion="polite"
              color={cepError ? colors.danger : colors.textSecondary}
              variant="label">
              {cepLoading ? 'Buscando endereço…' : cepMessage}
            </AppText>}
            {cepError && !cepLoading && <Button title="Tentar buscar CEP novamente" variant="outline"
              onPress={() => { setCepLoading(true); setLookupAttempt(value => value + 1); }} />}
            <TextField accessibilityLabel="Rua" label="Endereço" placeholder="ex: Av. Paulista" value={rua} onChangeText={value => { editedFields.current.add('rua'); setRua(value); }} />
            <TextField
              label="Número"
              placeholder="ex: 123"
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
            <TextField
              label="Bairro"
              placeholder="Seu bairro"
              value={bairro}
              accessibilityLabel="Bairro"
              onChangeText={value => { editedFields.current.add('bairro'); setBairro(value); }}
            />
            <TextField
              label="Cidade"
              placeholder="Sua cidade"
              value={cidade}
              accessibilityLabel="Cidade"
              onChangeText={value => { editedFields.current.add('cidade'); setCidade(value); }}
            />
            <SelectField
              placeholder="Estado"
              value={estado}
              options={brazilianStates}
              onSelect={value => { editedFields.current.add('estado'); setEstado(value); }}
            />
            <TextField
              label="Complemento (opcional)"
              placeholder="ex: Apto 42, bloco B"
              value={complemento}
              onChangeText={setComplemento}
            />
          </View>

          <Button
            title="Cadastrar"
            onPress={handleRegister} loading={submitting} disabled={cepLoading}
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
