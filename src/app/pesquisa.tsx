import { useUser } from '@/context/user-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { listarFarmacias, enderecoFarmacia, type Farmacia } from '@/services/farmacias';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/button';
import { buscarMedicamentosPorFoto } from '@/services/busca-foto';

import { MedicineCard } from '@/components/medicine/medicine-card';
import { AppText } from '@/components/ui/app-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/surface';
import { useTheme } from '@/context/theme-context';
import type { Medicine } from '@/constants/mock-data';
import { listarMedicamentos } from '@/services/medicamentos';
import { FontFamily, NoOutline, Spacing } from '@/constants/theme';

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Destaca em negrito o trecho que combina com a busca.
function Highlight({ text, term }: { text: string; term: string }) {
  const index = term ? normalize(text).indexOf(term) : -1;
  if (index < 0) return <AppText variant="bodyBold">{text}</AppText>;
  return <AppText>
    {text.slice(0, index)}<AppText variant="bodyBold">{text.slice(index, index + term.length)}</AppText>{text.slice(index + term.length)}
  </AppText>;
}

export default function BuscarMedicamentosScreen() {
  const router = useRouter();
  const { filtro, origem, busca: buscaInicial } = useLocalSearchParams<{ filtro?: string; origem?: string; busca?: string }>();
  const { user, loading: loadingUser } = useUser();
  const { colors, textScale } = useTheme();
  const [busca, setBusca] = useState(buscaInicial ?? '');
  const [filter, setFilter] = useState<'all' | 'medicines' | 'pharmacies'>(filtro === 'pharmacies' ? 'pharmacies' : filtro === 'medicines' ? 'medicines' : 'all');
  const [recent, setRecent] = useState<string[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const historyQueue = useRef(Promise.resolve());
  const [pharmacies, setPharmacies] = useState<Farmacia[]>([]);
  const [pharmacyError, setPharmacyError] = useState('');
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('intermedi:recent-searches').then(value => {
      if (!active || !value) return;
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) setRecent(parsed.filter((item): item is string => typeof item === 'string').slice(0, 5));
    }).catch(() => {}).finally(() => { if (active) setHistoryReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!historyReady) return;
    historyQueue.current = historyQueue.current.then(() => AsyncStorage.setItem('intermedi:recent-searches', JSON.stringify(recent))).catch(() => {});
  }, [recent, historyReady]);
  const remember = (value: string) => {
    const text = value.trim();
    if (text && historyReady) setRecent(items => [text, ...items.filter(item => item.toLowerCase() !== text.toLowerCase())].slice(0, 5));
  };
  const changeSearch = (text: string) => { setBusca(text); setResultadosFoto(null); setErroFoto(''); };

  const [lendoFoto, setLendoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState('');
  const [resultadosFoto, setResultadosFoto] = useState<Medicine[] | null>(null);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tentativa, setTentativa] = useState(0);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLoading(true);
    setError('');
    setPharmacyError('');
    listarFarmacias().then(data => { if (ativo) setPharmacies(data); }).catch(() => { if (ativo) setPharmacyError('Não foi possível carregar as farmácias.'); });
    listarMedicamentos().then((dados) => {
      if (ativo) setMedicines(dados);
    }).catch((erro: unknown) => {
      if (ativo) setError(erro instanceof Error ? erro.message : 'Erro ao carregar medicamentos.');
    }).finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [tentativa]));

  const termo = normalize(busca.trim());
  const filteredPharmacies = pharmacies.filter(item => normalize(item.nomeFarmacia + ' ' + enderecoFarmacia(item)).includes(termo));
  const medicamentosFiltrados = resultadosFoto ?? medicines.filter(
    (medicine) =>
      [medicine.name, medicine.dosage, medicine.category].some(
        (value) => normalize(value).includes(termo),
      ),
  );

  async function buscarPorFoto(origem: 'camera' | 'galeria' = 'camera') {
    if (lendoFoto) return;

    setLendoFoto(true);
    setErroFoto('');

    try {
      if (origem === 'camera') {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) {
          setErroFoto('Permita o acesso à câmera para fotografar a embalagem.');
          return;
        }
      }

      const opcoes: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'], quality: 1, allowsEditing: true,
      };
      const captura = origem === 'camera'
        ? await ImagePicker.launchCameraAsync({ ...opcoes, cameraType: ImagePicker.CameraType.back })
        : await ImagePicker.launchImageLibraryAsync(opcoes);

      if (captura.canceled || !captura.assets[0]) return;

      const resultado = await buscarMedicamentosPorFoto(captura.assets[0]);

      setResultadosFoto(resultado.medicamentos);
      setBusca('');
    } catch (erro) {
      setErroFoto(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível pesquisar pela foto.',
      );
    } finally {
      setLendoFoto(false);
    }
  }

  if (loadingUser) return <ActivityIndicator color={colors.primary} />;
  if (!user?.token) return <Redirect href="/login" />;

  const goBack = () => router.canGoBack() ? router.back() : router.replace(origem === 'farmacias' ? '/farmacias' : origem === 'remedios' ? '/buscar-medicamentos' : '/(tabs)');
  const filters = [{ id: 'all', label: 'Todos' }, { id: 'medicines', label: 'Remédios' }, { id: 'pharmacies', label: 'Farmácias' }] as const;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScreenHeader back onBack={goBack}
        inline={<View style={[styles.input, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.primaryDark} />
          <TextInput autoFocus value={busca} onChangeText={changeSearch} placeholder="Buscar remédio ou farmácia" placeholderTextColor={colors.textMuted}
            returnKeyType="search" onSubmitEditing={() => remember(busca)} accessibilityLabel="Buscar remédio ou farmácia" autoCapitalize="none"
            style={[styles.textInput, { color: colors.text, fontSize: 15 * textScale }]} />
          {busca ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => changeSearch('')} style={styles.inputIcon}><Ionicons name="close" size={20} color={colors.primaryDark} /></Pressable>
            : <>
              <Pressable accessibilityRole="button" accessibilityLabel="Escolher foto da galeria" disabled={lendoFoto} onPress={() => buscarPorFoto('galeria')} style={styles.inputIcon}><Ionicons name="image-outline" size={20} color={colors.primaryDark} /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Fotografar medicamento" disabled={lendoFoto} onPress={() => buscarPorFoto('camera')} style={styles.inputIcon}>
                {lendoFoto ? <ActivityIndicator color={colors.primaryDark} /> : <Ionicons name="camera-outline" size={21} color={colors.primaryDark} />}
              </Pressable>
            </>}
        </View>}>
        <View style={styles.filters}>{filters.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: filter === item.id }} onPress={() => setFilter(item.id)}
          style={[styles.filter, { backgroundColor: filter === item.id ? colors.surface : 'rgba(255,255,255,0.16)' }]}>
          <AppText variant="label" style={styles.semibold} color={filter === item.id ? colors.primaryDark : '#FFFFFF'}>{item.label}</AppText>
        </Pressable>)}</View>
      </ScreenHeader>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {lendoFoto && <AppText accessibilityLiveRegion="polite" variant="label">Lendo embalagem…</AppText>}
        {!!erroFoto && <AppText variant="label" color={colors.danger}>{erroFoto}</AppText>}

        {resultadosFoto === null ? <>
          {!termo && recent.length > 0 && <View>
            <View style={styles.sectionTitle}>
              <AppText variant="h3">Buscas recentes</AppText>
              <Pressable accessibilityRole="button" onPress={() => setRecent([])} hitSlop={8}><AppText variant="link">Limpar</AppText></Pressable>
            </View>
            {recent.map(item => <View key={item} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Pressable accessibilityRole="button" accessibilityLabel={'Buscar ' + item} style={styles.rowContent} onPress={() => changeSearch(item)}>
                <Ionicons name="time-outline" size={22} color={colors.textSecondary} /><AppText style={styles.resultText}>{item}</AppText>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={'Remover busca ' + item} onPress={() => setRecent(items => items.filter(value => value !== item))} style={styles.remove}><Ionicons name="close" size={20} color={colors.textSecondary} /></Pressable>
            </View>)}
          </View>}
          <View>
            <View style={styles.sectionTitle}><AppText variant="h3">{termo ? 'Resultados' : 'Sugestões'}</AppText></View>
            {loading && filter !== 'pharmacies' && <ActivityIndicator color={colors.primaryDark} />}
            {!!error && filter !== 'pharmacies' && <AppText color={colors.danger}>{error}</AppText>}
            {!!pharmacyError && filter !== 'medicines' && <AppText color={colors.danger}>{pharmacyError}</AppText>}
            {(!!error || !!pharmacyError) && <Button title="Tentar novamente" compact variant="ghost" onPress={() => setTentativa(value => value + 1)} />}
            {filter !== 'pharmacies' && (termo ? medicamentosFiltrados : medicamentosFiltrados.slice(0, 5)).map(item => <Pressable key={'medicine-' + item.id} accessibilityRole="button" accessibilityLabel={'Ver ' + item.name + ' ' + item.dosage}
              style={[styles.row, styles.rowContent, { borderBottomColor: colors.border }]} onPress={() => { remember(busca || item.name); router.push({ pathname: '/medicamento/[id]', params: { id: item.id } }); }}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <AppText style={styles.resultText} numberOfLines={1}><Highlight text={item.name} term={termo} />{item.dosage ? <AppText color={colors.textSecondary}> {item.dosage}</AppText> : null}</AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>)}
            {filter !== 'medicines' && (termo ? filteredPharmacies : filteredPharmacies.slice(0, 3)).map(item => <Pressable key={'pharmacy-' + item.idFarmacia} accessibilityRole="button" accessibilityLabel={'Ver farmácia ' + item.nomeFarmacia}
              style={[styles.row, styles.rowContent, { borderBottomColor: colors.border }]} onPress={() => { remember(busca || item.nomeFarmacia); router.push({ pathname: '/farmacia/[id]', params: { id: String(item.idFarmacia) } }); }}>
              <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
              <View style={styles.resultText}><AppText numberOfLines={1}><Highlight text={item.nomeFarmacia} term={termo} /></AppText><AppText variant="caption" numberOfLines={1}>{enderecoFarmacia(item)}</AppText></View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>)}
            {!loading && !error && !pharmacyError && <AppText variant="caption" style={styles.endMessage}>{(filter === 'pharmacies' || !medicamentosFiltrados.length) && (filter === 'medicines' || !filteredPharmacies.length) ? 'Nenhum resultado encontrado.' : termo ? 'Não há mais resultados.' : 'Digite para encontrar mais opções.'}</AppText>}
          </View>
        </> : <View style={styles.list}>
          <Button title="Voltar à busca normal" variant="outline" onPress={() => { setResultadosFoto(null); setErroFoto(''); setBusca(''); }} />
          {medicamentosFiltrados.map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: medicine.id } })} />)}
          {medicamentosFiltrados.length === 0 && <EmptyState icon="help-outline" title="Nenhum medicamento encontrado" text="Tente buscar pelo nome, dosagem ou categoria." />}
        </View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  input: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, paddingLeft: 14, paddingRight: 4, minHeight: 50 },
  textInput: { flex: 1, minWidth: 0, fontFamily: FontFamily.regular, paddingVertical: 10, ...NoOutline },
  inputIcon: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8 },
  filter: { paddingHorizontal: 18, minHeight: 40, borderRadius: 20, justifyContent: 'center' },
  semibold: { fontFamily: FontFamily.semibold },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, minHeight: 54 },
  rowContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 54 },
  resultText: { flex: 1, minWidth: 0 },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  endMessage: { textAlign: 'center', marginVertical: Spacing.xl },
  scrollContent: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: Spacing.xxxl, gap: 22 },
  list: { gap: Spacing.lg },
});
