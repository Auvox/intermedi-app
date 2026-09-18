import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';

import { pharmacies } from '@/constants/mock-data';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Rota } from '@/services/caminhada';
import type { FeatureCollection } from 'geojson';
import type { Pharmacy } from '@/constants/mock-data';

type MapaProps = {
  localizacao?: {
    latitude: number;
    longitude: number;
  };
   geometria?: Rota['geometria'];
   farmacias?: Pharmacy[];
};

export default function Mapa({localizacao ,geometria, farmacias = pharmacies, }: MapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<maplibregl.Map | null>(null);
  const marcadorUsuarioRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mapa = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [-46.417, -23.5459],
      zoom: 13,
      
    });

    mapaRef.current = mapa;
    mapa.addControl(new maplibregl.NavigationControl());

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
    };
  }, [farmacias]);

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
      padding: 60,
      maxZoom: 15,
      duration: 0,
    });
  }, [localizacao, farmacias]);

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
        padding: 40,
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
}, [geometria, farmacias]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 350,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    />
  );
}