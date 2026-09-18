export function calcularDistancia(posicao, coordenada) {
    
  const [longitude, latitude] = coordenada;

  const emRadianos = (graus) => (graus * Math.PI) / 180;

  const diferencaLatitude = emRadianos(
    latitude - posicao.latitude,
  );

  const diferencaLongitude = emRadianos(
    longitude - posicao.longitude,
  );

  const latitudeAtual = emRadianos(posicao.latitude);
  const latitudeDestino = emRadianos(latitude);

  const a =
    Math.sin(diferencaLatitude / 2) ** 2 +
    Math.cos(latitudeAtual) *
      Math.cos(latitudeDestino) *
      Math.sin(diferencaLongitude / 2) ** 2;

  const valor = Math.max(0, Math.min(1, a));

  return (
    6371000 *
    2 *
    Math.atan2(Math.sqrt(valor), Math.sqrt(1 - valor))
  );
}