import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { MASCOTS, MascotAvatar } from '@/components/ui/mascot';
import { HeaderDecor } from '@/components/ui/screen-header';
import { IconTile } from '@/components/ui/surface';
import { FontFamily, NoOutline, Shadow, toneColors, type Tone } from '@/constants/theme';
import { useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { useHomeLocation } from '@/hooks/use-home-location';
import { responder, type Reply } from '@/services/assistente';
import { buscarMedicamentosPorFoto } from '@/services/busca-foto';
import { medicineTitle } from '@/utils/medicine-style';

type Message = { id: number; from: 'user' | 'bot'; reply: Reply };
const CHIP_TONES: Tone[] = ['orange', 'blue', 'amber', 'purple'];

function AuvoxBadge({ dark = false }: { dark?: boolean }) {
  return <View style={[styles.badge, { backgroundColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.16)' }]}>
    <View style={styles.badgeLogo}><AppText variant="caption" color="#0E6B50" style={styles.badgeA}>A</AppText></View>
    <AppText variant="caption" color="#FFFFFF" style={styles.badgeText}>AUVOX IA</AppText>
  </View>;
}

export default function BrotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, textScale } = useTheme();
  const { user } = useUser();
  const care = useCare();
  const { position } = useHomeLocation();
  const mascot = MASCOTS[care.mascot];
  const firstName = user?.nome?.trim().split(' ')[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const nextId = useRef(1);
  const suggestions: { icon: keyof typeof Ionicons.glyphMap; tone: Tone; text: string }[] = [
    { icon: 'location-outline', tone: 'green', text: care.doses[0] ? `Tem ${care.doses[0].name} perto de mim?` : 'Onde tem dipirona perto de mim?' },
    { icon: 'bandage-outline', tone: 'orange', text: 'Preciso de receita?' },
    { icon: 'document-text-outline', tone: 'blue', text: 'Como renovo minha receita?' },
    { icon: 'time-outline', tone: 'amber', text: 'Como funcionam os lembretes?' },
  ];
  const chips = ['Preciso de receita?', 'Onde dói?', 'Como troco de mascote?', 'Como faço uma reserva?'];

  function push(from: Message['from'], reply: Reply) {
    setMessages(list => [...list, { id: nextId.current++, from, reply }]);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
  }
  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    setText('');
    push('user', { text: q });
    setThinking(true);
    try { push('bot', await responder(q, position)); }
    catch { push('bot', { text: 'Não consegui responder agora. Confira sua conexão e tente de novo.' }); }
    finally { setThinking(false); }
  }
  async function photo() {
    if (thinking) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync().catch(() => null);
    const capture = permission?.granted
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: true }).catch(() => null)
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: true }).catch(() => null);
    if (!capture || capture.canceled || !capture.assets[0]) return;
    push('user', { text: '📷 Foto de uma embalagem' });
    setThinking(true);
    try {
      const result = await buscarMedicamentosPorFoto(capture.assets[0]);
      const found = result.medicamentos.slice(0, 3);
      push('bot', found.length ? {
        text: `Na foto encontrei ${found.length === 1 ? 'este remédio' : 'estes remédios'}:`,
        actions: found.map((m, i) => ({ label: medicineTitle(m), href: { pathname: '/medicamento/[id]', params: { id: m.id } }, primary: i === 0 })),
      } : { text: 'Não reconheci nenhum remédio do catálogo nessa foto. Tente com a embalagem mais perto e bem iluminada.' });
    } catch (error) {
      push('bot', { text: error instanceof Error ? error.message : 'Não consegui ler a foto.' });
    } finally { setThinking(false); }
  }

  const input = <View style={[styles.inputBar, { backgroundColor: colors.surface }, Shadow]}>
    <Pressable accessibilityRole="button" accessibilityLabel="Enviar foto de uma embalagem" onPress={photo} style={[styles.camera, { backgroundColor: colors.blueSoft }]}>
      <Ionicons name="camera-outline" size={22} color={colors.blue} />
    </Pressable>
    <TextInput value={text} onChangeText={setText} placeholder={`Pergunte ${mascot.pronoun === 'a' ? 'à' : 'ao'} ${mascot.name}`} placeholderTextColor={colors.textMuted}
      onSubmitEditing={() => ask(text)} returnKeyType="send" accessibilityLabel={`Pergunte ${mascot.pronoun === 'a' ? 'à' : 'ao'} ${mascot.name}`}
      style={[styles.input, { color: colors.text, fontSize: 15 * textScale }]} />
    <Pressable accessibilityRole="button" accessibilityLabel="Enviar pergunta" disabled={!text.trim() || thinking} onPress={() => ask(text)} style={[styles.send, { backgroundColor: colors.primary, opacity: text.trim() ? 1 : 0.6 }]}>
      <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
    </Pressable>
  </View>;

  return <KeyboardAvoidingView style={[styles.page, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {messages.length === 0 ? <ScrollView contentContainerStyle={styles.welcome} keyboardShouldPersistTaps="handled">
      <View style={[styles.hero, { backgroundColor: colors.header, paddingTop: insets.top + 16 }]}>
        <HeaderDecor size={340} cross={false} />
        <AuvoxBadge />
        <View style={styles.avatar}><MascotAvatar id={care.mascot} size={104} background="#FFFFFF" /></View>
        <AppText variant="h2" color="#FFFFFF" style={styles.center}>Como posso ajudar{firstName ? `, ${firstName}` : ''}?</AppText>
        <AppText variant="label" color="rgba(255,255,255,0.85)" style={styles.center}>Remédios, estoque, receitas ou como usar o app.</AppText>
      </View>
      <View style={styles.suggestions}>
        <AppText variant="h3">Sugestões para você</AppText>
        <View style={styles.grid}>{suggestions.map(s => <Pressable key={s.text} accessibilityRole="button" onPress={() => ask(s.text)} style={({ pressed }) => [styles.suggestion, { backgroundColor: colors.surface }, Shadow, pressed && styles.pressed]}>
          <IconTile icon={s.icon} tone={s.tone} size={44} />
          <AppText variant="bodyBold" style={styles.suggestionText}>{s.text}</AppText>
        </Pressable>)}</View>
      </View>
    </ScrollView> : <>
      <View style={[styles.chatHeader, { backgroundColor: colors.header, paddingTop: insets.top + 12 }]}>
        <MascotAvatar id={care.mascot} size={50} background="#FFFFFF" />
        <View style={styles.flex}>
          <AppText variant="h3" color="#FFFFFF">{mascot.name}</AppText>
          <AuvoxBadge />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Nova conversa" onPress={() => setMessages([])} style={styles.newChat}><Ionicons name="create-outline" size={22} color="#FFFFFF" /></Pressable>
      </View>
      <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={styles.chat} keyboardShouldPersistTaps="handled">
        {messages.map(m => m.from === 'user'
          ? <View key={m.id} style={[styles.userBubble, { backgroundColor: colors.primary }]}><AppText color="#FFFFFF">{m.reply.text}</AppText></View>
          : <View key={m.id} style={[styles.botCard, { backgroundColor: colors.surface }, Shadow]}>
            {!!m.reply.check && <View style={[styles.check, { backgroundColor: colors.primarySoft }]}><Ionicons name="checkmark" size={14} color={colors.primaryDark} /><AppText variant="caption" color={colors.primaryDark}>{m.reply.check}</AppText></View>}
            <AppText>{m.reply.text}</AppText>
            {m.reply.stock && <View style={styles.stock}>
              {m.reply.stock.rows.map((row, i) => <View key={row.name + i} style={[styles.stockRow, { backgroundColor: colors.surfaceMuted }]}>
                <View style={[styles.rank, { backgroundColor: toneColors(colors, (['green', 'blue', 'amber'] as Tone[])[i]).bg }]}><AppText variant="bodyBold" color={toneColors(colors, (['green', 'blue', 'amber'] as Tone[])[i]).fg}>{i + 1}</AppText></View>
                <View style={styles.flex}><AppText variant="bodyBold" numberOfLines={1}>{row.name}</AppText><AppText variant="caption" numberOfLines={1}>{row.detail}</AppText></View>
                <View style={[styles.amount, { backgroundColor: row.low ? colors.warningSoft : colors.primarySoft }]}><AppText variant="caption" color={row.low ? colors.warningText : colors.primaryDark} style={styles.bold}>{row.amount}</AppText></View>
              </View>)}
              {!!m.reply.stock.tip && <View style={[styles.tip, { backgroundColor: colors.primarySoft }]}><Ionicons name="bulb-outline" size={18} color={colors.primaryDark} /><AppText variant="label" color={colors.text} style={styles.flex}><AppText variant="label" style={styles.bold}>Minha sugestão: </AppText>{m.reply.stock.tip}</AppText></View>}
            </View>}
            {!!m.reply.actions?.length && <View style={styles.actions}>{m.reply.actions.map(a => <Pressable key={a.label} accessibilityRole="button" onPress={() => router.push(a.href)}
              style={[styles.action, { backgroundColor: a.primary ? colors.primary : colors.blueSoft }]}>
              <AppText variant="label" color={a.primary ? '#FFFFFF' : colors.blue} style={styles.bold}>{a.label}</AppText>
            </Pressable>)}</View>}
          </View>)}
        {thinking && <View style={[styles.botCard, styles.thinking, { backgroundColor: colors.surface }]}><ActivityIndicator color={colors.primaryDark} /><AppText variant="label">{mascot.name} está consultando…</AppText></View>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((c, i) => { const t = toneColors(colors, CHIP_TONES[i % CHIP_TONES.length]); return <Pressable key={c} accessibilityRole="button" onPress={() => ask(c)} style={[styles.chip, { backgroundColor: t.bg }]}><AppText variant="label" color={t.fg} style={styles.bold}>{c}</AppText></Pressable>; })}
        </ScrollView>
      </ScrollView>
    </>}
    <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 12) + 78 }]}>
      {input}
      <AppText variant="caption" style={styles.center}>AUVOX IA pode errar. Para tratamento, fale com o farmacêutico.</AppText>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, flex: { flex: 1, minWidth: 0 }, center: { textAlign: 'center' }, bold: { fontFamily: FontFamily.semibold }, pressed: { opacity: 0.85 },
  welcome: { flexGrow: 1 },
  hero: { paddingHorizontal: 22, paddingBottom: 30, gap: 8, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  badgeLogo: { width: 18, height: 18, borderRadius: 5, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  badgeA: { fontFamily: FontFamily.bold, fontSize: 11, lineHeight: 14 },
  badgeText: { fontFamily: FontFamily.bold, letterSpacing: 1 },
  avatar: { alignSelf: 'center', marginTop: 8, marginBottom: 6, borderRadius: 26, ...Shadow },
  suggestions: { padding: 18, gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  suggestion: { flexBasis: '46%', flexGrow: 1, borderRadius: 22, padding: 16, gap: 14, minHeight: 130 },
  suggestionText: { fontSize: 15, lineHeight: 21 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  newChat: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  chat: { padding: 18, gap: 14 },
  userBubble: { alignSelf: 'flex-end', maxWidth: '82%', borderRadius: 22, borderBottomRightRadius: 6, paddingHorizontal: 18, paddingVertical: 12 },
  botCard: { alignSelf: 'stretch', borderRadius: 24, borderTopLeftRadius: 8, padding: 16, gap: 12 },
  thinking: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  check: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  stock: { gap: 8 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 12 },
  rank: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  amount: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  tip: { flexDirection: 'row', gap: 10, borderRadius: 16, padding: 12, alignItems: 'flex-start' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { borderRadius: 14, paddingHorizontal: 16, minHeight: 46, justifyContent: 'center' },
  chips: { gap: 8 },
  chip: { borderRadius: 18, paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' },
  bottom: { paddingHorizontal: 16, paddingTop: 8, gap: 6 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 22, padding: 8 },
  camera: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minWidth: 0, fontFamily: FontFamily.regular, paddingVertical: 10, ...NoOutline },
  send: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
