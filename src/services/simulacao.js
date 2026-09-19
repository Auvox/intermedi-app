function calcularDirecao(pontoAtual, proximoPonto) {
  const [longitudeAtual, latitudeAtual] = pontoAtual;
  const [proximaLongitude, proximaLatitude] = proximoPonto;

  const emRadianos = (graus) => (graus * Math.PI) / 180;
  const emGraus = (radianos) => (radianos * 180) / Math.PI;

  const latitude1 = emRadianos(latitudeAtual);
  const latitude2 = emRadianos(proximaLatitude);

  const diferencaLongitude = emRadianos(
    proximaLongitude - longitudeAtual,
  );

  const y =
    Math.sin(diferencaLongitude) * Math.cos(latitude2);

  const x =
    Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) *
      Math.cos(latitude2) *
      Math.cos(diferencaLongitude);

  return (emGraus(Math.atan2(y, x)) + 360) % 360;
}

export function simularPercurso(geometria, aoAtualizar, aoConcluir) {
  const pontos = geometria.coordinates;

  if (!pontos.length) {
    throw new Error('A rota não tem pontos para simular.');
  }

  let indice = 0;

  function atualizar() {
  const pontoAtual = pontos[indice];
  const proximoPonto = pontos[indice + 1] ?? pontoAtual;

  const [longitude, latitude] = pontoAtual;

  aoAtualizar({
    latitude,
    longitude,
    direcao: calcularDirecao(pontoAtual, proximoPonto),
  });

  indice += 1;
}

  // Mostra o ponto inicial imediatamente.
  atualizar();

  const intervalo = setInterval(() => {
    if (indice >= pontos.length) {
      clearInterval(intervalo);
      aoConcluir();
      return;
    }

    atualizar();
  }, 500);

  return {
    remove() {
      clearInterval(intervalo);
    },
  };
}