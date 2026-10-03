import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme, type TextSize } from '@/context/theme-context';

const options: { value: TextSize; label: string }[] = [
  { value: 'standard', label: 'Padrão' },
  { value: 'large', label: 'Grande' },
  { value: 'extraLarge', label: 'Muito grande' },
];

export default function AccessibilityScreen() {
  const router = useRouter();
  const { colors, textSize, setTextSize, highContrast, setHighContrast } = useTheme();
  return <SafeAreaView style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao perfil" onPress={() => router.back()} style={styles.back}>
        <AppText variant="link" color={colors.primaryDark}>Voltar</AppText>
      </Pressable>
      <AppText variant="h2">Acessibilidade</AppText>
      <AppText color={colors.textSecondary}>Ajuste a leitura do aplicativo. Suas escolhas são salvas neste dispositivo.</AppText>
      <AppText variant="h3">Tamanho do texto</AppText>
      <AppText color={colors.textSecondary}>Este ajuste também respeita o tamanho de texto definido no seu dispositivo.</AppText>
      <View accessibilityRole="radiogroup" accessibilityLabel="Tamanho do texto" style={styles.options}>
        {options.map(({ value, label }) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: textSize === value }} accessibilityLabel={label} onPress={() => setTextSize(value)}
          style={[styles.option, { backgroundColor: textSize === value ? colors.primarySoft : colors.surface, borderColor: textSize === value ? colors.primaryDark : colors.border, borderWidth: textSize === value ? 2 : 1 }]}>
          <AppText variant="bodyBold">{textSize === value ? '✓ ' : ''}{label}</AppText>
        </Pressable>)}
      </View>
      <View style={[styles.contrast, { borderColor: colors.border }]}>
        <View style={styles.info}>
          <AppText variant="h3">Alto contraste</AppText>
          <AppText color={colors.textSecondary}>Realça textos e contornos nos modos claro e escuro.</AppText>
        </View>
        <Switch accessibilityLabel="Alto contraste" value={highContrast} onValueChange={setHighContrast} trackColor={{ false: colors.border, true: colors.primaryBorder }} thumbColor={highContrast ? colors.primary : colors.textMuted} />
      </View>
      <View style={[styles.preview, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
        <AppText variant="h3">Prévia de leitura</AppText>
        <AppText>Encontre medicamentos e farmácias perto de você.</AppText>
        <AppText variant="caption">O tamanho e as cores mudam assim que você escolhe uma opção.</AppText>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: 24, paddingBottom: 48, gap: 16 },
  back: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 8 },
  options: { gap: 8 },
  option: { minHeight: 48, padding: 16, borderRadius: 12 },
  contrast: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 16 },
  info: { flex: 1, gap: 8 },
  preview: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
});
