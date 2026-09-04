import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { PillIcon } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';

import type { Medicine } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type ConsultaCardProps = {
  medicine: Medicine;
  highlighted?: boolean;
  onConsultar: () => void;
};

export function ConsultaCard({
  medicine,
  highlighted = false,
  onConsultar,
}: ConsultaCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.surfaceMuted },
        highlighted && styles.cardHighlighted,
      ]}
    >
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textMuted}
        style={styles.chevron}
      />

      <View style={styles.row}>
        <View style={styles.iconSquare}>
          <PillIcon
            size={28}
            color={Colors.textOnPrimary}
          />
        </View>

        <View style={styles.info}>
          <AppText
            variant="bodyBold"
            numberOfLines={1}
          >
            {medicine.name}{' '}
            <AppText variant="body">
              {medicine.dosage}
            </AppText>
          </AppText>

          <AppText
            variant="label"
            numberOfLines={1}
          >
            {medicine.category}
          </AppText>
        </View>
      </View>

      <Button
        title="Consultar"
        onPress={onConsultar}
        fullWidth={false}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  cardHighlighted: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },

  chevron: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },

  iconSquare: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    flex: 1,
    gap: 2,
  },

  button: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
