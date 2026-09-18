export type Coordenada = [number, number];

export type GeometriaRota = {
  type: 'LineString';
  coordinates: Coordenada[];
};

export type PassoRota = {
  instrucao: string;
  tipo: string;
  direcao: string | null;
  rua: string;
  distanciaMetros: number;
  tempoSegundos: number;
  localizacaoManobra: Coordenada;
  geometria: GeometriaRota;
};

export type Rota = {
  geometria: GeometriaRota;
  distanciaMetros: number;
  tempoSegundos: number;
  origem: {
    latitude: number;
    longitude: number;
  };
  destino: {
    latitude: number;
    longitude: number;
  };
  passos: PassoRota[];
};

export function calcularCaminhada(farmacia: {
  latitude: number;
  longitude: number;
}): Promise<Rota>;