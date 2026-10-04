import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { useTheme } from '@/context/theme-context';
export type AuthHeaderProps = { title: string; showBack?: boolean };
export function AuthHeader({ title, showBack = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets(); const { colors } = useTheme();
  return <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
    {showBack ? <BackButton tone="dark" /> : null}
    <View style={[styles.bubble, { backgroundColor: colors.primarySoft }]}><AppText variant="h2" color={colors.primaryDarker} style={styles.title}>{title}</AppText></View>
  </View>;
}
const styles = StyleSheet.create({ header: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 }, bubble: { borderRadius: 28, padding: 24, alignSelf: 'center', width: '100%', maxWidth: 380 }, title: { textAlign: 'center', fontSize: 24 } });
