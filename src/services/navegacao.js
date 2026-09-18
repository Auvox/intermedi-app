import * as Location from 'expo-location';

export async function acompanharLocalizacao(aoAtualizar) {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permita a localização para iniciar a navegação.');
  }

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 5,
      timeInterval: 1000,
    },
    (posicao) => {
      aoAtualizar({
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      });
    },
  );
}