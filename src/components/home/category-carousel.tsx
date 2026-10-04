import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import type { Category } from '@/constants/mock-data';
export type CategoryCarouselProps = { categories: Category[] };
const GAP = 8;
export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const { colors, textScale } = useTheme();
  const [width, setWidth] = useState(0);
  const [start, setStart] = useState(0);
  const count = Math.max(1, Math.floor((width + GAP) / (96 * textScale + GAP)));
  const lastStart = Math.max(0, categories.length - count);
  const first = Math.min(start, lastStart);
  const visible = categories.slice(first, first + count);
  const itemWidth = Math.max(0, (width - GAP * (count - 1)) / count);
  return <View style={styles.row}>
    <Pressable accessibilityRole="button" accessibilityLabel="Categorias anteriores" accessibilityState={{ disabled: first === 0 }} disabled={first === 0}
      onPress={() => setStart(Math.max(0, first - count))} style={[styles.arrow, { backgroundColor: colors.primary, opacity: first === 0 ? 0.45 : 1 }]}>
      <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
    </Pressable>
    <View style={styles.viewport} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {visible.map(category => <View key={category.id} style={[styles.item, { width: width > 0 ? itemWidth : undefined, flex: width > 0 ? undefined : 1, backgroundColor: colors.primarySoft }]}>
        <Ionicons name={category.icon} size={30} color={colors.primaryDarker} />
        <AppText variant="label" color={colors.text} style={styles.label}>{category.label}</AppText>
      </View>)}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Próximas categorias" accessibilityState={{ disabled: first === lastStart }} disabled={first === lastStart}
      onPress={() => setStart(Math.min(lastStart, first + count))} style={[styles.arrow, { backgroundColor: colors.primary, opacity: first === lastStart ? 0.45 : 1 }]}>
      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: GAP },
  arrow: { width: 36, minHeight: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  viewport: { flex: 1, minWidth: 0, flexDirection: 'row', gap: GAP, alignItems: 'stretch' },
  item: { minHeight: 125, paddingHorizontal: 8, paddingVertical: 20, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 12 },
  label: { textAlign: 'center', width: '100%' },
});
