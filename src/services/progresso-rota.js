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
export function calcularDistanciaRestante(
  geometria,
  posicaoAtual,
) {
  const pontos = geometria.coordinates;

  if (!pontos.length) {
    return 0;
  }

  let indiceMaisProximo = 0;
  let menorDistancia = Infinity;

  
  pontos.forEach((ponto, indice) => {
    const distancia = calcularDistancia(
      posicaoAtual,
      ponto,
    );

    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      indiceMaisProximo = indice;
    }
  });

 
  let distanciaRestante = menorDistancia;

 
  for (
    let indice = indiceMaisProximo;
    indice < pontos.length - 1;
    indice += 1
  ) {
    const pontoAtual = pontos[indice];
    const proximoPonto = pontos[indice + 1];

    distanciaRestante += calcularDistancia(
      {
        latitude: pontoAtual[1],
        longitude: pontoAtual[0],
      },
      proximoPonto,
    );
  }

  return distanciaRestante;
}