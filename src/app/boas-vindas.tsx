import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { MASCOTS, Mascot } from '@/components/ui/mascot';
import { FontFamily } from '@/constants/theme';
import { useCare } from '@/context/care-context';
import { useUser } from '@/context/user-context';

const STEPS = ['Te mostro como o app funciona', 'Cadastramos os remédios que você usa', 'Eu cuido dos lembretes daqui pra frente'];

// Apresentação do mascote logo após o cadastro (ou no primeiro acesso neste aparelho).
export default function BoasVindasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const care = useCare();
  const m = MASCOTS[care.mascot];
  const firstName = user?.nome?.trim().split(' ')[0];
  function finish(showTour: boolean) {
    care.update({ introSeen: true, tourDone: !showTour });
    router.replace('/(tabs)');
  }
  return <ScrollView style={styles.page} contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
    <View pointerEvents="none" style={[styles.circle, { width: 360, height: 360, borderRadius: 180, right: -170, top: -150 }]} />
    <View pointerEvents="none" style={[styles.circle, { width: 260, height: 260, borderRadius: 130, left: -160, top: 420 }]} />
    <View style={styles.bubble}>
      <AppText variant="label" color="#0E6B50" style={styles.bold}>{m.name}</AppText>
      <AppText variant="h3" style={styles.hello}>Oi{firstName ? `, ${firstName}` : ''}. Prazer, eu sou {m.pronoun} {m.name}!</AppText>
      <AppText variant="label" color="#33423C">Vou te ajudar a achar remédios perto de você, lembrar das doses e usar o app sem complicação.</AppText>
      <View style={styles.tail} />
    </View>
    <View style={styles.stage}>
      <View style={styles.halo} />
      <Mascot id={care.mascot} size={210} />
    </View>
    <View style={styles.steps}>
      {STEPS.map((step, index) => <View key={step} style={styles.step}>
        <View style={styles.number}><AppText variant="bodyBold" color="#0E6B50">{index + 1}</AppText></View>
        <AppText variant="label" color="#FFFFFF" style={styles.stepText}>{step}</AppText>
      </View>)}
    </View>
    <Button variant="solidLight" title="Me mostra o app" onPress={() => finish(true)} />
    <Pressable accessibilityRole="button" onPress={() => finish(false)} style={styles.later}><AppText color="rgba(255,255,255,0.85)">Agora não</AppText></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#0E6B50' },
  content: { flexGrow: 1, paddingHorizontal: 24, gap: 16, maxWidth: 520, width: '100%', alignSelf: 'center' },
  circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.06)' },
  bubble: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 22, gap: 6 },
  tail: { position: 'absolute', bottom: -9, alignSelf: 'center', left: '50%', marginLeft: -9, width: 18, height: 18, backgroundColor: '#FFFFFF', transform: [{ rotate: '45deg' }], borderRadius: 3 },
  bold: { fontFamily: FontFamily.bold },
  hello: { fontSize: 21, lineHeight: 29 },
  stage: { alignItems: 'center', justifyContent: 'center', height: 250, marginTop: 4 },
  halo: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(255,255,255,0.1)' },
  steps: { gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 14 },
  number: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
  later: { alignItems: 'center', padding: 8 },
});
