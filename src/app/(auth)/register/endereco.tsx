import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { AppText } from "@/components/ui/app-text";
import { buscarEnderecoPorCep, type CepAddress } from "@/services/cep";
import { brazilianStates } from "@/constants/mock-data";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export default function EnderecoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { registerData, setRegisterData } = useRegisterData();

  const [cep, setCep] = useState(registerData.cep);
  const [rua, setRua] = useState(registerData.rua);
  const [numero, setNumero] = useState(registerData.numero);
  const [bairro, setBairro] = useState(registerData.bairro);
  const [cidade, setCidade] = useState(registerData.cidade);
  const [estado, setEstado] = useState<string | undefined>(registerData.estado || undefined);
  const [complemento, setComplemento] = useState(registerData.complemento);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState("");
  const [cepError, setCepError] = useState(false);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const editedFields = useRef(new Set<keyof CepAddress>());
  const currentCep = useRef(registerData.cep);

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
    if (cep.length !== 8 || (lookupAttempt === 0 && cep === registerData.cep && registerData.rua)) return;
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
          ? 'Endereço encontrado. Informe o número e o complemento, se houver.'
          : 'Cidade e estado encontrados. Complete os demais campos.');
      } catch (error) {
        if (!active || currentCep.current !== cep) return;
        setCepError(true);
        setCepMessage(error instanceof Error ? error.message : 'Preencha o endereço manualmente.');
      } finally {
        if (active && currentCep.current === cep) setCepLoading(false);
      }
    }, 350);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
    // registerData só serve para não repetir a busca ao voltar para esta etapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep, lookupAttempt]);

  function handleContinue() {
    if (cepLoading) return;
    if (!/^\d{8}$/.test(cep)) {
      alert('Informe um CEP com 8 números.');
      return;
    }
    // Validação dos campos obrigatórios do endereço
    if (!rua || !numero || !bairro || !cidade || !estado) {
      alert("Preencha os dados de endereço, por favor.");
      return;
    }
    setRegisterData({ cep, rua, numero, bairro, cidade, estado, complemento });
    router.push("/register/mascote");
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: "padding", default: undefined })}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader step={3} title="Qual é o seu endereço?" />

        <View style={styles.body}>
          <AppText variant="label">Digite o CEP e preenchemos o resto automaticamente.</AppText>
          <View style={styles.form}>
            <TextField
              label="CEP"
              icon="location-outline"
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
              variant="caption">
              {cepLoading ? 'Buscando endereço…' : cepMessage}
            </AppText>}
            {cepError && !cepLoading && <Button title="Tentar buscar CEP novamente" variant="outline" compact
              onPress={() => { setCepLoading(true); setLookupAttempt(value => value + 1); }} />}
            <TextField accessibilityLabel="Rua" label="Endereço" icon="map-outline" placeholder="ex: Av. Paulista" value={rua} onChangeText={value => { editedFields.current.add('rua'); setRua(value); }} />
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField label="Número" icon="location-outline" placeholder="ex: 123" value={numero} onChangeText={setNumero} keyboardType="numeric" />
              </View>
              <View style={styles.flex}>
                <TextField label="Complemento" placeholder="Opcional" value={complemento} onChangeText={setComplemento} />
              </View>
            </View>
            <TextField
              label="Bairro"
              icon="business-outline"
              placeholder="Seu bairro"
              value={bairro}
              accessibilityLabel="Bairro"
              onChangeText={value => { editedFields.current.add('bairro'); setBairro(value); }}
            />
            <View style={styles.row}>
              <View style={styles.city}>
                <TextField
                  label="Cidade / Estado"
                  icon="location-outline"
                  placeholder="Sua cidade"
                  value={cidade}
                  accessibilityLabel="Cidade"
                  onChangeText={value => { editedFields.current.add('cidade'); setCidade(value); }}
                />
              </View>
              <View style={styles.state}>
                <SelectField
                  placeholder="UF"
                  value={estado}
                  options={brazilianStates}
                  onSelect={value => { editedFields.current.add('estado'); setEstado(value); }}
                />
              </View>
            </View>
          </View>

          <Button
            title="Continuar"
            onPress={handleContinue} disabled={cepLoading}
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
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-end' },
  city: { flex: 2.2 },
  state: { flex: 1 },
  submitButton: {
    marginTop: 'auto',
  },
});
