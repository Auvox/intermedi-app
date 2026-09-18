import { pharmacies } from '@/constants/mock-data';

// Escape '<' para nomes e endereços nunca encerrarem a tag script.
const dadosFarmacias = JSON.stringify(pharmacies).replace(/</g, '\\u003c');

export const mapaHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.css">
  <style>
    html, body, #mapa { margin: 0; width: 100%; height: 100%; background: #eef2f6; }
    #aviso { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      padding: 24px; font: 14px sans-serif; color: #222; background: #eef2f6; z-index: 2; text-align: center; }
    .maplibregl-popup-content { color: #222; }
  </style>
</head>
<body>
  <div id="mapa"></div>
  <div id="aviso">Carregando mapa...</div>
  <script>
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

    window.addEventListener('unhandledrejection', function(evento) {
      enviarDiagnostico('erro-pagina: ' + String(evento.reason && evento.reason.message || evento.reason));
    });
    function mostrarErro() {
      var aviso = document.getElementById('aviso');
      aviso.textContent = 'Não foi possível carregar o mapa. Verifique sua conexão e reabra esta tela.';
      aviso.style.display = 'flex';
    }
    var espera = setTimeout(mostrarErro, 25000);
  </script>
  <!-- A versão 5 inclui o worker no bundle, evitando imports de módulos na WebView. -->
  <script src="https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.js" onerror="mostrarErro(); enviarDiagnostico('erro-pagina: Falha ao carregar MapLibre.');"></script>
  <script>
    try {
      var farmacias = ${dadosFarmacias};
      var todasFarmacias = farmacias;
      var marcadoresFarmacias = [];
      var marcadorUsuario = null;
      var mapa = new maplibregl.Map({
        container: 'mapa', center: [-46.417, -23.5459], zoom: 13,
        style: 'https://tiles.openfreemap.org/styles/liberty'
      });
      mapa.addControl(new maplibregl.NavigationControl());
     window.atualizarFarmacias = function(lista) {
  marcadoresFarmacias.forEach(function(marcador) {
    marcador.remove();
  });

  farmacias = lista || todasFarmacias;

  marcadoresFarmacias = farmacias.map(function(farmacia) {
    var conteudo = document.createElement('div');

    var titulo = document.createElement('strong');
    titulo.textContent = farmacia.name;

    var endereco = document.createElement('p');
    endereco.textContent = farmacia.address;

    conteudo.append(titulo, endereco);

    return new maplibregl.Marker({ color: '#2563eb' })
      .setLngLat([farmacia.longitude, farmacia.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 25 })
          .setDOMContent(conteudo)
      )
      .addTo(mapa);
  });
};

window.atualizarFarmacias(null);
      window.atualizarLocalizacao = function(localizacao) {
        var limites = new maplibregl.LngLatBounds();
        farmacias.forEach(function(f) { limites.extend([f.longitude, f.latitude]); });
        if (localizacao) {
          var ponto = [localizacao.longitude, localizacao.latitude];
          if (!marcadorUsuario) {
            marcadorUsuario = new maplibregl.Marker({ color: '#10b968' })
              .setLngLat(ponto)
              .setPopup(new maplibregl.Popup({ offset: 25 }).setText('Sua localização')).addTo(mapa);
          }
          marcadorUsuario.setLngLat(ponto); limites.extend(ponto);
        } else if (marcadorUsuario) {
          marcadorUsuario.remove(); marcadorUsuario = null;
        }
        if (!limites.isEmpty()) mapa.fitBounds(limites, { padding: 60, maxZoom: 15, duration: 0 });
      };
      window.desenharRota = function(geometria) {
        try {
        window.ReactNativeWebView.postMessage(
  'desenharRota recebeu: ' +
  (geometria ? geometria.coordinates.length + ' pontos' : 'sem rota')
);
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

  var fonte = mapa.getSource('rota');

  if (fonte) {
    fonte.setData(dados);
  } else if (geometria) {
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
      mapa.on('sourcedata', function(evento) {
        if (evento.sourceId === 'rota' && evento.isSourceLoaded) {
          window.ReactNativeWebView.postMessage(
            'Fonte da rota carregada. Linha existe: ' +
            Boolean(mapa.getLayer('linha-rota'))
          );
        }
      });
      window.atualizarLocalizacao(null);
      mapa.on('idle', function() {
        clearTimeout(espera); document.getElementById('aviso').style.display = 'none';
      });
      mapa.on('error', function(evento) {
        clearTimeout(espera);
        mostrarErro();
        window.ReactNativeWebView.postMessage('erro-mapa: ' + evento.error.message);
      });
      mapa.on('load', function() { window.ReactNativeWebView.postMessage('pronto'); });
    } catch (erro) {
      clearTimeout(espera);
      mostrarErro();
      enviarDiagnostico('erro-pagina: ' + erro.message);
    }
  </script>
</body>
</html>`;
