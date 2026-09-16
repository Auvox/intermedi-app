import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';

import { pharmacies } from '@/constants/mock-data';
import 'maplibre-gl/dist/maplibre-gl.css';

type MapaProps = {
  localizacao?: {
    latitude: number;
    longitude: number;
  };
};

export default function Mapa({ localizacao }: MapaProps) {
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

    const marcadoresFarmacias = pharmacies.map((farmacia) => {
      const coordenadas: [number, number] = [
        farmacia.longitude,
        farmacia.latitude,
      ];

      // textContent evita interpretar nomes e endereços como HTML.
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

    // Ao abrir, enquadra as farmácias cadastradas na lista.
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
  }, []);

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

    // Enquadra sua localização e as UBS na mesma tela.
    const limites = new maplibregl.LngLatBounds(
      coordenadas,
      coordenadas,
    );

    pharmacies.forEach((farmacia) => {
      limites.extend([farmacia.longitude, farmacia.latitude]);
    });

    mapa.fitBounds(limites, {
      padding: 60,
      maxZoom: 15,
      duration: 0,
    });
  }, [localizacao]);

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