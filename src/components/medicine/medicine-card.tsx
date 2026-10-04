import { FavoriteButton } from '@/components/ui/favorite-button';
import { useFavorites } from '@/context/favorites-context';
import { MedicinePhoto } from './medicine-photo';
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
  const favorites = useFavorites();
  return (
    <View style={[styles.card, { boxShadow: '0 4px 16px rgba(20,63,50,0.08)', backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        style={({ pressed }) => [styles.cardContent, pressed && styles.cardPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${medicine.name} ${medicine.dosage}`}>
        <View style={styles.topRow}>
          <MedicinePhoto uri={medicine.photo} name={medicine.name} />

          <View style={styles.info}>
            <AppText variant="bodyBold" numberOfLines={1}>
              {medicine.name}
            </AppText>
            <AppText variant="label" numberOfLines={1}>
              {medicine.dosage}
            </AppText>
            <View style={styles.categoryRow}>
              <Ionicons name="pricetag-outline" size={14} color={colors.primaryDark} />
              <AppText variant="label" color={colors.primaryDark} numberOfLines={1}>
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
            <Ionicons name="business-outline" size={18} color={colors.primaryDark} />
            <AppText variant="caption" numberOfLines={2} style={styles.pharmacyText}>
              Consultar detalhes
            </AppText>
          </View>

          <View style={[styles.detailButton, { backgroundColor: colors.primary }]}>
            <AppText variant="button" style={styles.detailButtonText}>
              Ver detalhes
            </AppText>
          </View>
        </View>
      </Pressable>
<View style={styles.favorite}><FavoriteButton selected={favorites.medicines.some(m => m.id === medicine.id)} disabled={!favorites.ready}
        label={favorites.medicines.some(m => m.id === medicine.id) ? 'Remover medicamento dos favoritos' : 'Salvar medicamento nos favoritos'} onPress={() => favorites.toggleMedicine(medicine)} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardContent: { gap: Spacing.md },
  favorite: { position: 'absolute', top: 8, right: 8 },
  cardPressed: {
    opacity: 0.82,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: 40,
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
