import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
export type Step = { key: string; label: string };
export const registerSteps: Step[] = [{ key: 'identidade', label: 'Dados pessoais' }, { key: 'seguranca', label: 'Segurança' }, { key: 'endereco', label: 'Endereço' }];
export type StepIndicatorProps = { steps: Step[]; currentIndex: number };
export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) { const { colors } = useTheme(); return <View accessibilityLabel={'Etapa ' + (currentIndex + 1) + ' de ' + steps.length + ': ' + steps[currentIndex]?.label} style={styles.container}><View style={[styles.track, { backgroundColor: colors.border }]}><View style={[styles.progress, { backgroundColor: colors.primary, width: (((currentIndex + 1) / steps.length * 100) + '%') as `${number}%` }]} /></View><AppText variant="caption" color={colors.textSecondary}>{steps[currentIndex]?.label} · {currentIndex + 1}/{steps.length}</AppText></View>; }
const styles = StyleSheet.create({ container: { gap: 8 }, track: { height: 5, borderRadius: 3, overflow: 'hidden' }, progress: { height: '100%', borderRadius: 3 } });
