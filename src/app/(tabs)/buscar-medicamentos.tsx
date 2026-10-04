import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/button';
import { buscarMedicamentosPorFoto } from '@/services/busca-foto';

import { AppHeader } from '@/components/home/app-header';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { ScreenHero } from '@/components/ui/screen-hero';
import { AppText } from '@/components/ui/app-text';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/context/theme-context';
import type { Medicine } from '@/constants/mock-data';
import { listarMedicamentos } from '@/services/medicamentos';
import { Colors, Spacing } from '@/constants/theme';

export default function BuscarMedicamentosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [busca, setBusca] = useState('');

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
    listarMedicamentos().then((dados) => {
      if (ativo) setMedicines(dados);
    }).catch((erro: unknown) => {
      if (ativo) setError(erro instanceof Error ? erro.message : 'Erro ao carregar medicamentos.');
    }).finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [tentativa]));

  const termo = busca.trim().toLowerCase();

  const medicamentosFiltrados = resultadosFoto ?? medicines.filter(
    (medicine) =>
      [medicine.name, medicine.dosage, medicine.category].some(
        (value) => value.toLowerCase().includes(termo),
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

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <ScreenHero title="Remédios" subtitle="Encontre o medicamento que você precisa." icon="medkit-outline">

          <TextField
            icon="search-outline"
            trailingIcon="camera-outline"
            trailingLabel="Fotografar medicamento"
            trailingLoading={lendoFoto}
            onTrailingPress={() => buscarPorFoto('camera')}
            placeholder="Buscar por nome ou categoria"
            value={busca}
            onChangeText={(texto) => {
              setBusca(texto);
              setResultadosFoto(null);
              setErroFoto('');
            }}
          />

        </ScreenHero>

        <AppText variant="h3">Medicamentos disponíveis</AppText>

<Button title="Escolher foto da galeria" variant="ghost" onPress={() => buscarPorFoto('galeria')} disabled={lendoFoto} />
        {lendoFoto && <AppText accessibilityLiveRegion="polite" variant="label">Lendo embalagem…</AppText>}
        <AppText variant="label">
          Após escolher a foto, recorte a região do nome do medicamento antes de confirmar.
        </AppText>

        {!!erroFoto && (
          <AppText variant="label" color={Colors.danger}>
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

        <View style={styles.list}>
          {carregandoLista && <ActivityIndicator accessibilityLabel="Carregando medicamentos" color={Colors.primary} />}
          {!!erroLista && <View style={styles.emptyState}>
            <AppText variant="body">{erroLista}</AppText>
            <Pressable accessibilityRole="button" onPress={() => setTentativa((v) => v + 1)}>
              <AppText variant="bodyBold" color={Colors.primary}>Tentar novamente</AppText>
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
                <AppText variant="h3" color={Colors.primary}>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
