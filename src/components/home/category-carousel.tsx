import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import type { Category } from '@/constants/mock-data';
import { CategoryPersonIcon } from './category-person-icon';
export type CategoryCarouselProps = { categories: Category[]; onSelect?: (category: Category) => void };
export function CategoryCarousel({ categories, onSelect }: CategoryCarouselProps) {
  const { colors, textScale } = useTheme();
  return <View style={styles.grid}>
    {categories.map(category => <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={'Buscar ' + category.label} onPress={() => onSelect?.(category)} style={({ pressed }) => [styles.item, { width: textScale > 1 ? '100%' : '48%', backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}>
      <View style={[styles.illustration, { backgroundColor: colors.primarySoft }]}><CategoryPersonIcon label={category.label} /></View>
      <AppText variant="bodyBold" style={styles.label}>{category.label}</AppText>
    </Pressable>)}
  </View>;
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  item: { padding: 12, borderRadius: 20, borderWidth: 1, alignItems: 'center', gap: 10 },
  illustration: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  label: { textAlign: 'center', fontSize: 14 },
});
