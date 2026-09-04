import { useState } from 'react';
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
import { currentLocation, savedAddresses } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';

export default function EnderecoPickerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('casa');
  const [search, setSearch] = useState('');
  const [coordenadas, setCoordenadas] = useState('');

  function selectAndReturn(id: string) {
    setSelectedId(id);
    router.back();
  }
  async function usarLocalizacaoAtual() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    setCoordenadas('Permissão de localização não concedida.');
    return;
  }

  const localizacao = await Location.getCurrentPositionAsync({});

  setCoordenadas(
    `Latitude: ${localizacao.coords.latitude}\nLongitude: ${localizacao.coords.longitude}`,
  );
}

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

        <TextField
          placeholder="Buscar endereço e número"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.list}>
        <AddressListItem
  icon="locate-outline"
  label={currentLocation.label}
  address={currentLocation.address}
  onPress={usarLocalizacaoAtual}
/>

{coordenadas ? (
  <AppText variant="label" color={colors.textSecondary}>
    {coordenadas}
  </AppText>
) : null}
          
          {savedAddresses.map((address) => (
            <AddressListItem
              key={address.id}
              icon={address.icon}
              label={address.label}
              address={address.address}
              selected={selectedId === address.id}
              showMenu
              onPress={() => selectAndReturn(address.id)}
            />
          ))}
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
