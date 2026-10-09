import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Mapa from '@/components/map/mapa';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-context';
import { useHomeLocation } from '@/hooks/use-home-location';
import { calcularDistancia } from '@/services/progresso-rota';
import { useApiResource } from '@/hooks/use-api-resource';
import { listarFarmacias, prepararFarmaciasParaMapa } from '@/services/farmacias';

export function PharmacyMap() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { data, loading, error, reload } = useApiResource(listarFarmacias);
  const allPharmacies = useMemo(() => prepararFarmaciasParaMapa(data ?? []), [data]);
  const location = useHomeLocation();
  const pharmacies = useMemo(() => location.position
    ? allPharmacies.filter(p => calcularDistancia(location.position!, [p.longitude, p.latitude]) <= 5000)
    : allPharmacies, [allPharmacies, location.position]);
  const [selectedId, setSelectedId] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const selected = pharmacies.find(p => p.id === selectedId);
  const openList = () => { setExpanded(false); router.push('/farmacias'); };
  const goToRoute = () => {
    if (!selected) return;
    setExpanded(false);
    router.push({ pathname: '/rota', params: { farmaciaId: selected.id } });
  };
  const renderMap = () => loading ? <View style={styles.status}>
    <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando farmácias" />
    <AppText variant="label">Carregando farmácias…</AppText>
  </View> : error ? <View style={styles.status}>
    <AppText variant="label" style={styles.center}>{error}</AppText>
    <Button title="Tentar novamente" variant="outline" onPress={reload} />
  </View> : !pharmacies.length && !location.position ? <View style={styles.status}>
    <Ionicons name="map-outline" size={32} color={colors.primaryDark} />
    <AppText variant="bodyBold" style={styles.center}>{data?.length ? 'Localização das farmácias indisponível' : 'Nenhuma farmácia cadastrada'}</AppText>
    {!!data?.length && <AppText variant="label" style={styles.center}>Consulte os endereços na lista de farmácias.</AppText>}
    <Button title="Ver farmácias" variant="outline" onPress={openList} />
  </View> : <Mapa farmacias={pharmacies} onSelectFarmacia={setSelectedId} localizacao={location.position} centralizarUsuario={!!location.position} enquadrarFarmacias={!location.position} expandido modelo={isDark ? 'dark' : 'positron'} />;
  const details = selected ? <View style={[styles.details, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.detailHeading}>
      <Ionicons name="medical" size={22} color={colors.primaryDark} />
      <AppText variant="bodyBold" style={styles.name}>{selected.name}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes da farmácia" onPress={() => setSelectedId(undefined)} style={styles.iconButton}>
        <Ionicons name="close" size={22} color={colors.text} />
      </Pressable>
    </View>
    <AppText variant="label">{selected.address}</AppText>
    <Button title="Ver rota" onPress={goToRoute} />
  </View> : null;
  return <View style={styles.section}>
    <View style={styles.heading}>
      <AppText variant="h3" style={styles.name}>{location.position ? 'Farmácias perto de você' : 'Farmácias no mapa'}</AppText>
      <Pressable accessibilityRole="button" onPress={openList} style={styles.link}>
        <AppText variant="caption" color={colors.primaryDark}>Ver todas →</AppText>
      </Pressable>
    </View>
    <View style={styles.heading}>
      <AppText variant="caption" style={styles.name}>{location.loading ? 'Buscando sua localização…' : location.position ? pharmacies.length + (pharmacies.length === 1 ? ' farmácia cadastrada em até 5 km.' : ' farmácias cadastradas em até 5 km.') : 'Permita sua localização para encontrar farmácias próximas.'}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel="Atualizar minha localização" accessibilityState={{ disabled: location.loading }} disabled={location.loading} onPress={location.refresh} style={[styles.expand, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name="locate-outline" size={18} color={colors.primaryDark} />
        <AppText variant="caption" color={colors.primaryDark}>Minha localização</AppText>
      </Pressable>
    </View>
    {!!location.message && <AppText variant="caption">{location.message}</AppText>}
    <View style={[styles.preview, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      {!expanded && renderMap()}
    </View>
    <View style={styles.heading}>
      {!!pharmacies.length && <AppText variant="caption" style={styles.name}>Toque em um marcador para ver a farmácia.</AppText>}
      {(!!pharmacies.length || !!location.position) && <Pressable accessibilityRole="button" accessibilityLabel="Expandir mapa de farmácias" onPress={() => setExpanded(true)} style={[styles.expand, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name="expand-outline" size={18} color={colors.primaryDark} />
        <AppText variant="caption" color={colors.primaryDark}>Expandir</AppText>
      </Pressable>}
    </View>
    {!expanded && details}
    <Modal visible={expanded} animationType="slide" onRequestClose={() => setExpanded(false)}>
      <SafeAreaView style={[styles.fullscreen, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeading}>
          <AppText variant="h3" style={styles.name}>Farmácias no mapa</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar mapa ampliado" onPress={() => setExpanded(false)} style={styles.iconButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.fullMap}>{expanded && renderMap()}</View>
        <ScrollView style={styles.modalDetails} contentContainerStyle={styles.modalContent}>
          {details ?? <AppText variant="label">Toque em uma farmácia no mapa para ver o endereço e a rota.</AppText>}
          <Button title="Ver todas as farmácias" variant="outline" onPress={openList} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: 10 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  name: { flex: 1, minWidth: 120 },
  preview: { height: 230, borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  status: { flex: 1, padding: 20, gap: 12, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  expand: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 44, borderRadius: 14 },
  details: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 10 },
  detailHeading: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  fullscreen: { flex: 1 },
  modalHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  fullMap: { flex: 1, minHeight: 180 },
  modalDetails: { maxHeight: '45%' },
  modalContent: { padding: 16, gap: 12 },
});
