import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Shadow } from '@/constants/theme';

export function FavoriteButton({ selected, disabled, label, onPress, floating = false }: {
  selected: boolean; disabled?: boolean; label: string; onPress: () => void; floating?: boolean;
}) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}
    style={[styles.button, floating && [styles.floating, { backgroundColor: colors.surface }, Shadow]]}>
    <Ionicons name={selected ? 'heart' : 'heart-outline'} size={22} color={selected ? colors.heart : colors.textMuted} />
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  floating: { width: 52, height: 52, borderRadius: 26 },
});
