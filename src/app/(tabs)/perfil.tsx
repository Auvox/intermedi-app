import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/home/app-header';
import { ProfileMenuItem } from '@/components/profile/profile-menu-item';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { CrossPatternBackground } from '@/components/ui/cross-pattern-background';
import { useTheme } from '@/context/theme-context';
import { apiRequest, getApiAssetUrl } from '@/constants/api';
import { useUser } from '@/context/user-context';
export default function PerfilScreen() {
  const router = useRouter(); const { colors } = useTheme(); const { user, setUser } = useUser(); const photo = getApiAssetUrl(user?.fotoPerfilPaciente);
  const [confirm, setConfirm] = useState(false); const [leaving, setLeaving] = useState(false); const [info, setInfo] = useState('');
  async function logout() { if (leaving) return; setLeaving(true); try { if (user?.token) void apiRequest('/api/auth/logout', { method: 'POST' }, user.token).catch(() => { }); await setUser(null); router.replace('/welcome'); } finally { setLeaving(false); } }
  return <View style={[styles.page, { backgroundColor: colors.background }]}><AppHeader />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.banner, { backgroundColor: colors.primarySoft }]}><CrossPatternBackground /><View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: colors.primary, opacity: 0.2, right: 30, top: -70 }} /><Ionicons name="medical-outline" size={90} color={colors.primaryDark} style={{ position: 'absolute', right: 10, top: 25, opacity: 0.25 }} /></View>
      <View style={styles.identity}><View style={[styles.avatar, { backgroundColor: colors.surfaceMuted, borderColor: colors.background }]}>
        {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <Ionicons name="person" size={46} color={colors.primaryDark} />}
      </View><AppText variant="h2">{user?.nome || 'Meu perfil'}</AppText><AppText variant="label" color={colors.textSecondary}>{user?.email}</AppText></View>
      <View style={styles.menu}>
        <ProfileMenuItem icon="person" title="Editar meu perfil" subtitle="Faça alterações na sua conta" onPress={() => router.push('/meus-dados')} />
        <ProfileMenuItem icon="settings" title="Configurações" onPress={() => router.push('/configuracoes')} />
        <ProfileMenuItem icon="log-out-outline" title="Sair da conta" onPress={() => setConfirm(true)} />
        <AppText variant="h3" style={styles.more}>Mais</AppText>
        <ProfileMenuItem icon="help-circle-outline" title="Ajuda & suporte" onPress={() => setInfo('Use a busca para encontrar medicamentos e consulte as farmácias cadastradas. Em Configurações, você pode ajustar o texto, o contraste e o modo escuro.')} />
        <ProfileMenuItem icon="heart-outline" title="Sobre o aplicativo" onPress={() => setInfo('A Intermedi ajuda você a consultar medicamentos e encontrar farmácias. Confira a disponibilidade e as informações de cada unidade antes de se deslocar.')} />
      </View>
    </ScrollView>
    <Modal visible={confirm || !!info} transparent animationType="fade" onRequestClose={() => { if (!leaving) { setConfirm(false); setInfo(''); } }}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}><View style={[styles.modal, { backgroundColor: colors.surface }]}>
        <Ionicons name={confirm ? 'log-out-outline' : 'information-circle-outline'} size={44} color={confirm ? colors.danger : colors.primaryDark} />
        <AppText variant="h3" style={styles.center}>{confirm ? 'Você tem certeza que deseja sair?' : 'Intermedi'}</AppText>
        <AppText style={styles.center}>{confirm ? 'Ao sair, sua sessão será encerrada neste dispositivo.' : info}</AppText>
        {confirm ? <><Button title="Sair" loading={leaving} onPress={logout} style={{ backgroundColor: colors.danger }} /><Button title="Cancelar" variant="outline" disabled={leaving} onPress={() => setConfirm(false)} /></> : <Button title="Fechar" onPress={() => setInfo('')} />}
      </View></View>
    </Modal></View>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { paddingBottom: 32 }, banner: { height: 130, overflow: 'hidden', borderBottomRightRadius: 80 }, identity: { paddingHorizontal: 24, gap: 4, marginTop: -48 }, avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 5, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, photo: { width: '100%', height: '100%' }, menu: { padding: 24, gap: 12 }, more: { marginTop: 12 }, overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, modal: { width: '100%', maxWidth: 380, borderRadius: 28, padding: 24, gap: 16, alignItems: 'center' }, center: { textAlign: 'center' } });
