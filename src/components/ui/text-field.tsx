import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Colors, FontSize, Spacing } from '@/constants/theme';

export type TextFieldProps = TextInputProps & {
  secureToggle?: boolean;
};

export function TextField({ secureToggle = false, secureTextEntry, style, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(secureToggle);

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.textMuted}
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
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
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
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.xs,
  },
});
