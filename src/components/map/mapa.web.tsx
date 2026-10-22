import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import type { Rota } from '@/services/caminhada';
import type { Localizacao } from '@/services/navegacao';
import type { FarmaciaMapa } from '@/services/farmacias';
import { ICONE_FARMACIA, ICONE_USUARIO } from './marcadores-mapa';
import { PREDIOS_3D, urlEstiloMapa, type EstiloMapa } from './estilos-mapa';

type MapaProps = {
  onSelectFarmacia?: (id: string) => void;
  enquadrarFarmacias?: boolean;
  centralizarUsuario?: boolean;
  localizacao?: Localizacao;
  geometria?: Rota['geometria'];
  farmacias?: FarmaciaMapa[];
  expandido?: boolean;
  claro?: boolean;
  seguindo?: boolean;
  espacoInferior?: number;
  modelo?: EstiloMapa;
};

const FARMACIAS_VAZIAS: FarmaciaMapa[] = [];

export default function Mapa(props: MapaProps) {
  return <MapaConteudo key={props.modelo ?? 'automatico'} {...props} />;
}

function MapaConteudo({
  localizacao, geometria, farmacias = FARMACIAS_VAZIAS,
  expandido = false, claro = false, espacoInferior = 60, modelo,
  seguindo = false, enquadrarFarmacias = false,
  onSelectFarmacia, centralizarUsuario = false,
}: MapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<maplibregl.Map | null>(null);
  const mapaProntoRef = useRef(false);
  const marcadorUsuarioRef = useRef<maplibregl.Marker | null>(null);
  const selecionarRef = useRef(onSelectFarmacia);
  const indicePercorridoRef = useRef(0);
  const ajustarCameraRef = useRef<() => void>(() => {});
  const inclinacao = modelo === '3d' ? 60 : 0;
  const permiteSelecionar = Boolean(onSelectFarmacia);

  useEffect(() => { selecionarRef.current = onSelectFarmacia; }, [onSelectFarmacia]);

  // A instância só muda com o estilo. GPS e estoque atualizam o mapa existente.
  useEffect(() => {
    if (!containerRef.current) return;
    // Metro não serve o worker ESM via import.meta.url.
    const workerUrl = URL.createObjectURL(new Blob(
      ['import "https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl-worker.mjs";'],
      { type: 'text/javascript' },
    ));
    maplibregl.setWorkerUrl(workerUrl);
    const mapa = new maplibregl.Map({
      container: containerRef.current,
      style: modelo ? urlEstiloMapa(modelo) : claro
        ? 'https://tiles.openfreemap.org/styles/liberty'
        : 'https://tiles.openfreemap.org/styles/dark',
      center: [-46.417, -23.5459], zoom: 13, pitch: inclinacao,
      attributionControl: { compact: true },
    });
    mapaRef.current = mapa;
    mapaProntoRef.current = false;
    // O evento load ocorre uma vez. Fontes e tiles podem carregar de novo sem outro load.
    mapa.once('load', () => { mapaProntoRef.current = true; });
    mapa.addControl(new maplibregl.NavigationControl());
    if (modelo === '3d') {
      mapa.once('load', () => {
        const camadas = mapa.getStyle().layers;
        camadas.filter(camada => camada.type === 'fill-extrusion').forEach(camada => {
          mapa.setLayoutProperty(camada.id, 'visibility', 'none');
        });
        mapa.addSource('intermedi-predios', { type: 'vector', url: 'https://tiles.openfreemap.org/planet' });
        mapa.addLayer(PREDIOS_3D, camadas.find(camada => camada.type === 'symbol')?.id);
      });
    }
    const observador = new ResizeObserver(() => {
      mapa.resize();
      ajustarCameraRef.current();
    });
    observador.observe(containerRef.current);
    return () => {
      observador.disconnect();
      marcadorUsuarioRef.current?.remove();
      marcadorUsuarioRef.current = null;
      mapaRef.current = null;
      mapaProntoRef.current = false;
      mapa.remove();
      URL.revokeObjectURL(workerUrl);
    };
  }, [claro, modelo, inclinacao]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const marcadores = farmacias.map(farmacia => {
      const conteudo = document.createElement('div');
      conteudo.style.color = '#222';
      const titulo = document.createElement('strong');
      titulo.textContent = farmacia.name;
      const endereco = document.createElement('p');
      endereco.textContent = farmacia.address;
      endereco.style.margin = '8px 0 0';
      conteudo.append(titulo, endereco);
      const icone = document.createElement('div');
      icone.innerHTML = ICONE_FARMACIA;
      icone.style.cssText = 'width:44px;height:48px;cursor:pointer;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28))';
      icone.setAttribute('aria-label', `Ver ${farmacia.name}`);
      icone.setAttribute('role', 'button');
      icone.tabIndex = 0;
      const selecionar = () => selecionarRef.current?.(farmacia.id);
      icone.addEventListener('click', selecionar);
      icone.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selecionar();
        }
      });
      return new maplibregl.Marker({ element: icone, anchor: 'bottom' })
        .setLngLat([farmacia.longitude, farmacia.latitude])
        .setPopup(permiteSelecionar ? null : new maplibregl.Popup({ offset: 25 }).setDOMContent(conteudo))
        .addTo(mapa);
    });
    return () => marcadores.forEach(marcador => marcador.remove());
  }, [farmacias, permiteSelecionar, claro, modelo]);

  // Reinicia o progresso apenas quando a geometria da rota muda.
  useEffect(() => { indicePercorridoRef.current = 0; }, [geometria]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    function desenhar() {
      if (!mapa) return;
      let pontos = geometria?.coordinates ?? [];
      if (seguindo && localizacao && pontos.length) {
        let menorDistancia = Infinity;
        let indiceMaisProximo = indicePercorridoRef.current;
        const fim = Math.min(pontos.length, indicePercorridoRef.current + 120);
        for (let i = indicePercorridoRef.current; i < fim; i++) {
          const distancia = (pontos[i][0] - localizacao.longitude) ** 2
            + (pontos[i][1] - localizacao.latitude) ** 2;
          if (distancia < menorDistancia) { menorDistancia = distancia; indiceMaisProximo = i; }
        }
        indicePercorridoRef.current = indiceMaisProximo;
        pontos = pontos.slice(indiceMaisProximo);
      }
      const dados: FeatureCollection = {
        type: 'FeatureCollection',
        features: pontos.length >= 2 ? [{
          type: 'Feature', properties: {},
          geometry: { type: 'LineString', coordinates: pontos },
        }] : [],
      };
      const fonte = mapa.getSource('rota') as maplibregl.GeoJSONSource | undefined;
      if (fonte) fonte.setData(dados);
      else if (geometria) {
        mapa.addSource('rota', { type: 'geojson', data: dados });
        mapa.addLayer({
          id: 'linha-rota', type: 'line', source: 'rota',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#10b968', 'line-width': 5 },
        });
      }
    }
    if (mapaProntoRef.current) desenhar();
    else mapa.once('load', desenhar);
    return () => { mapa.off('load', desenhar); };
  }, [geometria, localizacao, seguindo, claro, modelo]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (!localizacao) {
      marcadorUsuarioRef.current?.remove();
      marcadorUsuarioRef.current = null;
      return;
    }
    const ponto: [number, number] = [localizacao.longitude, localizacao.latitude];
    if (!marcadorUsuarioRef.current) {
      const icone = document.createElement('div');
      icone.innerHTML = ICONE_USUARIO;
      icone.style.cssText = 'width:52px;height:52px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28))';
      marcadorUsuarioRef.current = new maplibregl.Marker({ element: icone, anchor: 'center' })
        .setLngLat(ponto)
        .setPopup(new maplibregl.Popup({ offset: 25 }).setText('Sua localização'))
        .addTo(mapa);
    } else marcadorUsuarioRef.current.setLngLat(ponto);
  }, [localizacao, claro, modelo]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    function ajustarCamera() {
      if (!mapa) return;
      // Mantém uma área visível mesmo em janelas menores que o painel da rota.
      const altura = mapa.getContainer().clientHeight;
      const largura = mapa.getContainer().clientWidth;
      const padding = {
        top: Math.min(90, altura * 0.2),
        bottom: Math.min(seguindo ? Math.max(200, espacoInferior) : espacoInferior, altura * 0.5),
        left: Math.min(40, largura * 0.1), right: Math.min(40, largura * 0.1),
      };
      if (localizacao && (seguindo || centralizarUsuario)) {
        mapa.easeTo({
          center: [localizacao.longitude, localizacao.latitude],
          zoom: seguindo ? 18 : 13.5,
          pitch: seguindo ? 75 : 0,
          bearing: seguindo ? localizacao.direcao ?? 0 : 0,
          padding: seguindo ? padding : 0,
          duration: seguindo ? 450 : 500, essential: true,
        });
        return;
      }
      const limites = new maplibregl.LngLatBounds();
      if (geometria?.coordinates.length) {
        geometria.coordinates.forEach(ponto => limites.extend([ponto[0], ponto[1]]));
      } else if (localizacao || enquadrarFarmacias) {
        if (localizacao) limites.extend([localizacao.longitude, localizacao.latitude]);
        farmacias.forEach(farmacia => limites.extend([farmacia.longitude, farmacia.latitude]));
      }
      if (!limites.isEmpty()) mapa.fitBounds(limites, {
        pitch: inclinacao, bearing: 0, padding, maxZoom: 15, duration: 500,
      });
    }
    ajustarCameraRef.current = ajustarCamera;
    if (mapaProntoRef.current) ajustarCamera();
    else mapa.once('load', ajustarCamera);
    return () => {
      mapa.off('load', ajustarCamera);
      ajustarCameraRef.current = () => {};
    };
  }, [localizacao, geometria, seguindo, centralizarUsuario, enquadrarFarmacias,
    farmacias, espacoInferior, claro, modelo, inclinacao]);

  return <div ref={containerRef} style={{
    width: '100%', height: expandido ? '100%' : 350,
    flex: expandido ? 1 : undefined, borderRadius: expandido ? 0 : 16, overflow: 'hidden',
  }} />;
}
