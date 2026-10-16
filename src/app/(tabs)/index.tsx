import { useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApiResource } from '@/hooks/use-api-resource';
import { listarMedicamentos } from '@/services/medicamentos';
import { mapaDisponibilidade } from '@/services/disponibilidade';
import { AppTour } from '@/components/home/app-tour';
import { MedicineThumb } from '@/components/medicine/medicine-thumb';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { MascotAvatar } from '@/components/ui/mascot';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card, IconTile, SectionTitle, Tag } from '@/components/ui/surface';
import { FontFamily, Shadow, toneColors } from '@/constants/theme';
import { formatTime, useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { formatUserAddress } from '@/utils/user-address';
import { categoryStyle, splitCategories } from '@/utils/medicine-style';

export default function InicioScreen() {
  const router = useRouter(); const { colors } = useTheme(); const { user } = useUser(); const care = useCare();
  const catalog = useApiResource(listarMedicamentos);
  const disponibilidade = useApiResource(mapaDisponibilidade);
  // Categorias mais usadas no catálogo do banco.
  const categories = useMemo(() => {
    const count: Record<string, number> = {};
    (catalog.data ?? []).forEach(m => splitCategories(m.category).forEach(c => { count[c] = (count[c] ?? 0) + 1; }));
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([label]) => label);
  }, [catalog.data]);
  const pharmaciesWithStock = disponibilidade.data ? Object.values(disponibilidade.data.itensPorFarmacia).filter(n => n > 0).length : undefined;
  const firstName = user?.nome?.trim().split(' ')[0];
  const address = formatUserAddress(user) || 'Cadastrar endereço';
  const next = care.nextDose;

  useEffect(() => { if (care.ready && !care.introSeen) router.replace('/boas-vindas'); }, [care.ready, care.introSeen, router]);

  return <View style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader large={false} overlap={52}
        inline={<Pressable accessibilityRole="button" accessibilityLabel={`Endereço: ${address}. Trocar endereço`} onPress={() => router.push('/endereco-picker')} style={styles.location}>
          <Ionicons name="location-outline" size={18} color="#FFFFFF" />
          <AppText variant="label" color="#FFFFFF" numberOfLines={1} style={styles.locationText}>{address}</AppText>
          <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
        </Pressable>}
        right={<Pressable accessibilityRole="button" accessibilityLabel="Notificações" onPress={() => router.push('/notificacoes')} style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          <View style={[styles.bellDot, { backgroundColor: colors.warning }]} />
        </Pressable>}>
        <View>
          <AppText variant="h1" color="#FFFFFF" style={styles.hello}>Olá{firstName ? `, ${firstName}` : ''}</AppText>
          <AppText color="rgba(255,255,255,0.85)">Como você está hoje?</AppText>
        </View>
        <View style={[styles.search, { backgroundColor: colors.surface }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Buscar remédio ou farmácia" onPress={() => router.push({ pathname: '/pesquisa', params: { origem: 'home' } })} style={styles.searchTap}>
            <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
            <AppText color={colors.textMuted} numberOfLines={1} style={styles.flex}>Buscar remédio ou farmácia</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Filtrar busca" onPress={() => router.push({ pathname: '/pesquisa', params: { origem: 'home', filtro: 'medicines' } })} style={[styles.filter, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="options-outline" size={20} color={colors.primaryDark} />
          </Pressable>
        </View>
      </ScreenHeader>

      <View style={styles.body}>
        <Card style={styles.reminder}>
          <MascotAvatar id={care.mascot} size={70} />
          <View style={styles.flex}>
            <AppText variant="bodyBold">{next ? `${next.name} às ${next.time}` : care.todayDoses.length ? 'Doses em dia!' : 'Sua rotina'}</AppText>
            <AppText variant="label">{next ? 'Já tomou? Confirma que eu anoto.' : care.todayDoses.length ? 'Você confirmou todas as doses.' : 'Cadastre seus remédios e eu te lembro na hora.'}</AppText>
          </View>
          {next ? <Button compact fullWidth={false} title="Tomei" onPress={() => care.setDoseStatus(next.id, 'tomado')} />
            : <Button compact fullWidth={false} title={care.todayDoses.length ? 'Ver' : 'Adicionar'} onPress={() => router.push('/comprimidos')} />}
        </Card>

        <SectionTitle title="Categorias" action="Ver todas" onAction={() => router.push('/buscar-medicamentos')} />
        {catalog.loading ? <AppText variant="label">Carregando categorias…</AppText>
          : catalog.error ? <View style={styles.inline}><AppText variant="label" style={styles.flex}>{catalog.error}</AppText><Button compact fullWidth={false} variant="ghost" title="Tentar de novo" onPress={catalog.reload} /></View>
          : categories.length ? <View style={styles.categories}>
            {categories.map(label => {
              const style = categoryStyle(label);
              return <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Ver remédios de ${label}`} onPress={() => router.push({ pathname: '/buscar-medicamentos', params: { categoria: label } })} style={styles.category}>
                <IconTile icon={style.icon} tone={style.tone} size={72} iconSize={30} />
                <AppText variant="caption" color={colors.text} numberOfLines={2} style={styles.categoryLabel}>{label}</AppText>
              </Pressable>;
            })}
          </View> : <AppText variant="label">Nenhuma categoria cadastrada.</AppText>}

        <View style={styles.shortcuts}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/onde-doi')} style={[styles.shortcut, { backgroundColor: toneColors(colors, 'orange').bg }]}>
            <View style={[styles.shortcutIcon, { backgroundColor: colors.surface }]}><Ionicons name="accessibility-outline" size={24} color={colors.orange} /></View>
            <AppText variant="bodyBold">Onde dói?</AppText>
            <AppText variant="caption" color={colors.orange}>Marque no corpo</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/farmacias')} style={[styles.shortcut, { backgroundColor: toneColors(colors, 'blue').bg }]}>
            <View style={[styles.shortcutIcon, { backgroundColor: colors.surface }]}><Ionicons name="map-outline" size={24} color={colors.blue} /></View>
            <AppText variant="bodyBold">Farmácias perto</AppText>
            <AppText variant="caption" color={colors.blue}>{pharmaciesWithStock != null ? `${pharmaciesWithStock} com estoque` : disponibilidade.loading ? 'Consultando estoque…' : 'Ver no mapa'}</AppText>
          </Pressable>
        </View>

        <SectionTitle title="Remédios de hoje" action="Ver todos" onAction={() => router.push('/comprimidos')} />
        {care.todayDoses.length ? <View style={[styles.list, { backgroundColor: colors.surface }, Shadow]}>
          {care.todayDoses.slice(0, 4).map((dose, index) => <Pressable key={dose.id} accessibilityRole="button" onPress={() => router.push('/comprimidos')}
            style={[styles.doseRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <MedicineThumb uri={dose.photo} kind={dose.kind} tone="neutral" size={48} name={dose.name} />
            <View style={styles.flex}>
              <AppText variant="bodyBold" numberOfLines={1}>{dose.name} {dose.dosage}</AppText>
              <AppText variant="label" numberOfLines={1}>{dose.note || (dose.kind === 'capsule' ? '1 cápsula' : '1 comprimido')}</AppText>
            </View>
            {dose.status === 'tomado' ? <Tag label="Tomado" tone="green" /> : dose.status === 'pulado' ? <Tag label="Pulada" tone="neutral" /> : <Tag label={formatTime(dose.time)} tone="amber" />}
          </Pressable>)}
        </View> : <Card style={styles.empty}>
          <AppText variant="label" style={styles.flex}>Nenhum remédio na sua rotina ainda. Abra um remédio e toque em “Adicionar à rotina”.</AppText>
        </Card>}
      </View>
    </ScrollView>
    <AppTour />
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1 }, scroll: { paddingBottom: 120 }, flex: { flex: 1, minWidth: 0 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  locationText: { flexShrink: 1, fontFamily: FontFamily.medium },
  bell: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 12, right: 13, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#0E6B50' },
  hello: { fontSize: 30, lineHeight: 38 },
  search: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, paddingLeft: 18, paddingRight: 8, minHeight: 60 },
  searchTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  filter: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 18, gap: 16, marginTop: -44 },
  reminder: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categories: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  category: { flex: 1, alignItems: 'center', gap: 8 },
  categoryLabel: { textAlign: 'center' },
  shortcuts: { flexDirection: 'row', gap: 12 },
  shortcut: { flex: 1, borderRadius: 22, padding: 16, gap: 4, minHeight: 138 },
  shortcutIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  list: { borderRadius: 22, paddingHorizontal: 16 },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  empty: { flexDirection: 'row' },
});
