import * as Location from 'expo-location';
import { buscarRota } from './rotas';

export async function calcularCaminhada(farmacia) {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permita a localização para calcular a rota.');
  }

  const posicao = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const origem = {
    latitude: posicao.coords.latitude,
    longitude: posicao.coords.longitude,
  };

  const destino = {
    latitude: farmacia.latitude,
    longitude: farmacia.longitude,
  };

  const rota = await buscarRota(origem, destino, 'pedestrian');

return {
  ...rota,
  origem,
  destino,
};
}