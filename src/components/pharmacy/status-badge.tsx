import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { pharmacyStatusLabel, type PharmacyStatus } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

const STATUS_STYLE: Record<PharmacyStatus, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  'em-estoque': { bg: Colors.primarySoft, fg: Colors.primaryDark, icon: 'medkit' },
  'poucas-unidades': { bg: Colors.warningSoft, fg: '#946200', icon: 'warning' },
  indisponivel: { bg: '#FCE8E8', fg: Colors.danger, icon: 'close-circle' },
};

export function StatusBadge({ status }: { status: PharmacyStatus }) {
  const { bg, fg, icon } = STATUS_STYLE[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={12} color={fg} />
      <AppText variant="caption" color={fg} style={styles.text}>
        {pharmacyStatusLabel[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
  },
});
