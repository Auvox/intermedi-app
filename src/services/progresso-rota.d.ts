import type { Localizacao } from './navegacao';
import type { Coordenada, GeometriaRota, } from './caminhada';

export function calcularDistancia(
  posicao: Localizacao,
  coordenada: Coordenada,
): number;

export function calcularDistanciaRestante(
  geometria: GeometriaRota,
  posicaoAtual: Localizacao,
): number;