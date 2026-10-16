import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { IconTile } from '@/components/ui/surface';
import { useFavorites } from '@/context/favorites-context';
import { useTheme } from '@/context/theme-context';
import { FontFamily, Shadow } from '@/constants/theme';
import { enderecoFarmacia, type Farmacia } from '@/services/farmacias';
import { formatarKm } from '@/services/disponibilidade';

// Cartão de farmácia do design: nome, endereço · distância, estoque, telefone e rota.
export function PharmacyListCard({ farmacia, distance, itemsInStock }: { farmacia: Farmacia; distance?: number; itemsInStock?: number }) {
  const { colors } = useTheme();
  const router = useRouter();
  const favorites = useFavorites();
  const favorite = favorites.pharmacies.some(p => p.idFarmacia === farmacia.idFarmacia);
  const km = formatarKm(distance);
  const phone = farmacia.telFarmacia?.trim();
  // Os botões ficam lado a lado (não um dentro do outro) para funcionar também na web.
  return <View style={[styles.card, { backgroundColor: colors.surface }, Shadow]}>
    <View style={styles.top}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${farmacia.nomeFarmacia}. Ver estoque`} onPress={() => router.push({ pathname: '/farmacia/[id]', params: { id: String(farmacia.idFarmacia) } })}
        style={({ pressed }) => [styles.open, pressed && styles.pressed]}>
      <IconTile icon="add-circle" tone="green" size={54} iconSize={30} />
      <View style={styles.info}>
        <AppText variant="h3" numberOfLines={2}>{farmacia.nomeFarmacia}</AppText>
        <AppText variant="label" numberOfLines={2}>{[enderecoFarmacia(farmacia).split(',').slice(0, 2).join(','), km].filter(Boolean).join(' · ')}</AppText>
        {itemsInStock != null && <AppText variant="label" color={itemsInStock > 0 ? colors.primaryDark : colors.textMuted} style={styles.bold}>
          {itemsInStock > 0 ? `${itemsInStock} ${itemsInStock === 1 ? 'remédio' : 'remédios'} em estoque` : 'Sem estoque no momento'}
        </AppText>}
      </View>
      </Pressable>
      <FavoriteButton selected={favorite} disabled={!favorites.ready} label={favorite ? 'Remover farmácia dos favoritos' : 'Salvar farmácia nos favoritos'} onPress={() => favorites.togglePharmacy(farmacia)} />
    </View>
    <View style={styles.bottom}>
      {phone ? <Pressable accessibilityRole="link" accessibilityLabel={`Ligar para ${phone}`} onPress={() => Linking.openURL(`tel:${phone.replace(/\D/g, '')}`)} style={styles.phone} hitSlop={6}>
        <Ionicons name="call-outline" size={18} color={colors.primaryDark} />
        <AppText variant="label">{phone}</AppText>
      </Pressable> : <View style={styles.phone} />}
      <Button compact fullWidth={false} title="Ver rotas" accessibilityLabel={`Ver rota para ${farmacia.nomeFarmacia}`}
        onPress={() => router.push({ pathname: '/rota', params: { farmaciaId: String(farmacia.idFarmacia) } })} style={styles.route} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, gap: 14 },
  pressed: { opacity: 0.88 },
  top: { flexDirection: 'row', gap: 4, alignItems: 'flex-start' },
  open: { flex: 1, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  info: { flex: 1, minWidth: 0, gap: 2 },
  bold: { fontFamily: FontFamily.semibold },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  phone: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minHeight: 44 },
  route: { minHeight: 46, paddingHorizontal: 24, borderRadius: 14 },
});
