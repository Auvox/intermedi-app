import { useUser } from '@/context/user-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '@/components/ui/back-button';
import { listarFarmacias, enderecoFarmacia, type Farmacia } from '@/services/farmacias';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/button';
import { buscarMedicamentosPorFoto } from '@/services/busca-foto';

import { AppHeader } from '@/components/home/app-header';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { AppText } from '@/components/ui/app-text';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/context/theme-context';
import type { Medicine } from '@/constants/mock-data';
import { listarMedicamentos } from '@/services/medicamentos';
import { Spacing } from '@/constants/theme';

export default function BuscarMedicamentosScreen() {
  const router = useRouter();
  const { filtro, origem } = useLocalSearchParams<{ filtro?: string; origem?: string }>();
  const { user, loading: loadingUser } = useUser();
  const { colors } = useTheme();
  const [busca, setBusca] = useState('');
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

  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const termo = normalize(busca.trim());
  const filteredPharmacies = pharmacies.filter(item => normalize(item.nomeFarmacia + ' ' + enderecoFarmacia(item)).includes(termo));

  const medicamentosFiltrados = resultadosFoto ?? medicines.filter(
    (medicine) =>
      [medicine.name, medicine.dosage, medicine.category].some(
        (value) => normalize(value).includes(termo),
      ),
  );

  const carregandoLista = resultadosFoto === null && loading;
  const erroLista = resultadosFoto === null ? error : '';

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

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />

      <View style={styles.searchArea}>
        <View style={styles.searchRow}>
          <BackButton tone="dark" onPress={() => router.replace(origem === 'farmacias' ? '/farmacias' : origem === 'home' ? '/(tabs)' : '/buscar-medicamentos')} />
          <View style={styles.searchInput}><TextField icon="search-outline" placeholder="Digite o que procura" value={busca} onChangeText={changeSearch} returnKeyType="search" onSubmitEditing={() => remember(busca)}
            trailingIcon={busca ? 'close' : 'camera-outline'} trailingLabel={busca ? 'Limpar busca' : 'Fotografar medicamento'} trailingLoading={lendoFoto}
            onTrailingPress={() => busca ? changeSearch('') : buscarPorFoto('camera')} onGalleryPress={busca ? undefined : () => buscarPorFoto('galeria')} /></View>
        </View>
        <View style={styles.filters}>{([{ id: 'all', label: 'Todos' }, { id: 'medicines', label: 'Medicamentos' }, { id: 'pharmacies', label: 'Farmácias' }] as const).map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: filter === item.id }} onPress={() => setFilter(item.id)} style={[styles.filter, { backgroundColor: filter === item.id ? colors.primary : colors.primarySoft }]}>
          <AppText variant="bodyBold" style={styles.filterText} color={filter === item.id ? colors.textOnPrimary : colors.primaryDark}>{item.label}</AppText>
        </Pressable>)}</View>
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {resultadosFoto === null && <>
          {!termo && recent.length > 0 && <View style={styles.list}>
            <View style={styles.sectionTitle}><Ionicons name="time-outline" size={25} color={colors.primaryDark} /><AppText variant="h3" color={colors.primaryDark}>Buscas recentes</AppText></View>
            {recent.map(item => <View key={item} style={styles.suggestionRow}>
              <Pressable accessibilityRole="button" accessibilityLabel={'Buscar ' + item} style={styles.suggestionContent} onPress={() => changeSearch(item)}><Ionicons name="search-outline" size={18} color={colors.primaryDark} /><AppText color={colors.textSecondary} style={styles.resultText}>{item}</AppText></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={'Remover busca ' + item} onPress={() => setRecent(items => items.filter(value => value !== item))} style={styles.remove}><Ionicons name="close" size={18} color={colors.primaryDark} /></Pressable>
            </View>)}
          </View>}
          <View style={styles.sectionTitle}><Ionicons name="bulb-outline" size={25} color={colors.primaryDark} /><AppText variant="h3" color={colors.primaryDark}>{termo ? 'Resultados da busca' : 'Sugestões'}</AppText></View>
          {loading && filter !== 'pharmacies' && <ActivityIndicator color={colors.primaryDark} />}
          {!!error && filter !== 'pharmacies' && <AppText color={colors.danger}>{error}</AppText>}
          {!!pharmacyError && filter !== 'medicines' && <AppText color={colors.danger}>{pharmacyError}</AppText>}
          {(!!error || !!pharmacyError) && <Button title="Tentar novamente" compact variant="ghost" onPress={() => setTentativa(value => value + 1)} />}
          {filter !== 'pharmacies' && (termo ? medicamentosFiltrados : medicamentosFiltrados.slice(0, 5)).map(item => <Pressable key={'medicine-' + item.id} accessibilityRole="button" accessibilityLabel={'Ver ' + item.name + ' ' + item.dosage} style={styles.suggestionRow} onPress={() => { remember(busca || item.name); router.push({ pathname: '/medicamento/[id]', params: { id: item.id } }); }}>
            <Ionicons name="search-outline" size={18} color={colors.primaryDark} /><AppText style={styles.resultText}><AppText variant="bodyBold">{item.name}</AppText>{' '}<AppText color={colors.textSecondary}>{item.dosage}</AppText></AppText><Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
          </Pressable>)}
          {filter !== 'medicines' && (termo ? filteredPharmacies : filteredPharmacies.slice(0, 3)).map(item => <Pressable key={'pharmacy-' + item.idFarmacia} accessibilityRole="button" accessibilityLabel={'Ver farmácia ' + item.nomeFarmacia} style={styles.suggestionRow} onPress={() => { remember(busca || item.nomeFarmacia); router.push({ pathname: '/farmacia/[id]', params: { id: String(item.idFarmacia) } }); }}>
            <Ionicons name="business-outline" size={18} color={colors.primaryDark} /><View style={styles.resultText}><AppText variant="bodyBold">{item.nomeFarmacia}</AppText><AppText variant="caption">Farmácia</AppText></View><Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
          </Pressable>)}
          {!loading && !error && !pharmacyError && <AppText variant="caption" style={styles.endMessage}>{(filter === 'pharmacies' || !medicamentosFiltrados.length) && (filter === 'medicines' || !filteredPharmacies.length) ? 'Nenhum resultado encontrado.' : termo ? 'Não há mais resultados.' : 'Digite para encontrar mais opções.'}</AppText>}
        </>}
        {lendoFoto && <AppText accessibilityLiveRegion="polite" variant="label">Lendo embalagem…</AppText>}


        {!!erroFoto && (
          <AppText variant="label" color={colors.danger}>
            {erroFoto}
          </AppText>
        )}

        {resultadosFoto !== null && (
          <Button
            title="Voltar à busca normal"
            variant="outline"
            onPress={() => {
              setResultadosFoto(null);
              setErroFoto('');
              setBusca('');
            }}
          />
        )}

        {resultadosFoto !== null && <View style={styles.list}>
          {carregandoLista && <ActivityIndicator accessibilityLabel="Carregando medicamentos" color={colors.primaryDark} />}
          {!!erroLista && <View style={styles.emptyState}>
            <AppText variant="body">{erroLista}</AppText>
            <Pressable accessibilityRole="button" onPress={() => setTentativa((v) => v + 1)}>
              <AppText variant="bodyBold" color={colors.primaryDark}>Tentar novamente</AppText>
            </Pressable>
          </View>}
          {!carregandoLista && !erroLista && medicamentosFiltrados.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onPress={() =>
                router.push({
                  pathname: '/medicamento/[id]',
                  params: { id: medicine.id },
                })
              }
            />
          ))}

          {!carregandoLista && !erroLista && medicamentosFiltrados.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
                <AppText variant="h3" color={colors.primaryDark}>
                  ?
                </AppText>
              </View>
              <AppText variant="bodyBold" style={styles.emptyTitle}>
                Nenhum medicamento encontrado
              </AppText>
              <AppText variant="label" style={styles.emptyText}>
                Tente buscar pelo nome, dosagem ou categoria.
              </AppText>
            </View>
          )}
        </View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchArea: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchInput: { flex: 1, minWidth: 0 },
  filters: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  filter: { flexGrow: 1, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 24, minHeight: 44, alignItems: 'center' },
  filterText: { fontSize: 14 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: 44 },
  suggestionContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: 44 },
  resultText: { flex: 1, minWidth: 0 },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  endMessage: { textAlign: 'center', marginVertical: Spacing.xl },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  list: {
    gap: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
