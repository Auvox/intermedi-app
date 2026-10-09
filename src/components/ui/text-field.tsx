import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { FontSize } from '@/constants/theme';
import { AppText } from './app-text';
export type TextFieldProps = TextInputProps & { secureToggle?: boolean; label?: string; icon?: keyof typeof Ionicons.glyphMap; trailingIcon?: keyof typeof Ionicons.glyphMap; trailingLabel?: string; onTrailingPress?: () => void; trailingLoading?: boolean; onGalleryPress?: () => void };
export function TextField({ secureToggle = false, secureTextEntry, style, label, icon, trailingIcon, trailingLabel, onTrailingPress, trailingLoading = false, onGalleryPress, placeholder, accessibilityLabel, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(secureToggle); const [focused, setFocused] = useState(false);
  const { colors, textScale } = useTheme(); const resolved = StyleSheet.flatten([styles.input, style]);
  return <View style={styles.field}>
    {label ? <AppText variant="label" color={colors.textSecondary}>{label}</AppText> : null}
    <View style={[styles.wrapper, { backgroundColor: colors.surfaceMuted, borderColor: focused ? colors.primaryDark : colors.border }]}>
      {icon ? <Ionicons name={icon} size={21} color={colors.primaryDark} /> : null}
      <TextInput {...rest} accessibilityLabel={accessibilityLabel ?? label ?? placeholder} placeholder={placeholder}
        onFocus={event => { setFocused(true); rest.onFocus?.(event); }} onBlur={event => { setFocused(false); rest.onBlur?.(event); }}
        style={[styles.input, { color: colors.text }, style, { fontSize: (resolved.fontSize ?? FontSize.md) * textScale }]}
        placeholderTextColor={colors.textMuted} secureTextEntry={secureToggle ? hidden : secureTextEntry} autoCapitalize={rest.autoCapitalize ?? 'none'} />
      {onGalleryPress ? <Pressable accessibilityRole="button" accessibilityLabel="Escolher foto da galeria" accessibilityState={{ disabled: trailingLoading }} disabled={trailingLoading} onPress={onGalleryPress} style={styles.iconButton}>
        <View style={styles.galleryIcon}>
          <Ionicons name="image-outline" size={23} color={colors.primaryDark} />
          <View style={[styles.galleryPlus, { backgroundColor: colors.surfaceMuted }]}><Ionicons name="add" size={13} color={colors.primaryDark} /></View>
        </View>
      </Pressable> : null}
      {trailingIcon && onTrailingPress ? <Pressable accessibilityRole="button" accessibilityLabel={trailingLabel} accessibilityState={{ disabled: trailingLoading }} disabled={trailingLoading} onPress={onTrailingPress} style={styles.iconButton}>
        {trailingLoading ? <ActivityIndicator color={colors.primaryDark} /> : <Ionicons name={trailingIcon} size={23} color={colors.primaryDark} />}
      </Pressable> : null}
      {secureToggle ? <Pressable onPress={() => setHidden(value => !value)} style={styles.iconButton} accessibilityRole="button" accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}>
        <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.primaryDark} />
      </Pressable> : null}
    </View>
  </View>;
}
const styles = StyleSheet.create({ galleryIcon: { width: 25, height: 25, justifyContent: 'center' }, galleryPlus: { position: 'absolute', top: -3, right: -4, borderRadius: 7 }, field: { gap: 6 }, wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, minHeight: 50 }, input: { flex: 1, minWidth: 0, fontSize: FontSize.md, paddingVertical: 12 }, iconButton: { minHeight: 44, minWidth: 36, alignItems: 'center', justifyContent: 'center' } });
