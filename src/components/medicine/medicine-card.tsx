import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FavoriteButton } from '@/components/ui/favorite-button';
import { AppText } from '@/components/ui/app-text';
import { Tag } from '@/components/ui/surface';
import { useFavorites } from '@/context/favorites-context';
import { useTheme } from '@/context/theme-context';
import type { Medicine } from '@/constants/mock-data';
import { Shadow, Spacing } from '@/constants/theme';
import { medicineTitle, pillKind, primaryTone, requiresPrescription, splitCategories } from '@/utils/medicine-style';
import { MedicineThumb } from './medicine-thumb';

export type MedicineCardProps = {
  medicine: Medicine;
  onPress: () => void;
  // Quantas farmácias têm estoque (undefined enquanto consulta).
  pharmacyCount?: number;
  showFavorite?: boolean;
};

export function MedicineCard({ medicine, onPress, pharmacyCount, showFavorite = false }: MedicineCardProps) {
  const { colors } = useTheme();
  const favorites = useFavorites();
  const favorite = favorites.medicines.some(m => m.id === medicine.id);
  const prescription = requiresPrescription(medicine);
  const subtitle = splitCategories(medicine.category).join(' · ') || 'Sem categoria';
  return (
    // O coração fica ao lado (não dentro) do botão do cartão para funcionar também na web.
    <View style={[styles.card, { backgroundColor: colors.surface }, Shadow]}>
      <Pressable
        style={({ pressed }) => [styles.open, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${medicineTitle(medicine)}`}>
        <MedicineThumb uri={medicine.photo} name={medicine.name} tone={primaryTone(medicine)} kind={pillKind(medicine)} size={64} />
        <View style={styles.info}>
          <AppText variant="bodyBold" numberOfLines={2} style={styles.title}>{medicineTitle(medicine)}</AppText>
          <AppText variant="label" numberOfLines={1}>{subtitle}</AppText>
          <View style={styles.tags}>
            {prescription && <Tag label="Exige receita" tone="amber" />}
            {pharmacyCount != null && (pharmacyCount > 0
              ? <Tag label={`${pharmacyCount} ${pharmacyCount === 1 ? 'farmácia' : 'farmácias'}`} tone="green" />
              : <Tag label="Sem estoque" tone="neutral" />)}
          </View>
        </View>
        {!showFavorite && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
      </Pressable>
      {showFavorite && <FavoriteButton selected={favorite} disabled={!favorites.ready} label={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'} onPress={() => favorites.toggleMedicine(medicine)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pressed: { opacity: 0.85 },
  info: { flex: 1, gap: 2, minWidth: 0 },
  title: { fontSize: 17 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
});
