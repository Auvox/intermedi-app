import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthHeader } from '@/components/auth/auth-header';
import { registerSteps, StepIndicator } from '@/components/auth/step-indicator';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Colors, Spacing } from '@/constants/theme';

export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  
  
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
      
        <AuthHeader title="Criar Conta" showBack  />
       
        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={0} />

          <View style={styles.form}>
            <TextField placeholder="Nome" value={nome} onChangeText={setNome} />
            <TextField placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
            <TextField
              placeholder="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
            <TextField
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextField placeholder="Senha" value={senha} onChangeText={setSenha} secureToggle />
            <TextField
              placeholder="Confirme a sua Senha"
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              secureToggle
            />
          </View>

          <Button
            title="Próxima etapa"
            onPress={() => router.push('/register/endereco')}
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
