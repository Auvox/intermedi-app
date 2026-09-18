import type { GeometriaRota } from './caminhada';
import type { Localizacao } from './navegacao';

export function simularPercurso(
  geometria: GeometriaRota,
  aoAtualizar: (posicao: Localizacao) => void,
  aoConcluir: () => void,
): { remove(): void };