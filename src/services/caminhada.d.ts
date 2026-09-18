export type Rota = {
  geometria: {
    type: 'LineString';
    coordinates: [number, number][];
  };
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
};


export function calcularCaminhada(farmacia: {
  latitude: number;
  longitude: number;
}): Promise<Rota>;
