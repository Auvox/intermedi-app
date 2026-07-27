import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Spacing } from '@/constants/theme';

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
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <View key={step.key} style={styles.stepGroup}>
            <View style={styles.row}>
              <View
                style={[
                  styles.circle,
                  (isActive || isDone) && styles.circleActive,
                ]}>
                <AppText
                  variant="bodyBold"
                  color={isActive || isDone ? Colors.textOnPrimary : Colors.textMuted}
                  style={styles.circleLabel}>
                  {index + 1}
                </AppText>
              </View>
              {index < steps.length - 1 && (
                <View style={[styles.line, isDone && styles.lineActive]} />
              )}
            </View>
            <AppText
              variant="caption"
              color={isActive ? Colors.primary : Colors.textMuted}
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
    paddingHorizontal: Spacing.xl,
  },
  stepGroup: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceMuted,
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
    width: 56,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
  lineActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    marginTop: Spacing.xs,
  },
  labelActive: {
    fontWeight: '700',
  },
});
