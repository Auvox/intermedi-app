import type { FillExtrusionLayerSpecification } from 'maplibre-gl';

export const ESTILOS_MAPA = [
  { id: 'positron', nome: 'Positron', descricao: 'Claro e minimalista', fundo: '#f2f2f2', agua: '#cbdde4', rua: '#ffffff' },
  { id: 'bright', nome: 'Bright', descricao: 'Cores vivas e detalhes', fundo: '#f6f1e5', agua: '#a0c8ef', rua: '#f8d487' },
  { id: 'liberty', nome: 'Liberty', descricao: 'Claro e equilibrado', fundo: '#e8eddf', agua: '#a6cee3', rua: '#ffffff' },
  { id: 'dark', nome: 'Dark', descricao: 'Escuro e discreto', fundo: '#202124', agua: '#111820', rua: '#58616a' },
  { id: 'fiord', nome: 'Fiord', descricao: 'Tons frios e contraste', fundo: '#34495e', agua: '#172e43', rua: '#8595a4' },
  { id: '3d', nome: '3D', descricao: 'Prédios em perspectiva', fundo: '#e8eddf', agua: '#a6cee3', rua: '#ffffff' },
] as const;

export type EstiloMapa = typeof ESTILOS_MAPA[number]['id'];
export const ESTILO_MAPA_PADRAO: EstiloMapa = 'liberty';

export function isEstiloMapa(valor: unknown): valor is EstiloMapa {
  return ESTILOS_MAPA.some(estilo => estilo.id === valor);
}

export function urlEstiloMapa(estilo: EstiloMapa) {
  // 3D é uma apresentação do Liberty, não um endpoint /styles/3d.
  return `https://tiles.openfreemap.org/styles/${estilo === '3d' ? 'liberty' : estilo}`;
}

export const PREDIOS_3D: FillExtrusionLayerSpecification = {
  id: 'intermedi-predios-3d',
  type: 'fill-extrusion',
  source: 'intermedi-predios',
  'source-layer': 'building',
  minzoom: 14,
  filter: ['!=', ['get', 'hide_3d'], true],
  paint: {
    'fill-extrusion-color': '#c4cec5',
    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 3],
    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
    'fill-extrusion-opacity': 0.85,
  },
};
