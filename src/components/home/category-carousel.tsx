import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import type { Category } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

const MIN_ITEM_WIDTH = 84;

export type CategoryCarouselProps = {
  categories: Category[];
};

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const visibleItems = Math.max(1, Math.floor(viewportWidth / MIN_ITEM_WIDTH));
  const itemWidth = viewportWidth > 0 ? viewportWidth / visibleItems : MIN_ITEM_WIDTH;
  const maxOffset = Math.max(0, categories.length * itemWidth - viewportWidth);

  function scrollBy(delta: number) {
    offset.current = Math.min(maxOffset, Math.max(0, offset.current + delta));
    scrollRef.current?.scrollTo({ x: offset.current, animated: true });
  }

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.arrowButton}
        onPress={() => scrollBy(-visibleItems * itemWidth)}
        accessibilityRole="button"
        accessibilityLabel="Categorias anteriores">
        <Ionicons name="chevron-back" size={18} color={Colors.textOnPrimary} />
      </Pressable>

      <ScrollView style={styles.scrollView}
        ref={scrollRef}
        horizontal
        onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
        onScroll={(event) => { offset.current = event.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={16}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.map((category) => (
          <View key={category.id} style={[styles.item, { width: itemWidth }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={category.icon} size={28} color={Colors.textOnPrimary} />
            </View>
            <AppText variant="label" color={colors.text} style={styles.itemLabel} numberOfLines={1}>
              {category.label}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <Pressable
        style={styles.arrowButton}
        onPress={() => scrollBy(visibleItems * itemWidth)}
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
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    minWidth: 0,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  item: {
    alignItems: 'center',
    flexShrink: 0,
    gap: Spacing.xs,
  },
  iconCircle: {
    flexShrink: 0,
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    textAlign: 'center',
    paddingHorizontal: Spacing.xs,
    maxWidth: '100%',
  },
});
