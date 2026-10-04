import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import type { ReactNode } from 'react';
import { AppText } from './app-text';
import { useTheme } from '@/context/theme-context';

export function ScreenHero({ title, subtitle, icon, image, children }: {
  title: string; subtitle: string; icon?: keyof typeof Ionicons.glyphMap;
  image?: ImageSourcePropType; children?: ReactNode;
}) {
  const { colors } = useTheme();
  return <View style={[styles.hero, { backgroundColor: colors.primarySoft }]}>
    <View style={styles.heading}>
      <View style={styles.copy}><AppText variant="h2" color={colors.primaryDarker}>{title}</AppText>
        <AppText variant="label" color={colors.primaryDarker}>{subtitle}</AppText></View>
      {image ? <Image source={image} resizeMode="contain" style={styles.image} />
        : icon ? <Ionicons name={icon} size={72} color={colors.primaryDark} style={styles.icon} /> : null}
    </View>
    {children}
  </View>;
}
const styles = StyleSheet.create({
  hero: { padding: 18, borderRadius: 24, gap: 16, overflow: 'hidden' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 4 }, image: { width: 105, height: 86 }, icon: { opacity: 0.65 },
});
