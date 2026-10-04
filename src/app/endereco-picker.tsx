import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { AddressListItem } from '@/components/address/address-list-item';
import { AppHeader } from '@/components/home/app-header';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { formatUserAddress } from '@/utils/user-address';
import { Colors, Spacing } from '@/constants/theme';
import Mapa from '@/components/map/mapa';
import { listarFarmacias, prepararFarmaciasParaMapa, type FarmaciaMapa, } from '@/services/farmacias';

export default function EnderecoPickerScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const registeredAddress = formatUserAddress(user, true);
  const router = useRouter();
  const [farmaciasDoMapa, setFarmaciasDoMapa] = useState<FarmaciaMapa[]>([]);
  const [avisoFarmacias, setAvisoFarmacias] = useState('Carregando farmácias...');
  const [selectedId, setSelectedId] = useState('casa');
  const [search, setSearch] = useState('');
  const [coordenadas, setCoordenadas] = useState('');
  const [localizacao, setLocalizacao] = useState<{
    latitude: number;
    longitude: number;
  }>();

  function selectAndReturn(id: string) {
    setSelectedId(id);
    router.back();
  }
  async function usarLocalizacaoAtual() {
    try {
      setCoordenadas('Buscando sua localização...');

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setCoordenadas('Permita o acesso à localização nas configurações do dispositivo ou navegador.');
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocalizacao({
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      });

      setCoordenadas('Localização encontrada.');
    } catch {
      setCoordenadas(
        'Não foi possível obter sua localização. Verifique a permissão de localização.',
      );
    }
  }
  useEffect(() => {
    let ativo = true;

    async function carregarFarmacias() {
      try {
        const farmacias = await listarFarmacias();
        const lista = prepararFarmaciasParaMapa(farmacias);

        if (!ativo) return;

        setFarmaciasDoMapa(lista);
        setAvisoFarmacias(
          lista.length === 0
            ? 'Nenhuma farmácia com localização disponível.'
            : '',
        );
      } catch {
        if (ativo) {
          setAvisoFarmacias('Não foi possível carregar as farmácias.');
        }
      }
    }

    carregarFarmacias();

    return () => {
      ativo = false;
    };
  }, []);
  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <BackButton tone="dark" />

        <View style={styles.illustration}>
          <Ionicons name="location" size={100} color={Colors.primary} />
        </View>

        <AppText variant="h3" style={styles.title}>
          Onde você quer encontrar o seu remédio?
        </AppText>

        <Mapa
          localizacao={localizacao}
          farmacias={farmaciasDoMapa}
        />

        {avisoFarmacias ? (
          <AppText variant="label" color={colors.textSecondary}>
            {avisoFarmacias}
          </AppText>
        ) : null}

        <TextField
          placeholder="Buscar endereço e número"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.list}>
          <AddressListItem
            icon="locate-outline"
            label="Localização atual"
            address="Use a localização do dispositivo"
            onPress={usarLocalizacaoAtual}
          />

          {coordenadas ? (
            <AppText variant="label" color={colors.textSecondary}>
              {coordenadas}
            </AppText>
          ) : null}

          {registeredAddress ? (
            <AddressListItem
              icon="home-outline"
              label="Endereço cadastrado"
              address={registeredAddress}
              selected={selectedId === 'casa'}
              onPress={() => selectAndReturn('casa')}
            />
          ) : <AppText color={colors.textSecondary}>Você ainda não tem um endereço cadastrado.</AppText>}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  illustration: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  list: {
    gap: Spacing.md,
  },
});
