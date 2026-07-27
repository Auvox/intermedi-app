import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import type { Category } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

const SCROLL_STEP = 220;

export type CategoryCarouselProps = {
  categories: Category[];
};

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const offset = useRef(0);

  function scrollBy(delta: number) {
    offset.current = Math.max(0, offset.current + delta);
    scrollRef.current?.scrollTo({ x: offset.current, animated: true });
  }

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.arrowButton}
        onPress={() => scrollBy(-SCROLL_STEP)}
        accessibilityRole="button"
        accessibilityLabel="Categorias anteriores">
        <Ionicons name="chevron-back" size={18} color={Colors.textOnPrimary} />
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.map((category) => (
          <View key={category.id} style={styles.item}>
            <View style={styles.iconCircle}>
              <Ionicons name={category.icon} size={28} color={Colors.textOnPrimary} />
            </View>
            <AppText variant="label" style={styles.itemLabel} numberOfLines={1}>
              {category.label}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <Pressable
        style={styles.arrowButton}
        onPress={() => scrollBy(SCROLL_STEP)}
        accessibilityRole="button"
        accessibilityLabel="Próximas categorias">
        <Ionicons name="chevron-forward" size={18} color={Colors.textOnPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xs,
    flexGrow: 1,
  },
  item: {
    alignItems: 'center',
    width: 84,
    gap: Spacing.xs,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    textAlign: 'center',
    color: Colors.text,
  },
});
