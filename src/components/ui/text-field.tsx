import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';

import { FontSize, Spacing } from '@/constants/theme';

export type TextFieldProps = TextInputProps & {
  secureToggle?: boolean;
  boxed?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function TextField({ secureToggle = false, boxed = false, icon, secureTextEntry, style, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(secureToggle);
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, boxed ? styles.boxed : { borderBottomColor: colors.border }, boxed && { borderColor: colors.primaryBorder, backgroundColor: colors.surface }]}>
      {icon && <Ionicons name={icon} size={19} color={colors.primary} style={styles.leadingIcon} />}
      <TextInput
        style={[styles.input, boxed && styles.boxedInput, { color: colors.text }, style]}
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
  boxed: {
    minHeight: 52,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingBottom: 0,
  },
  boxedInput: {
    paddingVertical: 12
  },
  leadingIcon: {
    marginRight: 10
  },
});
