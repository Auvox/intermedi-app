import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { pharmacies } from '@/constants/mock-data';

type MapaProps = {
  localizacao?: {
    latitude: number;
    longitude: number;
  };
};

export default function Mapa({ localizacao }: MapaProps) {
  const mapaRef = useRef<MapView>(null);
  const [pronto, setPronto] = useState(false);
  const [layoutPronto, setLayoutPronto] = useState(false);

  const enquadrar = useCallback(() => {
    if (!pronto || !layoutPronto) return;

    const coordenadas = pharmacies.map(({ latitude, longitude }) => ({
      latitude,
      longitude,
    }));
    if (localizacao) coordenadas.push(localizacao);
    if (!coordenadas.length) return;

    mapaRef.current?.fitToCoordinates(coordenadas, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: false,
    });
  }, [pronto, layoutPronto, localizacao]);

  useEffect(() => {
    enquadrar();
  }, [enquadrar]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapaRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: -23.5459,
          longitude: -46.417,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onMapReady={() => setPronto(true)}
        onLayout={() => setLayoutPronto(true)}>
        {pharmacies.map((farmacia) => (
          <Marker
            key={farmacia.id}
            coordinate={{ latitude: farmacia.latitude, longitude: farmacia.longitude }}
            title={farmacia.name}
            description={farmacia.address}
            pinColor="#2563eb"
          />
        ))}
        {localizacao && (
          <Marker coordinate={localizacao} title="Sua localização" pinColor="#10b968" />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
