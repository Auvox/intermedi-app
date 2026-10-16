import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepProgress } from '@/components/auth/auth-header';
import { useRegisterData } from '@/components/auth/context-login';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { MASCOTS } from '@/components/ui/mascot';
import { MascotPicker } from '@/components/ui/mascot-picker';
import { HeaderDecor } from '@/components/ui/screen-header';
import { apiRequest } from '@/constants/api';
import { Spacing } from '@/constants/theme';
import { seedCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';
import { type LoggedUser, useUser } from '@/context/user-context';

export default function MascoteCadastroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { setUser } = useUser();
  const { registerData, setRegisterData, resetRegisterData } = useRegisterData();
  const [mascote, setMascote] = useState(registerData.mascote);
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (submitting) return;
    // Os dados das etapas anteriores ficam só na memória: se a página recarregou, recomeça.
    if (!registerData.nome || !registerData.email || !registerData.senha || !registerData.cep) {
      alert('Seus dados do cadastro se perderam. Vamos preencher de novo.');
      router.replace('/register/cadastro');
      return;
    }
    setRegisterData({ mascote });
    setSubmitting(true);
    try {
      // A requisição acontece só aqui, com os dados de todas as etapas.
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nomePaciente: registerData.nome,
          cpfPaciente: registerData.cpf,
          telPaciente: registerData.telefone,
          emailPaciente: registerData.email,
          senhaPaciente: registerData.senha,
          medicamentoFrequentePaciente: registerData.remedioFrequente,
          cepPaciente: registerData.cep,
          ruaPaciente: registerData.rua,
          numeroPaciente: registerData.numero,
          bairroPaciente: registerData.bairro,
          cidadePaciente: registerData.cidade,
          estadoPaciente: registerData.estado,
          complementoPaciente: registerData.complemento,
        }),
      });
    } catch (error) {
      setSubmitting(false);
      alert(error instanceof Error ? error.message : 'Não foi possível cadastrar.');
      return;
    }
    try {
      // Entra direto na conta nova para o mascote se apresentar.
      const data = await apiRequest<{ user: Omit<LoggedUser, 'token'>; token: string }>('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email: registerData.email, senha: registerData.senha }),
      });
      await seedCare(data.user.id, { mascot: mascote });
      await setUser({ ...data.user, token: data.token }, true);
      resetRegisterData();
      router.replace('/boas-vindas');
    } catch {
      resetRegisterData();
      router.replace('/register/login');
    }
  }

  if (submitting) return <LoadingScreen message="Criando sua conta…" />;

  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
    <View style={[styles.header, { backgroundColor: colors.header, paddingTop: insets.top + 16 }]}>
      <HeaderDecor size={320} />
      <View style={styles.topRow}><BackButton /><StepProgress step={4} /></View>
      <AppText variant="h2" color="#FFFFFF" style={styles.title}>Quem vai cuidar de você?</AppText>
      <AppText variant="label" color="rgba(255,255,255,0.88)">Seu mascote te acompanha no app. Dá para trocar depois, no perfil.</AppText>
    </View>
    <View style={styles.body}>
      <MascotPicker value={mascote} onChange={setMascote} />
      <Button title={`Escolher ${MASCOTS[mascote].pronoun} ${MASCOTS[mascote].name}`} onPress={handleRegister} style={styles.button} />
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 96, gap: 8, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  title: { fontSize: 26, lineHeight: 34 },
  body: { flex: 1, paddingHorizontal: Spacing.xl, marginTop: -80, gap: Spacing.xl },
  button: { marginTop: 'auto' },
});
