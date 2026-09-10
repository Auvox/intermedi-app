import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
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
  'autoCapitalize' | 'keyboardType' | 'maxLength' | 'secureTextEntry' | 'onChangeText' | 'editable'
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
  editable = true,
  ...inputProps
}: EditableProfileFieldProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = editable && isEditing;

  useEffect(() => {
    if (canEdit) inputRef.current?.focus();
    else inputRef.current?.blur();
  }, [canEdit]);

  if (!editable && isEditing) setIsEditing(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: canEdit ? colors.primary : colors.border,
        },
      ]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={21} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <AppText variant="bodyBold">{label}</AppText>
        <TextInput
          {...inputProps}
          ref={inputRef}
          testID="profile-field-input"
          value={value}
          accessibilityLabel={label}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={canEdit}
          onBlur={() => setIsEditing(false)}
          onSubmitEditing={() => setIsEditing(false)}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      <Pressable
        testID="profile-field-edit"
        accessibilityRole="button"
        accessibilityLabel={`Editar ${label}`}
        accessibilityHint="Ativa o campo para edição. Use Salvar alterações ao terminar."
        accessibilityState={{ disabled: !editable }}
        disabled={!editable}
        onPress={() => { setIsEditing(true); inputRef.current?.focus(); }}
        style={({ pressed }) => [
          styles.editButton,
          {
            backgroundColor: canEdit ? colors.primary : pressed ? colors.primaryBorder : colors.primarySoft,
            borderColor: canEdit || pressed ? colors.primary : colors.primaryBorder,
            opacity: editable ? 1 : 0.4,
          },
        ]}>
        <MaterialCommunityIcons
          name="pencil-outline"
          size={22}
          color={canEdit ? colors.textOnPrimary : colors.primary}
          accessible={false}
        />
      </Pressable>
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
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    flexShrink: 0,
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  input: {
    borderWidth: 0,
    minHeight: 24,
    padding: 0,
    fontSize: FontSize.sm,
  },
  editButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
