import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthHeader } from '@/components/auth/auth-header';
import { registerSteps, StepIndicator } from '@/components/auth/step-indicator';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/context/theme-context';
import { brazilianStates } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';

export default function EnderecoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [complemento, setComplemento] = useState('');

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <AuthHeader title="Seu Endereço" showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={1} />

          <View style={styles.form}>
            <TextField placeholder="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" />
            <TextField placeholder="Rua" value={rua} onChangeText={setRua} />
            <TextField
              placeholder="Número"
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
            <TextField placeholder="Bairro" value={bairro} onChangeText={setBairro} />
            <TextField placeholder="Cidade" value={cidade} onChangeText={setCidade} />
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
            onPress={() => router.push('/register/login')}
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'space-between',
    gap: Spacing.xxl,
  },
  form: {
    gap: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
