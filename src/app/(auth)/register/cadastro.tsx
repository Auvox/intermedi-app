import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthHeader } from '@/components/auth/auth-header';
import { registerSteps, StepIndicator } from '@/components/auth/step-indicator';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';

export default function CadastroScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [remedioFrequente, setRemedioFrequente] = useState('');

   const API_URL = Platform.select({
    ios: 'http://localhost:3000',    
    android: 'http://192.168.1.3:3000',
    default: 'http://localhost:3000',
    });

    async function handleRegister(){
      if(!nome || !cpf || !email || !senha){
        alert("Preencha os dados obrigatórios, por favor.");
        return;
      }
      if(senha !== confirmaSenha) {
        alert("As senhas não coincidem!");
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
          nomePaciente: nome,
          cpfPaciente: cpf,
          telPaciente: telefone,
          emailPaciente: email,
          senhaPaciente: senha,
          remedioFrequente: remedioFrequente
        }),
      });

      const data = await response.json();

      if(!response.ok) {
        alert(data.message || "Erro ao finalizar o cadastro");
        return;
      }

      // exibe os dados cadastrados no terminal do backend.
      console.log("Usuário cadastrado com sucesso", data.user);
      alert("Conta criada com sucesso!");

      router.replace('/register/endereco');
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
