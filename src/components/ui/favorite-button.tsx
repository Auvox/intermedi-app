import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme-context';

export function FavoriteButton({ selected, disabled, label, onPress }: {
  selected: boolean; disabled?: boolean; label: string; onPress: () => void;
}) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress} style={styles.button}>
    <Ionicons name={selected ? 'star' : 'star-outline'} size={24} color={colors.star} />
  </Pressable>;
}
const styles = StyleSheet.create({ button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' } });
