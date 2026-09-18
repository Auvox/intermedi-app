export function simularPercurso(geometria, aoAtualizar, aoConcluir) {
  const pontos = geometria.coordinates;

  if (!pontos.length) {
    throw new Error('A rota não tem pontos para simular.');
  }

  let indice = 0;

  function atualizar() {
    const [longitude, latitude] = pontos[indice];

    aoAtualizar({ latitude, longitude });
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