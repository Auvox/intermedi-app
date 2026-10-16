import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { MASCOTS } from '@/components/ui/mascot';
import { MascotPicker } from '@/components/ui/mascot-picker';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';

// Troca do mascote a partir do perfil.
export default function MascoteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const care = useCare();
  const [mascot, setMascot] = useState(care.mascot);
  const m = MASCOTS[mascot];
  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
    <ScreenHeader back title="Quem vai cuidar de você?" subtitle="Seu mascote te acompanha no app." overlap={70} />
    <View style={styles.body}>
      <MascotPicker value={mascot} onChange={setMascot} />
      <Button title={mascot === care.mascot ? 'Manter escolha' : `Escolher ${m.pronoun} ${m.name}`} onPress={() => { care.update({ mascot }); router.back(); }} style={styles.button} />
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  body: { flex: 1, paddingHorizontal: 20, marginTop: -64, gap: 20 },
  button: { marginTop: 'auto' },
});
