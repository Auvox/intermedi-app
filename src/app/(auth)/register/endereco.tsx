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

   const API_URL = Platform.select({
    ios: 'http://localhost:3000',    
    android: 'http://10.0.2.2:3000',   
    default: 'http://localhost:3000',
    });

    async function handleRegister(){
      if(!cep || !rua || !numero || !bairro || !cidade || !estado){
        alert("Preencha os dados obrigatórios, por favor.");
        return;
      }
      try {
      // Envia os dados para a API.
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cepEndereco: cep,
          ruaEndereco: rua,
          numeroEndereco: numero,
          bairroEndereco: bairro,
          cidadeEndereco: cidade,
          ufEndereco: estado,
          complementoEndereco: complemento
        }),
      });

      const data = await response.json();

      if(!response.ok) {
        alert(data.message || "Erro ao finalizar o cadastro de endereço");
        return;
      }

      // exibe os dados cadastrados no terminal do backend.
      console.log("Usuário cadastrado com sucesso", data.user);
      alert("Conta criada com sucesso!");

      router.replace('/register/login');
    }
    catch(err){
      console.error("Erro ao conectar com o backend", err);
       alert('Não foi possível conectar ao servidor de cadastro.');
    }
  }
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
