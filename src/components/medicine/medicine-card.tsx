import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import type { Medicine } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type MedicineCardProps = {
  medicine: Medicine;
  onPress: () => void;
};

export function MedicineCard({ medicine, onPress }: MedicineCardProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceMuted }, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${medicine.name} ${medicine.dosage}`}>
      <View style={styles.topRow}>
        <View style={styles.iconSquare}>
          <Ionicons name="medkit" size={25} color={Colors.textOnPrimary} />
        </View>

        <View style={styles.info}>
          <AppText variant="bodyBold" numberOfLines={1}>
            {medicine.name}
          </AppText>
          <AppText variant="label" numberOfLines={1}>
            {medicine.dosage}
          </AppText>
          <View style={styles.categoryRow}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
            <AppText variant="label" color={Colors.primary} numberOfLines={1}>
              {medicine.category}
            </AppText>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: colors.primarySoft }]}>
          <View style={styles.statusDot} />
          <AppText variant="caption" color={colors.primaryDark}>
            Disponível para consulta
          </AppText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.surfaceMuted }]} />

      <View style={styles.bottomRow}>
        <View style={styles.pharmacyRow}>
          <Ionicons name="business-outline" size={18} color={Colors.primary} />
          <AppText variant="body" numberOfLines={1} style={styles.pharmacyText}>
            Consultar farmácias
          </AppText>
        </View>

        <View style={styles.detailButton}>
          <AppText variant="button" style={styles.detailButtonText}>
            Ver detalhes
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardPressed: {
    opacity: 0.82,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: Spacing.sm,
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
    minWidth: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusRow: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  divider: {
    height: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  pharmacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  pharmacyText: {
    flexShrink: 1,
  },
  detailButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  detailButtonText: {
    fontSize: 13,
  },
});
