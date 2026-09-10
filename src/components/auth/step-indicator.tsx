import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export type Step = {
  key: string;
  label: string;
};

export const registerSteps: Step[] = [
  { key: 'cadastro', label: 'Cadastro' },
  { key: 'endereco', label: 'Endereço' },
  { key: 'login', label: 'Login' },
];

export type StepIndicatorProps = {
  steps: Step[];
  currentIndex: number;
};

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <View key={step.key} style={styles.stepGroup} accessible accessibilityLabel={`Etapa ${index + 1} de ${steps.length}: ${step.label}${isActive ? ', atual' : isDone ? ', concluída' : ''}`}>
            <View style={styles.row}>
              <View style={[styles.line, { backgroundColor: index <= currentIndex ? colors.primary : colors.border, opacity: index === 0 ? 0 : 1 }]} />
              <View
                style={[
                  styles.circle,
                  { backgroundColor: colors.surfaceMuted },
                  (isActive || isDone) && styles.circleActive,
                ]}>
                {isDone ? <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} /> : <AppText
                  variant="bodyBold"
                  color={isActive || isDone ? colors.textOnPrimary : colors.textMuted}
                  style={styles.circleLabel}>
                  {index + 1}
                </AppText>}
              </View>
              <View style={[styles.line, { backgroundColor: isDone ? colors.primary : colors.border, opacity: index === steps.length - 1 ? 0 : 1 }]} />
            </View>
            <AppText
              variant="caption"
              color={isActive || isDone ? colors.primary : colors.textSecondary}
              style={[styles.label, isActive && styles.labelActive]}>
              {step.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  stepGroup: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: Colors.primary,
  },
  circleLabel: {
    fontSize: 13,
  },
  line: {
    flex: 1,
    height: 2,
  },
  label: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '700',
  },
});
