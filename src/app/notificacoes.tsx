import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { FontFamily } from '@/constants/theme';
import { dayKey, minutesOf, useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';

type Item = { id: string; icon: keyof typeof Ionicons.glyphMap; title: string; text: string; when: string; href?: Href };
const TIPS: Item[] = [
  { id: 'tip-boas-vindas', icon: 'information-circle-outline', title: 'Bem-vindo à Intermedi', text: 'Busque remédios e veja quais farmácias têm estoque perto de você.', when: 'Dica', href: '/buscar-medicamentos' },
  { id: 'tip-acessibilidade', icon: 'accessibility-outline', title: 'Uma leitura do seu jeito', text: 'Em Perfil, ative o modo acessibilidade ou ajuste o tamanho do texto.', when: 'Dica', href: '/acessibilidade' },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const care = useCare();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  // Lembretes das doses de hoje cujo horário já passou e ainda não foram confirmadas.
  const today: Item[] = care.todayDoses.filter(d => !d.status && minutesOf(d.time) <= nowMinutes).map(d => ({
    id: `dose-${dayKey()}-${d.id}`, icon: 'alarm-outline', title: `Hora de tomar ${d.name}`, text: `Dose das ${d.time}. Toque para confirmar que tomou.`, when: `Hoje, ${d.time}`, href: '/comprimidos',
  }));
  const groups = [{ title: 'Hoje', items: today }, { title: 'Dicas do app', items: TIPS }].filter(g => g.items.length);
  const all = groups.flatMap(g => g.items);
  const unread = all.filter(i => !care.readNotifications.includes(i.id));
  const markAll = () => care.update(s => ({ readNotifications: Array.from(new Set([...s.readNotifications, ...all.map(i => i.id)])) }));
  const open = (item: Item) => { care.update(s => ({ readNotifications: Array.from(new Set([...s.readNotifications, item.id])) })); if (item.href) router.push(item.href); };

  return <View style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <ScreenHeader back title="Notificações" subtitle={unread.length ? `${unread.length} ${unread.length === 1 ? 'não lida' : 'não lidas'}` : 'Tudo lido'}
        right={unread.length ? <Pressable accessibilityRole="button" onPress={markAll} style={styles.markAll}><AppText variant="caption" color="#FFFFFF" style={styles.markText}>Marcar todas{'\n'}como lidas</AppText></Pressable> : undefined} />
      <View style={styles.content}>
        {groups.map(group => <View key={group.title} style={styles.group}>
          <AppText variant="h3">{group.title}</AppText>
          {group.items.map(item => {
            const isUnread = !care.readNotifications.includes(item.id);
            return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}. ${isUnread ? 'Não lida.' : ''}`} onPress={() => open(item)}
              style={[styles.card, isUnread ? { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary, borderLeftWidth: 6 } : { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder }]}>
              <View style={[styles.icon, { backgroundColor: isUnread ? colors.primarySoft : colors.surface }]}><Ionicons name={item.icon} size={26} color={colors.primaryDark} /></View>
              <View style={styles.copy}>
                <AppText variant="bodyBold" color={colors.primaryDarker}>{item.title}</AppText>
                <AppText variant="label">{item.text}</AppText>
                <AppText variant="caption" style={styles.when}>{item.when}</AppText>
              </View>
              {isUnread && <View accessibilityLabel="Não lida" style={[styles.dot, { backgroundColor: colors.danger }]} />}
            </Pressable>;
          })}
        </View>)}
      </View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1 }, content: { padding: 18, gap: 22 }, group: { gap: 12 },
  markAll: { minHeight: 44, justifyContent: 'center' }, markText: { textAlign: 'right', fontFamily: FontFamily.medium },
  card: { flexDirection: 'row', gap: 14, padding: 16, borderWidth: 1.5, borderRadius: 22, alignItems: 'flex-start' },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 }, when: { marginTop: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 6 },
});
