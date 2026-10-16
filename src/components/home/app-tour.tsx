import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { MASCOTS, MascotAvatar } from '@/components/ui/mascot';
import { FontFamily } from '@/constants/theme';
import { useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';

// Tour de 4 passos mostrado depois da apresentação do mascote.
export function AppTour() {
  const care = useCare();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const name = MASCOTS[care.mascot].name;
  const steps = [
    { title: 'Comece pela busca', text: 'Digite um remédio, sintoma ou farmácia. Eu mostro onde tem perto de você.' },
    { title: 'Seus lembretes', text: 'Aqui aparece a próxima dose. Toque em “Tomei” e eu anoto para você.' },
    { title: 'Onde dói?', text: 'Marque no corpo onde está doendo e eu sugiro remédios que não exigem receita.' },
    { title: `Fale com ${MASCOTS[care.mascot].pronoun} ${name}`, text: 'Na aba do mascote você tira dúvidas sobre estoque, receitas e como usar o app.' },
  ];
  const visible = care.ready && care.introSeen && !care.tourDone;
  const finish = () => care.update({ tourDone: true });
  const current = steps[step];
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={finish}>
    <View style={[styles.backdrop, { paddingBottom: insets.bottom + 92 }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primaryBright }]}>
        <View style={styles.row}>
          <MascotAvatar id={care.mascot} size={64} />
          <View style={styles.copy}>
            <AppText variant="label" color={colors.primaryDark} style={styles.bold}>Passo {step + 1} de {steps.length}</AppText>
            <AppText variant="h3">{current.title}</AppText>
            <AppText variant="label">{current.text}</AppText>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.dots}>{steps.map((_, i) => <View key={i} style={[styles.dot, { width: i === step ? 22 : 8, backgroundColor: i === step ? colors.primary : colors.border }]} />)}</View>
          <Pressable accessibilityRole="button" onPress={finish} style={[styles.skip, { backgroundColor: colors.surfaceMuted }]}><AppText variant="label" color={colors.textSecondary} style={styles.bold}>Pular</AppText></Pressable>
          <Button compact fullWidth={false} title={step === steps.length - 1 ? 'Concluir' : 'Próximo'} onPress={() => step === steps.length - 1 ? finish() : setStep(step + 1)} style={styles.next} />
        </View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(245,247,246,0.72)', justifyContent: 'flex-end', paddingHorizontal: 16 },
  card: { borderRadius: 26, borderWidth: 2, padding: 18, gap: 16, boxShadow: '0 10px 40px rgba(13,35,28,0.18)', width: '100%', maxWidth: 520, alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 14 },
  copy: { flex: 1, gap: 2 },
  bold: { fontFamily: FontFamily.semibold },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dots: { flex: 1, flexDirection: 'row', gap: 5 },
  dot: { height: 8, borderRadius: 4 },
  skip: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, justifyContent: 'center' },
  next: { minHeight: 48, borderRadius: 14, paddingHorizontal: 22 },
});
