import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/pharmacy/status-badge';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import type { Pharmacy } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type PharmacyCardProps = {
  pharmacy: Pharmacy;
};

export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  function handleViewRoute() {
    const query = encodeURIComponent(pharmacy.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  function handleCall() {
    Linking.openURL(`tel:${pharmacy.phone.replace(/\D/g, '')}`);
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconSquare}>
          <Ionicons name="location" size={26} color={Colors.textOnPrimary} />
        </View>

        <View style={styles.info}>
          <AppText variant="bodyBold" numberOfLines={1}>
            {pharmacy.name}
          </AppText>
          <AppText variant="label" numberOfLines={1}>
            {pharmacy.address}
          </AppText>
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <AppText variant="label" color={Colors.primary}>
              {pharmacy.hours}
            </AppText>
            <View style={styles.dot} />
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge status={pharmacy.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <Pressable
          style={styles.phoneRow}
          onPress={handleCall}
          accessibilityRole="button"
          accessibilityLabel={`Ligar para ${pharmacy.name}`}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <AppText variant="body" color={Colors.text}>
            {pharmacy.phone}
          </AppText>
        </Pressable>

        <Button
          title="Ver rota"
          onPress={handleViewRoute}
          fullWidth={false}
          style={styles.routeButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  badgeRow: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: Spacing.xxxl,
  },
  iconSquare: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
