import { apiRequest } from '@/constants/api';
export type Farmacia = {
  idFarmacia: number; nomeFarmacia: string; fotoFarmacia?: string | null;
  telFarmacia?: string | null; emailFarmacia?: string | null; cnesFarmacia?: string | null;
  enderecoFarmacia?: string | null; numeroFarmacia?: string | null; complementoFarmacia?: string | null;
  bairroFarmacia?: string | null; cidadeFarmacia?: string | null; ufFarmacia?: string | null; cepFarmacia?: string | null;
};
export type ItemEstoque = {
  idEstoque: number; idRemedio: number; nomeRemedio: string; dosagemRemedio?: string;
  fotoRemedio?: string | null; quantidade: number; lote?: string; validade?: string | null;
  estoqueMinimo?: number; vencido?: boolean; critico?: boolean;
};
export type EstoqueFarmacia = { farmacia: { idFarmacia: number; nomeFarmacia: string }; estoque: ItemEstoque[] };
export const enderecoFarmacia = (f: Farmacia) => [f.enderecoFarmacia, f.numeroFarmacia, f.complementoFarmacia, f.bairroFarmacia, f.cidadeFarmacia, f.ufFarmacia, f.cepFarmacia].filter(Boolean).join(', ') || 'Endereço não informado';
export async function listarFarmacias() {
  const data = await apiRequest<{ farmacia: Farmacia[] }>('/farmacia');
  if (!Array.isArray(data.farmacia)) throw new Error('Não foi possível ler a lista de farmácias.');
  return data.farmacia;
}
export async function consultarEstoqueFarmacia(id: string) {
  const data = await apiRequest<EstoqueFarmacia>(`/farmacia/${encodeURIComponent(id)}/estoque`);
  if (!Array.isArray(data.estoque)) throw new Error('Não foi possível ler o estoque.');
  return data;
}