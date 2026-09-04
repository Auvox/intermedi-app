import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export type BackButtonProps = {
  tone?: 'light' | 'dark';
  onPress?: () => void;
};

export function BackButton({ tone = 'light', onPress }: BackButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={8}
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      style={({ pressed }) => [
        styles.button,
        tone === 'light' ? styles.light : { backgroundColor: colors.primarySoft },
        pressed && styles.pressed,
      ]}>
      <Ionicons
        name="chevron-back"
        size={22}
        color={tone === 'light' ? Colors.textOnPrimary : colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  light: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pressed: {
    opacity: 0.7,
  },
});
