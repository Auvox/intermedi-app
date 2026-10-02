import { apiRequest } from '@/constants/api';
export type Farmacia = {
  idFarmacia: number;
  nomeFarmacia: string;
  fotoFarmacia?: string | null;
  telFarmacia?: string | null;
  emailFarmacia?: string | null;
  cnesFarmacia?: string | null;
  enderecoFarmacia?: string | null;
  numeroFarmacia?: string | null;
  complementoFarmacia?: string | null;
  bairroFarmacia?: string | null;
  cidadeFarmacia?: string | null;
  ufFarmacia?: string | null;
  cepFarmacia?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};
export type FarmaciaMapa = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};
export type ItemEstoque = {
  idEstoque: number;
  idRemedio: number;
  nomeRemedio: string;
  dosagemRemedio?: string;
  fotoRemedio?: string | null;
  quantidade: number;
  lote?: string;
  validade?: string | null;
  estoqueMinimo?: number;
  vencido?: boolean;
  critico?: boolean;
};
export type EstoqueFarmacia = {
  farmacia: {
    idFarmacia: number;
    nomeFarmacia: string
  };
  estoque: ItemEstoque[]
};
export const enderecoFarmacia = (f: Farmacia) => [f.enderecoFarmacia, f.numeroFarmacia, f.complementoFarmacia, f.bairroFarmacia, f.cidadeFarmacia, f.ufFarmacia, f.cepFarmacia].filter(Boolean).join(', ') || 'Endereço não informado';
export async function listarFarmacias() {
  const data = await apiRequest<{ farmacia: Farmacia[] }>('/farmacia');
  if (!Array.isArray(data.farmacia)) throw new Error('Não foi possível ler a lista de farmácias.');
  return data.farmacia;
}
export async function buscarFarmacia(id: string) {
  const data = await apiRequest<{ resultado: Farmacia }>(`/farmacia/${encodeURIComponent(id)}`);
  if (!data.resultado) throw new Error('Não foi possível carregar a farmácia.');
  return data.resultado;
}
export async function consultarEstoqueFarmacia(id: string) {
  const data = await apiRequest<EstoqueFarmacia>(`/farmacia/${encodeURIComponent(id)}/estoque`);
  if (!Array.isArray(data.estoque)) throw new Error('Não foi possível ler o estoque.');
  return data;
} 
export function prepararFarmaciasParaMapa(
  farmacias: Farmacia[],
): FarmaciaMapa[] {
  return farmacias.flatMap((farmacia) => {
    const { latitude, longitude } = farmacia;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return [];
    }

    return [{
      id: String(farmacia.idFarmacia),
      name: farmacia.nomeFarmacia,
      address: enderecoFarmacia(farmacia),
      latitude,
      longitude,
    }];
  });
}
