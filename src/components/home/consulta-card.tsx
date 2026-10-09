import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { MedicinePhoto } from '@/components/medicine/medicine-photo';
import { useTheme } from '@/context/theme-context';
import type { Medicine } from '@/constants/mock-data';
export type ConsultaCardProps = { medicine: Medicine; highlighted?: boolean; onConsultar: () => void };
export function ConsultaCard({ medicine, highlighted = false, onConsultar }: ConsultaCardProps) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={'Consultar ' + medicine.name + ' ' + medicine.dosage} onPress={onConsultar} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: highlighted ? colors.primary : colors.border, opacity: pressed ? 0.75 : 1 }]}>
    <MedicinePhoto uri={medicine.photo} name={medicine.name} />
    <View style={styles.info}>
      <AppText variant="bodyBold">{medicine.name}</AppText>
      {!!medicine.dosage && <AppText variant="label">{medicine.dosage}</AppText>}
      <AppText variant="caption" numberOfLines={1}>{medicine.category}</AppText>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 84 },
  info: { flex: 1, minWidth: 0, gap: 2 },
});
