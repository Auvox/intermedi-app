import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';

import { FontSize, Spacing } from '@/constants/theme';

export type TextFieldProps = TextInputProps & {
  secureToggle?: boolean;
};

export function TextField({ secureToggle = false, secureTextEntry, style, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(secureToggle);
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.border }]}>
      <TextInput
        style={[styles.input, { color: colors.text }, style]}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureToggle ? hidden : secureTextEntry}
        autoCapitalize="none"
        {...rest}
      />
      {secureToggle && (
        <Pressable
          hitSlop={12}
          onPress={() => setHidden((value) => !value)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.xs,
  },
});
