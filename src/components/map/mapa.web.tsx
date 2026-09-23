import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';

import { pharmacies } from '@/constants/mock-data';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Rota } from '@/services/caminhada';
import type { FeatureCollection } from 'geojson';
import type { Pharmacy } from '@/constants/mock-data';
import { PREDIOS_3D, urlEstiloMapa, type EstiloMapa } from './estilos-mapa';

type MapaProps = {
  localizacao?: {
    latitude: number;
    longitude: number;
  };
   geometria?: Rota['geometria'];
   farmacias?: Pharmacy[];
   expandido?: boolean;
   claro?: boolean;
   seguindo?: boolean;
   espacoInferior?: number;
   modelo?: EstiloMapa;
};

export default function Mapa(props: MapaProps) {
  return <MapaConteudo key={props.modelo ?? 'automatico'} {...props} />;
}

function MapaConteudo({localizacao ,geometria, farmacias = pharmacies, expandido = false, claro = false, espacoInferior = 60, modelo, }: MapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<maplibregl.Map | null>(null);
  const marcadorUsuarioRef = useRef<maplibregl.Marker | null>(null);
  const inclinacao = modelo ? (modelo === '3d' ? 60 : 0) : 55;

  useEffect(() => {
    if (!containerRef.current) return;

    // O Metro não serve o módulo do worker por meio de import.meta.url.
    // Carrega o worker da mesma versão do MapLibre pelo endereço completo.
    const workerUrl = URL.createObjectURL(
      new Blob(
        ['import "https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl-worker.mjs";'],
        { type: 'text/javascript' },
      ),
    );
    maplibregl.setWorkerUrl(workerUrl);

    const mapa = new maplibregl.Map({
      container: containerRef.current,
      style: modelo ? urlEstiloMapa(modelo) : claro ? 'https://tiles.openfreemap.org/styles/liberty' : 'https://tiles.openfreemap.org/styles/dark',
      center: [-46.417, -23.5459],
      zoom: 13,
      pitch: inclinacao,
      
    });

    mapaRef.current = mapa;
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

    const limites = new maplibregl.LngLatBounds();

    const marcadoresFarmacias = farmacias.map((farmacia) => {
      const coordenadas: [number, number] = [
        farmacia.longitude,
        farmacia.latitude,
      ];

   
      const conteudo = document.createElement('div');
      conteudo.style.color = '#222';

      const titulo = document.createElement('strong');
      titulo.textContent = farmacia.name;

      const endereco = document.createElement('p');
      endereco.textContent = farmacia.address;
      endereco.style.margin = '8px 0 0';

      conteudo.append(titulo, endereco);

      const popup = new maplibregl.Popup({ offset: 25 })
        .setDOMContent(conteudo);

      const marcador = new maplibregl.Marker({ color: '#2563eb' })
        .setLngLat(coordenadas)
        .setPopup(popup)
        .addTo(mapa);

      marcador.getElement().setAttribute(
        'aria-label',
        `Ver ${farmacia.name}`,
      );

      limites.extend(coordenadas);

      return marcador;
    });

    
    if (!limites.isEmpty()) {
      mapa.fitBounds(limites, {
        pitch: inclinacao,
        padding: 60,
        maxZoom: 15,
        duration: 0,
      });
    }

    return () => {
      marcadoresFarmacias.forEach((marcador) => marcador.remove());
      marcadorUsuarioRef.current?.remove();
      marcadorUsuarioRef.current = null;
      mapaRef.current = null;
      mapa.remove();
      URL.revokeObjectURL(workerUrl);
    };
  }, [farmacias, claro, modelo, inclinacao]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !localizacao) return;

    const coordenadas: [number, number] = [
      localizacao.longitude,
      localizacao.latitude,
    ];

    if (!marcadorUsuarioRef.current) {
      marcadorUsuarioRef.current = new maplibregl.Marker({
        color: '#10b968',
      })
        .setLngLat(coordenadas)
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setText(
            'Sua localização',
          ),
        )
        .addTo(mapa);
    } else {
      marcadorUsuarioRef.current.setLngLat(coordenadas);
    }

 
    const limites = new maplibregl.LngLatBounds(
      coordenadas,
      coordenadas,
    );

    farmacias.forEach((farmacia) => {
      limites.extend([farmacia.longitude, farmacia.latitude]);
    });

    mapa.fitBounds(limites, {
      pitch: inclinacao,
      padding: 60,
      maxZoom: 15,
      duration: 0,
    });
  }, [localizacao, farmacias, claro, modelo, inclinacao]);

  useEffect(() => {
  const mapa = mapaRef.current;
  if (!mapa) return;

  function desenhar() {
    if (!mapa) return;

    const dados: FeatureCollection = {
      type: 'FeatureCollection',
      features: geometria
        ? [{
            type: 'Feature',
            properties: {},
            geometry: geometria,
          }]
        : [],
    };

    const fonte = mapa.getSource('rota') as
      | maplibregl.GeoJSONSource
      | undefined;

    if (fonte) {
      fonte.setData(dados);
    } else if (geometria) {
      mapa.addSource('rota', {
        type: 'geojson',
        data: dados,
      });

      mapa.addLayer({
        id: 'linha-rota',
        type: 'line',
        source: 'rota',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#10b968',
          'line-width': 5,
        },
      });
    }

    if (geometria?.coordinates.length) {
      const limites = new maplibregl.LngLatBounds();

      geometria.coordinates.forEach((ponto) => {
        limites.extend(ponto);
      });

      mapa.fitBounds(limites, {
        pitch: inclinacao,
        padding: { top: 90, bottom: espacoInferior, left: 40, right: 40 },
        duration: 500,
      });
    }
  }

  if (mapa.isStyleLoaded()) {
    desenhar();
  } else {
    mapa.once('load', desenhar);
  }

  return () => {
    mapa.off('load', desenhar);
  };
}, [geometria, farmacias, claro, espacoInferior, modelo, inclinacao]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: expandido ? '100%' : 350,
        flex: expandido ? 1 : undefined,
        borderRadius: expandido ? 0 : 16,
        overflow: 'hidden',
      }}
    />
  );
}
