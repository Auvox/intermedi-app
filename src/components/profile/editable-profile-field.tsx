import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { FontSize, Radius, Spacing } from '@/constants/theme';

type EditableProfileFieldProps = Pick<
  TextInputProps,
  'autoCapitalize' | 'keyboardType' | 'maxLength' | 'secureTextEntry'
> & {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  placeholder?: string;
};

export function EditableProfileField({
  icon,
  label,
  value,
  placeholder = 'Não informado',
  ...inputProps
}: EditableProfileFieldProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name={icon} size={21} color={colors.textSecondary} />
      </View>

      <View style={styles.content}>
        <AppText variant="bodyBold">{label}</AppText>
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={false}
          style={[styles.input, { color: colors.text }]}
          {...inputProps}
        />
      </View>

      <View style={styles.editButton}>
        <Ionicons name="pencil-outline" size={21} color={colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 1,
  },
  input: {
    minHeight: 24,
    padding: 0,
    fontSize: FontSize.sm,
  },
  editButton: {
    padding: Spacing.xs,
  },
});
