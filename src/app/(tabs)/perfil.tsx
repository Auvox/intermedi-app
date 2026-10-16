import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { CheckboxBox } from '@/components/ui/checkbox';
import { MASCOTS, MascotAvatar } from '@/components/ui/mascot';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ListRow } from '@/components/ui/surface';
import { FontFamily, Shadow } from '@/constants/theme';
import { useCare } from '@/context/care-context';
import { useFavorites } from '@/context/favorites-context';
import { useTheme } from '@/context/theme-context';
import { apiRequest, getApiAssetUrl } from '@/constants/api';
import { useUser } from '@/context/user-context';
export default function PerfilScreen() {
  const router = useRouter(); const { colors, isDark, setIsDark, highContrast, setHighContrast, textSize, setTextSize } = useTheme(); const { user, setUser } = useUser(); const photo = getApiAssetUrl(user?.fotoPerfilPaciente);
  const care = useCare(); const favorites = useFavorites();
  const [confirm, setConfirm] = useState(false); const [leaving, setLeaving] = useState(false);
  const initials = (user?.nome ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';
  const accessible = highContrast || textSize !== 'standard';
  const lastPain = [...care.pains].sort((a, b) => a.date.localeCompare(b.date)).pop();
  const stats = [
    { value: new Set(care.doses.map(d => d.medicineId)).size, label: 'Remédios em uso', color: colors.primaryDark },
    { value: lastPain?.regions.length ?? 0, label: 'Regiões de dor', color: colors.orange },
    { value: favorites.medicines.length + favorites.pharmacies.length, label: 'Favoritos', color: colors.blue },
  ];
  async function logout() { if (leaving) return; setLeaving(true); try { if (user?.token) void apiRequest('/api/auth/logout', { method: 'POST' }, user.token).catch(() => { }); await setUser(null); router.replace('/welcome'); } finally { setLeaving(false); } }
  return <View style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader large={false} overlap={58}
        inline={<View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            {photo ? <Image source={{ uri: photo }} style={styles.photo} accessibilityLabel="Sua foto de perfil" /> : <AppText variant="h2" color={colors.primaryDark}>{initials}</AppText>}
          </View>
          <View style={styles.flex}>
            <AppText variant="h3" color="#FFFFFF" numberOfLines={2} style={styles.name}>{user?.nome || 'Meu perfil'}</AppText>
            <AppText variant="label" color="rgba(255,255,255,0.85)" numberOfLines={1}>{user?.email}</AppText>
          </View>
        </View>}
        right={<Pressable accessibilityRole="button" accessibilityLabel="Editar meus dados" onPress={() => router.push('/meus-dados')} style={styles.edit}><Ionicons name="pencil-outline" size={20} color="#FFFFFF" /></Pressable>} />
      <View style={styles.body}>
        <View style={styles.stats}>{stats.map(s => <View key={s.label} style={[styles.stat, { backgroundColor: colors.surface }, Shadow]}>
          <AppText variant="h2" color={s.color} style={styles.statValue}>{s.value}</AppText>
          <AppText variant="caption">{s.label}</AppText>
        </View>)}</View>
        <View style={[styles.group, { backgroundColor: colors.surface }, Shadow]}>
          <ListRow leading={<MascotAvatar id={care.mascot} size={44} />} title="Seu mascote" subtitle={MASCOTS[care.mascot].name} onPress={() => router.push('/mascote')} />
          <ListRow divider icon="ellipse-outline" tone="blue" title="Seus comprimidos" right={care.nextDose ? <View style={[styles.pill, { backgroundColor: colors.warningSoft }]}><AppText variant="caption" color={colors.warningText}>Próxima {care.nextDose.time}</AppText></View> : undefined} onPress={() => router.push('/comprimidos')} />
          <ListRow divider icon="pulse-outline" tone="orange" title="Resumo da semana" onPress={() => router.push('/semana')} />
        </View>
        <View style={[styles.group, { backgroundColor: colors.surface }, Shadow]}>
          <ListRow icon="shield-checkmark-outline" tone="purple" title="Privacidade e dados" onPress={() => router.push('/meus-dados')} />
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: isDark }} onPress={() => setIsDark(!isDark)}>
            <ListRow divider icon="moon-outline" tone="neutral" title="Modo escuro" right={<CheckboxBox checked={isDark} />} />
          </Pressable>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accessible }} accessibilityHint="Aumenta o texto e o contraste" onPress={() => { setHighContrast(!accessible); setTextSize(accessible ? 'standard' : 'large'); }}>
            <ListRow divider icon="accessibility-outline" tone="amber" title="Modo acessibilidade" right={<CheckboxBox checked={accessible} />} />
          </Pressable>
          <ListRow divider icon="text-outline" tone="green" title="Ajustes de leitura" onPress={() => router.push('/acessibilidade')} />
        </View>
        <Button variant="danger" title="Sair da conta" onPress={() => setConfirm(true)} />
      </View>
    </ScrollView>
    <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => { if (!leaving) setConfirm(false); }}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}><View style={[styles.modal, { backgroundColor: colors.surface }]}>
        <Ionicons name="log-out-outline" size={44} color={colors.danger} />
        <AppText variant="h3" style={styles.center}>Você tem certeza que deseja sair?</AppText>
        <AppText variant="label" style={styles.center}>Ao sair, sua sessão será encerrada neste dispositivo.</AppText>
        <Button title="Sair" loading={leaving} onPress={logout} style={{ backgroundColor: colors.danger }} /><Button title="Cancelar" variant="outline" disabled={leaving} onPress={() => setConfirm(false)} />
      </View></View>
    </Modal></View>;
}
const styles = StyleSheet.create({
  page: { flex: 1 }, scroll: { paddingBottom: 120 }, flex: { flex: 1, minWidth: 0 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: '#8FE0B5', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  name: { fontSize: 22, lineHeight: 28 },
  edit: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 18, marginTop: -50, gap: 16 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, borderRadius: 20, padding: 14, minHeight: 104 },
  statValue: { fontFamily: FontFamily.bold },
  group: { borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 },
  pill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, modal: { width: '100%', maxWidth: 380, borderRadius: 28, padding: 24, gap: 14, alignItems: 'center' }, center: { textAlign: 'center' },
});
