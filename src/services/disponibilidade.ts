import { consultarEstoqueFarmacia, listarFarmacias, type Farmacia } from './farmacias';

export type Disponivel = { farmacia: Farmacia; quantidade: number };
export type MapaDisponibilidade = {
  farmacias: Farmacia[];
  // idRemedio -> farmácias com estoque válido (quantidade > 0 e dentro da validade)
  porRemedio: Record<string, Disponivel[]>;
  // idFarmacia -> quantos remédios diferentes têm estoque
  itensPorFarmacia: Record<number, number>;
  consultaIncompleta: boolean;
};

let cache: { at: number; promise: Promise<MapaDisponibilidade> } | undefined;
const VALIDADE_MS = 60_000;

// Lê o estoque de todas as farmácias uma vez e reaproveita por um minuto entre as telas.
export function mapaDisponibilidade(forcar = false): Promise<MapaDisponibilidade> {
  if (!forcar && cache && Date.now() - cache.at < VALIDADE_MS) return cache.promise;
  const promise = montarMapa();
  cache = { at: Date.now(), promise };
  promise.catch(() => { if (cache?.promise === promise) cache = undefined; });
  return promise;
}

async function montarMapa(): Promise<MapaDisponibilidade> {
  const farmacias = await listarFarmacias();
  const porRemedio: Record<string, Disponivel[]> = {};
  const itensPorFarmacia: Record<number, number> = {};
  let falhas = 0;
  // Limita as consultas simultâneas para não sobrecarregar a API.
  for (let inicio = 0; inicio < farmacias.length; inicio += 4) {
    const grupo = farmacias.slice(inicio, inicio + 4);
    const respostas = await Promise.allSettled(grupo.map(farmacia => consultarEstoqueFarmacia(String(farmacia.idFarmacia)).then(r => ({ farmacia, estoque: r.estoque }))));
    respostas.forEach(resposta => {
      if (resposta.status === 'rejected') { falhas++; return; }
      const { farmacia, estoque } = resposta.value;
      const totais: Record<string, number> = {};
      estoque.forEach(item => { if (item.quantidade > 0 && !item.vencido) totais[item.idRemedio] = (totais[item.idRemedio] ?? 0) + item.quantidade; });
      itensPorFarmacia[farmacia.idFarmacia] = Object.keys(totais).length;
      Object.entries(totais).forEach(([id, quantidade]) => { (porRemedio[id] ??= []).push({ farmacia, quantidade }); });
    });
  }
  if (farmacias.length > 0 && falhas === farmacias.length) throw new Error('Não foi possível consultar o estoque das farmácias.');
  return { farmacias, porRemedio, itensPorFarmacia, consultaIncompleta: falhas > 0 };
}

// Poucas unidades: abaixo deste total a etiqueta fica âmbar.
export const POUCAS_UNIDADES = 10;

export function distanciaKm(a: { latitude: number; longitude: number }, b: { latitude?: number | null; longitude?: number | null }) {
  if (typeof b.latitude !== 'number' || typeof b.longitude !== 'number') return undefined;
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad, dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
export const formatarKm = (km?: number) => km == null ? undefined : `${km.toFixed(1).replace('.', ',')} km`;
