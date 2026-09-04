import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import type { Pharmacy } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type FavoriteCardProps = {
  pharmacy: Pharmacy;
  favorited?: boolean;
  onToggleFavorite?: () => void;
};

export function FavoriteCard({ pharmacy, favorited = true, onToggleFavorite }: FavoriteCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceMuted }]}>
      <View style={styles.iconSquare}>
        <Ionicons name="location" size={26} color={Colors.textOnPrimary} />
      </View>

      <View style={styles.info}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {pharmacy.name}
        </AppText>
        <AppText variant="label" numberOfLines={1}>
          {pharmacy.address}
        </AppText>
        <View style={styles.hoursRow}>
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
          <AppText variant="label" color={Colors.primary}>
            {pharmacy.hours}
          </AppText>
          <View style={styles.dot} />
        </View>
      </View>

      <Pressable
        hitSlop={8}
        onPress={onToggleFavorite}
        accessibilityRole="button"
        accessibilityLabel="Favoritar farmácia">
        <Ionicons name={favorited ? 'star' : 'star-outline'} size={24} color={Colors.star} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  iconSquare: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginLeft: 2,
  },
});
