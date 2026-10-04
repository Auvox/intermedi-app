import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { SectionHeader } from '@/components/ui/section-header';
import { useTheme } from '@/context/theme-context';
const messages = [
  { icon: 'information-circle-outline' as const, title: 'Bem-vindo à Intermedi', text: 'Busque medicamentos e consulte as informações das farmácias cadastradas.' },
  { icon: 'accessibility-outline' as const, title: 'Uma leitura do seu jeito', text: 'Em Perfil → Configurações, ajuste o tamanho do texto, o contraste e o modo escuro.' },
];
export default function NotificationsScreen() {
const { colors } = useTheme(); const [read, setRead] = useState(false);
  return <View style={[styles.page, { backgroundColor: colors.background }]}><SectionHeader title="Notificações" />
    <ScrollView contentContainerStyle={styles.content}><AppText variant="h3">Informações do aplicativo</AppText>
      <Pressable accessibilityRole="button" disabled={read} onPress={() => setRead(true)} style={styles.action}><AppText variant="caption" color={colors.primaryDark}>{read ? 'Todas lidas' : 'Marcar como lidas'}</AppText></Pressable>
      {messages.map(m => <View key={m.title} style={[styles.card, { backgroundColor: read ? colors.primarySoft : colors.surface, borderColor: colors.border, borderLeftColor: colors.primaryDark }]}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}><Ionicons name={m.icon} size={28} color={colors.primaryDark} /></View>
        <View style={styles.copy}><AppText variant="bodyBold">{m.title}</AppText><AppText variant="label" color={colors.textSecondary}>{m.text}</AppText></View>
        {!read && <View accessibilityLabel="Não lida" style={[styles.dot, { backgroundColor: colors.primaryDark }]} />}
      </View>)}
    </ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 20, gap: 16 }, action: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' }, card: { flexDirection: 'row', gap: 12, padding: 16, borderWidth: 1, borderLeftWidth: 5, borderRadius: 22 }, icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, gap: 6 }, dot: { width: 8, height: 8, borderRadius: 4 } });
