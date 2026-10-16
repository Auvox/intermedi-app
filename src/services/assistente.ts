import type { Href } from 'expo-router';
import type { Medicine } from '@/constants/mock-data';
import { distanciaKm, formatarKm, mapaDisponibilidade } from './disponibilidade';
import { listarMedicamentos } from './medicamentos';
import { medicineTitle, requiresPrescription } from '@/utils/medicine-style';

// Assistente do app: responde com regras simples e dados reais de estoque.
// Não é um modelo de IA e não dá orientação de tratamento.
export type Reply = {
  text: string;
  check?: string;
  stock?: { name: string; rows: { name: string; detail: string; amount: string; low: boolean }[]; tip?: string };
  actions?: { label: string; href: Href; primary?: boolean }[];
};

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function findMedicines(question: string, catalog: Medicine[]) {
  const q = normalize(question);
  const found = catalog.filter(m => m.name.trim().length > 2 && q.includes(normalize(m.name.trim())));
  // Prefere a dosagem citada ("losartana 50 mg") e evita repetir o mesmo nome.
  const byName = new Map<string, Medicine>();
  found.forEach(m => {
    const key = normalize(m.name);
    const dose = normalize(m.dosage).replace(/\s/g, '');
    if (!byName.has(key) || (dose && q.replace(/\s/g, '').includes(dose))) byName.set(key, m);
  });
  return Array.from(byName.values());
}

export async function responder(question: string, position?: { latitude: number; longitude: number }): Promise<Reply> {
  const q = normalize(question);
  const catalog = await listarMedicamentos().catch(() => [] as Medicine[]);
  const meds = findMedicines(question, catalog);

  if (meds.length >= 2) {
    const mapa = await mapaDisponibilidade().catch(() => undefined);
    return {
      text: `${meds.slice(0, 2).map(m => `${medicineTitle(m)}: ${mapa ? `${mapa.porRemedio[m.id]?.length ?? 0} farmácia(s) com estoque` : 'estoque indisponível agora'}${requiresPrescription(m) ? ', exige receita' : ''}`).join('\n')}\n\nQual é melhor para você depende do caso — confirme com o farmacêutico ou com seu médico.`,
      actions: meds.slice(0, 2).map((m, i) => ({ label: `Ver ${m.name}`, href: { pathname: '/medicamento/[id]', params: { id: m.id } }, primary: i === 0 })),
    };
  }

  if (meds.length === 1) {
    const m = meds[0];
    const mapa = await mapaDisponibilidade().catch(() => undefined);
    if (!mapa) return { text: `Não consegui consultar o estoque de ${medicineTitle(m)} agora. Tente de novo em instantes.`, actions: [{ label: 'Ver remédio', href: { pathname: '/medicamento/[id]', params: { id: m.id } } }] };
    const list = (mapa.porRemedio[m.id] ?? []).map(item => ({ ...item, distance: position ? distanciaKm(position, item.farmacia) : undefined }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity) || b.quantidade - a.quantidade);
    const check = `Consultou o estoque de ${mapa.farmacias.length} ${mapa.farmacias.length === 1 ? 'farmácia' : 'farmácias'}`;
    if (!list.length) return {
      check, text: `${medicineTitle(m)} está em falta nas farmácias cadastradas agora.${requiresPrescription(m) ? ' Lembre que ele exige receita.' : ''}`,
      actions: [{ label: 'Ver remédio', href: { pathname: '/medicamento/[id]', params: { id: m.id } }, primary: true }, { label: 'Ver farmácias', href: '/farmacias' }],
    };
    const best = list[0];
    return {
      check,
      text: `Sim! Encontrei ${medicineTitle(m)} em ${list.length} ${list.length === 1 ? 'farmácia' : 'farmácias'}:`,
      stock: {
        name: medicineTitle(m),
        rows: list.slice(0, 3).map(item => ({ name: item.farmacia.nomeFarmacia, detail: [formatarKm(item.distance), item.farmacia.bairroFarmacia].filter(Boolean).join(' · ') || 'Endereço na página da farmácia', amount: `${item.quantidade} un.`, low: item.quantidade < 10 })),
        tip: `${best.farmacia.nomeFarmacia} ${best.distance != null ? 'é a mais perto e ' : ''}tem ${best.quantidade} unidades.${requiresPrescription(m) ? ' Leve a receita.' : ''}`,
      },
      actions: [
        { label: 'Ver no mapa', href: { pathname: '/rota', params: { farmaciaId: String(best.farmacia.idFarmacia) } }, primary: true },
        { label: 'Ver remédio', href: { pathname: '/medicamento/[id]', params: { id: m.id } } },
      ],
    };
  }

  if (/reserv/.test(q)) return { text: 'Ainda não dá para reservar pelo app. Abra o remédio, veja qual farmácia tem estoque e toque em "Mapa" para traçar a rota até lá.', actions: [{ label: 'Ver remédios', href: '/buscar-medicamentos', primary: true }] };
  if (/renov/.test(q)) return { text: 'A renovação da receita é feita com o médico, na UBS ou na consulta. Leve a receita antiga e um documento com foto.' };
  if (/receita/.test(q)) return { text: 'Remédios com a etiqueta "Exige receita" só são entregues com a receita em mãos. Os que mostram "Sem receita" são isentos de prescrição — mesmo assim, confirme com o farmacêutico.', actions: [{ label: 'Ver remédios', href: '/buscar-medicamentos' }] };
  if (/horario|movimento|fila|lotad|cheio/.test(q)) return { text: 'Ainda não tenho o movimento das unidades por horário. Uma dica: ligue antes — o telefone de cada farmácia aparece na aba Farmácias.', actions: [{ label: 'Ver farmácias', href: '/farmacias', primary: true }] };
  if (/mascote|trocar/.test(q)) return { text: 'Para trocar de mascote, vá em Perfil → Seu mascote e escolha entre Broto, Lume e Luar.', actions: [{ label: 'Trocar mascote', href: '/mascote', primary: true }] };
  if (/dor|doi|doendo/.test(q)) return { text: 'Marque no corpo onde está doendo e eu mostro remédios que não exigem receita. Se a dor for forte ou não passar, procure atendimento.', actions: [{ label: 'Onde dói?', href: '/onde-doi', primary: true }] };
  if (/lembr|dose|rotina|tomar|horas/.test(q)) return { text: 'Abra um remédio e toque em "Adicionar à rotina". Eu mostro a próxima dose na tela inicial e você confirma com "Tomei".', actions: [{ label: 'Seus comprimidos', href: '/comprimidos', primary: true }] };
  if (/farmacia|perto|ubs|endereco/.test(q)) return { text: 'Na aba Farmácias você vê as unidades cadastradas, o telefone e a rota até cada uma.', actions: [{ label: 'Ver farmácias', href: '/farmacias', primary: true }] };
  return { text: 'Posso procurar um remédio para você (é só escrever o nome), mostrar farmácias com estoque e explicar como usar o app. Para dúvidas de tratamento, fale com o farmacêutico.' };
}
