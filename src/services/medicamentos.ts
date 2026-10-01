import { apiRequest, getApiAssetUrl } from '@/constants/api';
import type { Medicine } from '@/constants/mock-data';

type Remedio = {
  idRemedio: number;
  nomeRemedio: string;
  dosagemRemedio?: string | null;
  categorias?: string | null;
  descRemedio?: string | null;
  fotoRemedio?: string | null;
  principioAtivoRemedio?: string | null;
  fabricanteRemedio?: string | null;
  registroAnvisaRemedio?: string | null;
  tipoRemedio?: string | null;
  tarjaRemedio?: string | null;
  formaFarmaceuticaRemedio?: string | null;
  viaAdministracaoRemedio?: string | null;
  apresentacaoRemedio?: string | null;
  indicacoesRemedio?: string | null;
  contraindicacoesRemedio?: string | null;
  armazenamentoRemedio?: string | null;
  exigeReceita?: boolean | null;
  retemReceita?: boolean | null;
  createdAtRemedio?: string | null;
  updatedAtRemedio?: string | null;
};
const texto = (value?: string | null) => value?.trim() || 'Não informado';
const simNao = (value?: boolean | null) => value == null ? 'Não informado' : value ? 'Sim' : 'Não';
const tipos: Record<string, string> = { generico: 'Genérico', similar: 'Similar', referencia: 'Referência' };
const tarjas: Record<string, string> = {
  livre: 'Venda livre', sem_tarja: 'Venda livre', vermelha: 'Tarja vermelha',
  vermelha_retencao: 'Tarja vermelha com retenção de receita', preta: 'Tarja preta',
};
function dataCadastro(value?: string | null) {
  if (!value) return 'Não informado';
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}))?/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}${match[4] ? ` às ${match[4]}` : ''}` : value;
}
export const normalizarMedicamento = (r: Remedio): Medicine => ({
  id: String(r.idRemedio), name: r.nomeRemedio,
  dosage: r.dosagemRemedio ?? '', category: r.categorias || 'Sem categoria',
  description: r.descRemedio || 'Descrição não informada.', pharmacyIds: [],
  photo: getApiAssetUrl(r.fotoRemedio),
  details: [
    { label: 'Código do medicamento', value: String(r.idRemedio) },
    { label: 'Princípio ativo', value: texto(r.principioAtivoRemedio) },
    { label: 'Categorias', value: texto(r.categorias) },
    { label: 'Fabricante', value: texto(r.fabricanteRemedio) },
    { label: 'Registro ANVISA', value: texto(r.registroAnvisaRemedio) },
    { label: 'Tipo', value: tipos[r.tipoRemedio ?? ''] || texto(r.tipoRemedio) },
    { label: 'Tarja', value: tarjas[r.tarjaRemedio ?? ''] || texto(r.tarjaRemedio) },
    { label: 'Exige receita', value: simNao(r.exigeReceita) },
    { label: 'Retém receita', value: simNao(r.retemReceita) },
    { label: 'Apresentação', value: texto(r.apresentacaoRemedio) },
    { label: 'Forma farmacêutica', value: texto(r.formaFarmaceuticaRemedio) },
    { label: 'Via de administração', value: texto(r.viaAdministracaoRemedio) },
    { label: 'Indicações', value: texto(r.indicacoesRemedio) },
    { label: 'Contraindicações', value: texto(r.contraindicacoesRemedio) },
    { label: 'Armazenamento', value: texto(r.armazenamentoRemedio) },
    { label: 'Cadastrado em', value: dataCadastro(r.createdAtRemedio) },
    { label: 'Atualizado em', value: dataCadastro(r.updatedAtRemedio) },
  ],
});
export async function listarMedicamentos() {
  const data = await apiRequest<{ remedios: Remedio[] }>('/remedios');
  if (!Array.isArray(data.remedios)) throw new Error('Resposta inválida ao consultar medicamentos.');
  return data.remedios.map(normalizarMedicamento);
}
export async function buscarMedicamento(id: string) {
  const data = await apiRequest<{ resultado: Remedio }>(`/remedios/${encodeURIComponent(id)}`);
  return normalizarMedicamento(data.resultado);
}