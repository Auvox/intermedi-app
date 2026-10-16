import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
const slides = [
  { title: 'Encontre medicamentos', accent: 'perto de você', text: 'Consulte a disponibilidade nas farmácias do SUS e encontre o que você precisa de forma rápida e fácil.', image: require('../../../assets/images/onboarding/medicines.png'), dark: true },
  { title: 'Encontre a farmácia mais', accent: 'próxima', text: 'Qual farmácia atende suas necessidades e está na sua região?', image: require('../../../assets/images/onboarding/pharmacy.png'), dark: false },
  { title: 'Crie sua', accent: 'conta', text: 'Venha fazer parte da Intermedi.', image: require('../../../assets/images/onboarding/account.png'), dark: true },
];
export default function WelcomeScreen() {
  const router = useRouter(); const { colors } = useTheme(); const insets = useSafeAreaInsets(); const [index, setIndex] = useState(0); const slide = slides[index];
  const last = index === slides.length - 1;
  return <View style={[styles.page, { backgroundColor: colors.surface }]}>
    <ScrollView contentContainerStyle={styles.content} bounces={false}>
      <View style={[styles.hero, { backgroundColor: slide.dark ? '#1D7150' : '#E8F3EE', paddingTop: insets.top + 28 }]}>
        <View pointerEvents="none" style={[styles.circle, { backgroundColor: slide.dark ? '#22895C' : '#B9E7CF' }]} />
        <Wordmark height={78} variant={slide.dark ? 'light' : 'colored'} />
        <View style={styles.copy}>
          <AppText variant="h1" color={slide.dark ? '#FFFFFF' : '#17855A'} style={styles.title}>{slide.title}</AppText>
          <AppText variant="h1" color={slide.dark ? '#8FE0B5' : '#16B05F'} style={styles.title}>{slide.accent}</AppText>
          <AppText variant="label" color={slide.dark ? 'rgba(255,255,255,0.9)' : '#2D3B35'} style={styles.description}>{slide.text}</AppText>
        </View>
        <Image source={slide.image} resizeMode="contain" style={styles.illustration} />
      </View>
      <View style={styles.bottom}>
        <View style={styles.dots}>{slides.map((_, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel={'Ver apresentação ' + (i + 1)} accessibilityState={{ selected: i === index }} onPress={() => setIndex(i)} hitSlop={10}
          style={[styles.dot, { backgroundColor: i === index ? colors.primary : i < index ? colors.primaryBorder : colors.border, width: i === index ? 22 : 10 }]} />)}</View>
        <Button title={last ? 'Criar conta' : 'Começar  →'} onPress={() => last ? router.push('/register/cadastro') : setIndex(index + 1)}
          style={styles.cta} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={styles.login}><AppText variant="label">Já tem uma conta? <AppText variant="link">Entrar</AppText></AppText></Pressable>
      </View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1 }, content: { flexGrow: 1, maxWidth: 520, width: '100%', alignSelf: 'center' },
  hero: { paddingHorizontal: 28, paddingBottom: 12, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', gap: 20, flexGrow: 1 },
  circle: { position: 'absolute', width: 420, height: 420, borderRadius: 210, right: -190, top: -170 },
  copy: { gap: 0 }, title: { fontSize: 32, lineHeight: 40 }, description: { marginTop: 14, maxWidth: 300 },
  illustration: { width: '100%', height: 250, alignSelf: 'center' },
  bottom: { padding: 24, gap: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 4 }, dot: { height: 10, borderRadius: 5 },
  cta: { borderRadius: 30 },
  login: { alignItems: 'center', padding: 8 },
});
