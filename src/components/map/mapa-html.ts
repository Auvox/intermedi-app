import { pharmacies } from '@/constants/mock-data';

// Escape '<' para nomes e endereços nunca encerrarem a tag script.
const dadosFarmacias = JSON.stringify(pharmacies).replace(/</g, '\\u003c');

export const mapaHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl.css">
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
    function mostrarErro() {
      var aviso = document.getElementById('aviso');
      aviso.textContent = 'Não foi possível carregar o mapa. Verifique sua conexão e reabra esta tela.';
      aviso.style.display = 'flex';
    }
    var espera = setTimeout(mostrarErro, 25000);
  </script>
  <script type="module">
    try {
      const maplibregl = await import('https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl.mjs');
      var farmacias = ${dadosFarmacias};
      var marcadorUsuario = null;
      var mapa = new maplibregl.Map({
        container: 'mapa', center: [-46.417, -23.5459], zoom: 13,
        style: {
          version: 8,
          sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
        }
      });
      mapa.addControl(new maplibregl.NavigationControl());
      farmacias.forEach(function(farmacia) {
        var conteudo = document.createElement('div');
        var titulo = document.createElement('strong'); titulo.textContent = farmacia.name;
        var endereco = document.createElement('p'); endereco.textContent = farmacia.address;
        conteudo.append(titulo, endereco);
        new maplibregl.Marker({ color: '#2563eb' })
          .setLngLat([farmacia.longitude, farmacia.latitude])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setDOMContent(conteudo)).addTo(mapa);
      });
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
      window.atualizarLocalizacao(null);
      mapa.on('idle', function() {
        clearTimeout(espera); document.getElementById('aviso').style.display = 'none';
      });
      mapa.on('error', function() { clearTimeout(espera); mostrarErro(); });
      mapa.on('load', function() { window.ReactNativeWebView.postMessage('pronto'); });
    } catch (erro) { clearTimeout(espera); mostrarErro(); }
  </script>
</body>
</html>`;
