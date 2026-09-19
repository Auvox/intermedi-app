import { pharmacies } from '@/constants/mock-data';

// Escape '<' para nomes e endereços nunca encerrarem a tag script.
const dadosFarmacias = JSON.stringify(pharmacies).replace(/</g, '\\u003c');

export function criarMapaHtml(temaEscuro = false) {
  // Escolhe o mapa de base de acordo com o tema atual do celular.
  const estiloMapa = temaEscuro
    ? 'https://tiles.openfreemap.org/styles/dark'
    : 'https://tiles.openfreemap.org/styles/liberty';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.css">
  <style>

  /* Faz o mapa preencher todo o espaco oferecido pelo WebView. */

    html, body, #mapa { margin: 0; width: 100%; height: 100%; background: #eef2f6; }


    /* Tela exibida enquanto o mapa carrega ou quando ocorre uma falha. */

    #aviso { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      padding: 24px; font: 14px sans-serif; color: #222; background: #eef2f6; z-index: 2; text-align: center; }


    /* Mantem o texto dos popups legivel inclusive no mapa escuro. */

    .maplibregl-popup-content { color: #222; }

    /* No celular, o zoom e feito com gestos; esconde os botoes sobre o painel. */
    .maplibregl-ctrl-top-right { display: none; }


    /* Circulo que representa a localizacao atual da pessoa. */

    .marcador-usuario {
  width: 42px;
  height: 42px;
  border: 3px solid white;
  border-radius: 50%;
  background: rgba(16, 185, 104, 0.22);
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.3),
    0 0 0 10px rgba(16, 185, 104, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Seta verde colocada dentro do marcador da pessoa. */

.seta-usuario {
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 24px solid #10b968;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
  transform: translateY(-2px);
}

/* Circulo verde usado para representar uma farmacia ou UBS. */
.marcador-farmacia {
  width: 38px;
  height: 38px;
  border: 3px solid white;
  border-radius: 50%;
  background: #10b968;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.3);
  position: relative;
}

/* As duas barras abaixo formam a cruz branca do marcador. */
.marcador-farmacia::before,
.marcador-farmacia::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 2px;
  background: white;
  transform: translate(-50%, -50%);
}

.marcador-farmacia::before {
  width: 20px;
  height: 6px;
}

.marcador-farmacia::after {
  width: 6px;
  height: 20px;
}
  </style>
</head>
<body>
  <div id="mapa"></div>
  <div id="aviso">Carregando mapa...</div>
  <script>

  // Envia mensagens deste HTML para o console do aplicativo React Native.

  function enviarDiagnostico(mensagem) {
      window.ReactNativeWebView.postMessage(mensagem);
    }

    // Captura falhas diretamente no worker, que nem sempre chegam ao evento do mapa.

    var WorkerOriginal = window.Worker;
    if (WorkerOriginal) {
      window.Worker = class extends WorkerOriginal {
        constructor(url, opcoes) {
          super(url, opcoes);
          this.addEventListener('error', function(evento) {
            enviarDiagnostico('erro-worker: ' + (evento.message || 'Falha ao carregar o worker do mapa.'));
          });
          this.addEventListener('messageerror', function() {
            enviarDiagnostico('erro-worker: Falha ao receber dados do worker.');
          });
          this.addEventListener('message', function() {
            enviarDiagnostico('Worker do mapa respondeu.');
          }, { once: true });
        }
      };
    }

    // Captura erros assincronos que nao foram tratados pelo codigo do mapa.

    window.addEventListener('unhandledrejection', function(evento) {
      enviarDiagnostico('erro-pagina: ' + String(evento.reason && evento.reason.message || evento.reason));
    });

    // Troca o aviso de carregamento por uma mensagem amigavel de erro.

    function mostrarErro() {
      var aviso = document.getElementById('aviso');
      aviso.textContent = 'Não foi possível carregar o mapa. Verifique sua conexão e reabra esta tela.';
      aviso.style.display = 'flex';
      }

      // Mostra o erro se o mapa nao terminar de carregar em 25 segundos.

      var espera = setTimeout(mostrarErro, 25000);
  </script>
  <!-- A versão 5 inclui o worker no bundle, evitando imports de módulos na WebView. -->
  <script src="https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.js" onerror="mostrarErro(); enviarDiagnostico('erro-pagina: Falha ao carregar MapLibre.');"></script>
  <script>
    try {

      // Dados iniciais das farmacias incluidos no proprio HTML.
      var farmacias = ${dadosFarmacias};
      var todasFarmacias = farmacias;

      // Guarda os marcadores para atualiza-los ou remove-los depois.
      var marcadoresFarmacias = [];
      var marcadorUsuario = null;

      // Guarda a linha original e até qual ponto a pessoa já avançou.
      var geometriaRotaCompleta = null;
      var indiceRotaPercorrido = 0;

      // Cria o mapa usando o tema escolhido pela funcao criarMapaHtml.
      var mapa = new maplibregl.Map({
        container: 'mapa', center: [-46.417, -23.5459], zoom: 13,
        style: '${estiloMapa}'
      });

      // Paleta propria do Intermedi para os modos claro e escuro.
      var coresMapa = ${temaEscuro}
        ? {
            fundo: '#0d1412',
            agua: '#164b70',
            cursoAgua: '#267bb3',
            parque: '#183c2a',
            floresta: '#123522',
            residencial: '#101916',
            predio: '#17201d',
            ruaMenor: '#35413d',
            contornoPrincipal: '#62706b',
            ruaPrincipal: '#46534f',
            contornoRodovia: '#718078',
            rodovia: '#53625c'
          }
        : {
            fundo: '#eef5f1',
            agua: '#a9d8ef',
            cursoAgua: '#66b7df',
            parque: '#cfe9d6',
            floresta: '#b8ddc3',
            residencial: '#edf2ef',
            predio: '#dfe8e3',
            ruaMenor: '#ffffff',
            contornoPrincipal: '#c6d1cc',
            ruaPrincipal: '#f7faf8',
            contornoRodovia: '#8fb5a2',
            rodovia: '#e7f3ed'
          };

      // Altera uma camada apenas quando ela existir no estilo carregado.
      function pintarCamada(id, propriedade, valor) {
        if (mapa.getLayer(id)) {
          mapa.setPaintProperty(id, propriedade, valor);
        }
      }

      // Aplica as cores do Intermedi sobre o estilo do OpenFreeMap.
      function personalizarMapa() {
        pintarCamada('background', 'background-color', coresMapa.fundo);

        // Lagos, rios e mar.
        pintarCamada('water', 'fill-color', coresMapa.agua);
        pintarCamada('waterway', 'line-color', coresMapa.cursoAgua);

        // Parques e areas com arvores.
        pintarCamada('landuse_park', 'fill-color', coresMapa.parque);
        pintarCamada('landcover_wood', 'fill-pattern', null);
        pintarCamada('landcover_wood', 'fill-color', coresMapa.floresta);
        pintarCamada('landcover_wood', 'fill-opacity', 0.85);

        // Bairros residenciais e construcoes.
        pintarCamada('landuse_residential', 'fill-color', coresMapa.residencial);
        pintarCamada('building', 'fill-color', coresMapa.predio);

        // Ruas locais ficam discretas.
        pintarCamada('highway_path', 'line-color', coresMapa.ruaMenor);
        pintarCamada('highway_minor', 'line-color', coresMapa.ruaMenor);

        // Vias principais recebem contorno e contraste maiores.
        pintarCamada('highway_major_casing', 'line-color', coresMapa.contornoPrincipal);
        pintarCamada('highway_major_inner', 'line-color', coresMapa.ruaPrincipal);

        // Rodovias recebem o maior destaque da hierarquia.
        pintarCamada('highway_motorway_casing', 'line-color', coresMapa.contornoRodovia);
        pintarCamada('highway_motorway_inner', 'line-color', coresMapa.rodovia);
      }

      // Adiciona os controles de zoom, rotacao e inclinacao.
      mapa.addControl(new maplibregl.NavigationControl());


      // Recria os marcadores quando a tela envia uma nova lista de farmacias.
     window.atualizarFarmacias = function(lista) {


     // Remove do mapa os marcadores criados anteriormente.
    marcadoresFarmacias.forEach(function(marcador) {
    marcador.remove();
  });


  // Usa a lista recebida ou todas as farmacias quando ela for nula.
  farmacias = lista || todasFarmacias;

  marcadoresFarmacias = farmacias.map(function(farmacia) {

    // Monta com seguranca o nome e o endereco exibidos no popup.
    var conteudo = document.createElement('div');

    var titulo = document.createElement('strong');
    titulo.textContent = farmacia.name;

    var endereco = document.createElement('p');
    endereco.textContent = farmacia.address;

    conteudo.append(titulo, endereco);

    // Cria o icone verde com a cruz definido no CSS.
    var elementoMarcador = document.createElement('div');
    elementoMarcador.className = 'marcador-farmacia';

    return new maplibregl.Marker({
  element: elementoMarcador,
  anchor: 'center'
})
      .setLngLat([farmacia.longitude, farmacia.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 25 })
          .setDOMContent(conteudo)
      )
      .addTo(mapa);
  });
};

// Desenha os marcadores iniciais assim que o mapa e criado.
window.atualizarFarmacias(null);

      // Remove visualmente a parte da rota que já foi percorrida.
function atualizarTrechoRestante(localizacao) {
  var fonteRota = mapa.getSource('rota');

  if (
    !fonteRota ||
    !geometriaRotaCompleta ||
    !localizacao
  ) {
    return;
  }

  var pontos = geometriaRotaCompleta.coordinates;

  var menorDistancia = Infinity;
  var indiceMaisProximo = indiceRotaPercorrido;

  // Procura somente nos próximos pontos para não voltar na rota.
  var fimDaBusca = Math.min(
    pontos.length,
    indiceRotaPercorrido + 120
  );

  for (
    var indice = indiceRotaPercorrido;
    indice < fimDaBusca;
    indice += 1
  ) {
    var ponto = pontos[indice];

    var diferencaLongitude =
      ponto[0] - localizacao.longitude;

    var diferencaLatitude =
      ponto[1] - localizacao.latitude;

    var distancia =
      diferencaLongitude * diferencaLongitude +
      diferencaLatitude * diferencaLatitude;

    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      indiceMaisProximo = indice;
    }
  }

  indiceRotaPercorrido = Math.max(
    indiceRotaPercorrido,
    indiceMaisProximo
  );

  var pontosRestantes = pontos.slice(
    indiceRotaPercorrido
  );

  var dadosRestantes = {
    type: 'FeatureCollection',
    features:
      pontosRestantes.length >= 2
        ? [{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: pontosRestantes
            }
          }]
        : []
  };

  fonteRota.setData(dadosRestantes);
}

     // Atualiza o marcador da pessoa e decide como posicionar a camera.
     window.atualizarLocalizacao = function(localizacao, seguindo) {
  // Estes limites servem para enquadrar a pessoa e as farmacias.
  var limites = new maplibregl.LngLatBounds();

  farmacias.forEach(function(farmacia) {
    limites.extend([
      farmacia.longitude,
      farmacia.latitude
    ]);
  });

  if (localizacao) {
    var ponto = [
      localizacao.longitude,
      localizacao.latitude
    ];

    // O elemento e criado apenas uma vez; depois somente muda de posicao.
    if (!marcadorUsuario) {

      var elementoUsuario = document.createElement('div');
elementoUsuario.className = 'marcador-usuario';

var setaUsuario = document.createElement('div');
setaUsuario.className = 'seta-usuario';

elementoUsuario.appendChild(setaUsuario);

     marcadorUsuario = new maplibregl.Marker({
  element: elementoUsuario,
  anchor: 'center'
})
        .setLngLat(ponto)
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setText('Sua localização')
        )
        .addTo(mapa);
    }

    // Move o marcador existente para a coordenada mais recente.
    marcadorUsuario.setLngLat(ponto);
    limites.extend(ponto);

    // Durante a navegacao, aproxima, inclina e gira a camera como no Waze.
    if (seguindo) {
      atualizarTrechoRestante(localizacao);

      mapa.easeTo({
        center: ponto,
        zoom: 18,
        pitch: 75,
        bearing: localizacao.direcao ?? 0,
        padding: {
          top: 80,
          bottom: 200,
          left: 40,
          right: 40
        },
        duration: 450,
        essential: true
      });

      // Evita que o fitBounds abaixo afaste a camera durante a navegacao.
      return;
    }
  } else if (marcadorUsuario) {
    marcadorUsuario.remove();
    marcadorUsuario = null;
  }

  // Fora da navegacao, mostra a pessoa e as farmacias na mesma visao.
  if (!limites.isEmpty()) {
    mapa.fitBounds(limites, {
      padding: 60,
      maxZoom: 15,
      duration: 0
    });
  }
};
      // Cria ou atualiza a linha verde recebida da resposta do Valhalla.
      window.desenharRota = function(geometria) {
        try {
        geometriaRotaCompleta = geometria;
        indiceRotaPercorrido = 0;

        window.ReactNativeWebView.postMessage(
  'desenharRota recebeu: ' +
  (geometria ? geometria.coordinates.length + ' pontos' : 'sem rota')
);
  // Converte a geometria em uma colecao GeoJSON aceita pelo MapLibre.
  var dados = {
    type: 'FeatureCollection',
    features: geometria
      ? [{
          type: 'Feature',
          properties: {},
          geometry: geometria
        }]
      : []
  };

  // Procura uma fonte existente para nao criar a mesma fonte duas vezes.
  var fonte = mapa.getSource('rota');

  // Se a fonte ja existe, troca somente os dados da linha.
  if (fonte) {
    fonte.setData(dados);
  } else if (geometria) {
    // Na primeira rota, cria a fonte e a camada visual da linha.
    mapa.addSource('rota', {
      type: 'geojson',
      data: dados
    });

    mapa.addLayer({
      id: 'linha-rota',
      type: 'line',
      source: 'rota',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#10b968',
        'line-width': 5
      }
    });
  }

  // Enquadra a rota completa depois que ela e desenhada.
  if (geometria && geometria.coordinates.length) {
    var limites = new maplibregl.LngLatBounds();

    geometria.coordinates.forEach(function(ponto) {
      limites.extend(ponto);
    });

    mapa.fitBounds(limites, {
      padding: 40,
      duration: 500
    });
  }
        } catch (erro) {
          window.ReactNativeWebView.postMessage('erro-rota: ' + erro.message);
        }
      };
      // Informa ao aplicativo quando os dados da linha terminaram de carregar.
      mapa.on('sourcedata', function(evento) {
        if (evento.sourceId === 'rota' && evento.isSourceLoaded) {
          window.ReactNativeWebView.postMessage(
            'Fonte da rota carregada. Linha existe: ' +
            Boolean(mapa.getLayer('linha-rota'))
          );
        }
      });
      // Define o enquadramento inicial antes de receber a localizacao real.
      window.atualizarLocalizacao(null);

      // Remove a tela de carregamento quando o mapa fica ocioso e pronto.
      mapa.on('idle', function() {
        clearTimeout(espera); document.getElementById('aviso').style.display = 'none';
      });
      // Exibe e registra erros gerados pelo MapLibre.
      mapa.on('error', function(evento) {
        clearTimeout(espera);
        mostrarErro();
        window.ReactNativeWebView.postMessage('erro-mapa: ' + evento.error.message);
      });
      // Personaliza as camadas antes de liberar dados enviados pelo mapa.tsx.
      mapa.on('load', function() {
        personalizarMapa();
        window.ReactNativeWebView.postMessage('pronto');
      });
    } catch (erro) {
      clearTimeout(espera);
      mostrarErro();
      enviarDiagnostico('erro-pagina: ' + erro.message);
    }
  </script>
</body>
</html>`;
}
