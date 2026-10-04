import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
const slides = [
  { title: 'Encontre medicamentos', accent: 'perto de você', text: 'Consulte a disponibilidade nas farmácias do SUS e encontre o que você precisa de forma rápida e fácil.', image: require('../../../assets/images/onboarding/medicines.png'), dark: true },
  { title: 'Encontre a', accent: 'farmácia mais próxima', text: 'Encontre a farmácia que atende suas necessidades e está na sua região.', image: require('../../../assets/images/onboarding/pharmacy.png'), dark: false },
  { title: 'Crie sua', accent: 'conta', text: 'Venha fazer parte da Intermedi.', image: require('../../../assets/images/onboarding/account.png'), dark: true },
];
export default function WelcomeScreen() {
  const router = useRouter(); const { colors } = useTheme(); const [index, setIndex] = useState(0); const slide = slides[index];
  const text = slide.dark ? '#FFFFFF' : '#143F32';
  return <SafeAreaView style={[styles.page, { backgroundColor: slide.dark ? '#103F2D' : colors.primarySoft }]}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.logo}><Wordmark height={90} variant={slide.dark ? 'light' : 'colored'} /></View>
      <View style={styles.copy}><AppText variant="h1" color={text}>{slide.title}</AppText><AppText variant="h1" color={colors.primary}>{slide.accent}</AppText>
        <AppText color={text} style={styles.description}>{slide.text}</AppText></View>
      <Image source={slide.image} resizeMode="contain" style={styles.illustration} />
      <View style={[styles.bottom, { backgroundColor: colors.surface }]}>
        <View style={styles.dots}>{slides.map((_, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel={'Ver apresentação ' + (i + 1)} accessibilityState={{ selected: i === index }} onPress={() => setIndex(i)} style={[styles.dot, { backgroundColor: i === index ? colors.primary : colors.border }]} />)}</View>
        <Button title={index === 2 ? 'Criar conta' : 'Começar →'} onPress={() => index < 2 ? setIndex(index + 1) : router.push('/register/cadastro')} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={styles.login}><AppText variant="label">Já tem uma conta? <AppText variant="link" color={colors.primaryDark}>Entrar</AppText></AppText></Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  page: { flex: 1 }, content: { flexGrow: 1, maxWidth: 520, width: '100%', alignSelf: 'center' }, logo: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  copy: { paddingHorizontal: 28 }, description: { marginTop: 16, maxWidth: 330 }, illustration: { width: '100%', height: 265, marginTop: 12 },
  bottom: { padding: 24, gap: 12, borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: 'auto' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4 }, dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 7, borderColor: 'transparent' }, login: { alignItems: 'center', padding: 8 },
});
