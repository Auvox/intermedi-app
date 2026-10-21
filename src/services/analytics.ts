import { Dimensions } from 'react-native';

import { API_URL } from '@/constants/api';

// Mapa de calor da aba "Desempenho" do admin (POST /analytics/cliques).
// Guarda os toques e as visitas às telas numa fila e envia em lote a cada
// 10 s ou quando o app vai para segundo plano. Nunca uma requisição por toque.
// PRIVACIDADE: só a posição do toque (em fração da tela). Nunca o que foi
// digitado nem o conteúdo da tela.

type Comum = {
  rota: string;
  plataforma: 'app';
  persona: 'paciente';
  usuarioId: number | null;
  farmaciaId: number | null;
  dispositivo: 'celular' | 'tablet';
  sessao: string;
};
type Clique = Comum & { x: number; y: number; largura: number; altura: number; elemento: null; interativo: null; em: number };
type Visita = Comum & { duracaoMs: number; saida: boolean; em: number };

const INTERVALO_ENVIO = 10000;
const MAXIMO_POR_LOTE = 400;
// id aleatório de cada abertura do app (conta "usuários ativos" sem login)
const SESSAO = `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

let cliques: Clique[] = [];
let visitas: Visita[] = [];
let usuarioId: number | null = null;
let telaAtual: { rota: string; inicio: number } | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

function dispositivo(): Comum['dispositivo'] {
  const { width, height } = Dimensions.get('window');
  return Math.min(width, height) >= 600 ? 'tablet' : 'celular';
}

function comum(rota: string): Comum {
  return { rota, plataforma: 'app', persona: 'paciente', usuarioId, farmaciaId: null, dispositivo: dispositivo(), sessao: SESSAO };
}

export function definirUsuarioAnalytics(id: number | null | undefined) {
  usuarioId = id ?? null;
}

// pageX/pageY do toque. No app não dá para saber se o toque foi num botão
// (interativo: null), e o elemento não é identificado.
export function registrarToque(pageX: number, pageY: number) {
  if (!telaAtual) return;
  const { width, height } = Dimensions.get('window');
  if (!width || !height) return;
  cliques.push({
    ...comum(telaAtual.rota),
    x: Math.min(1, Math.max(0, pageX / width)),
    y: Math.min(1, Math.max(0, pageY / height)),
    largura: Math.round(width),
    altura: Math.round(height),
    elemento: null,
    interativo: null,
    em: Date.now(),
  });
  if (cliques.length >= MAXIMO_POR_LOTE) void enviarAnalytics();
}

function fecharVisita(saida: boolean) {
  if (!telaAtual) return;
  visitas.push({ ...comum(telaAtual.rota), duracaoMs: Date.now() - telaAtual.inicio, saida, em: telaAtual.inicio });
  telaAtual = null;
}

export function mudarDeTelaAnalytics(rota: string) {
  if (telaAtual?.rota === rota) return;
  fecharVisita(false);
  telaAtual = { rota, inicio: Date.now() };
}

// app foi para segundo plano: a visita termina como "saída" e o lote é enviado
export function appEmSegundoPlano() {
  fecharVisita(true);
  void enviarAnalytics();
}

export function appVoltou(rota: string) {
  if (!telaAtual) telaAtual = { rota, inicio: Date.now() };
}

export async function enviarAnalytics() {
  if (!cliques.length && !visitas.length) return;
  const lote = { cliques: cliques.slice(0, MAXIMO_POR_LOTE), visitas: visitas.slice(0, MAXIMO_POR_LOTE) };
  cliques = cliques.slice(lote.cliques.length);
  visitas = visitas.slice(lote.visitas.length);
  try {
    const resposta = await fetch(`${API_URL}/analytics/cliques`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Intermedi-Plataforma': 'app' },
      body: JSON.stringify(lote),
    });
    if (resposta.status >= 500) throw new Error(`HTTP ${resposta.status}`);
  } catch {
    // sem conexão: devolve para a fila (com limite) e tenta no próximo envio
    cliques = [...lote.cliques, ...cliques].slice(-2000);
    visitas = [...lote.visitas, ...visitas].slice(-500);
  }
}

export function iniciarAnalytics() {
  if (!timer) timer = setInterval(() => void enviarAnalytics(), INTERVALO_ENVIO);
  return () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
}

// Captura da tela (fundo do mapa de calor do app). Só em desenvolvimento e com
// EXPO_PUBLIC_CAPTURAR_TELAS=true: em produção a captura mostraria os dados do
// paciente. Cada tela é enviada uma vez por abertura do app.
const capturadas = new Set<string>();
export const capturaDeTelasLigada = __DEV__ && process.env.EXPO_PUBLIC_CAPTURAR_TELAS === 'true';

export async function enviarCapturaDaTela(rota: string, uri: string) {
  if (!capturaDeTelasLigada || capturadas.has(rota)) return;
  capturadas.add(rota);
  const { width, height } = Dimensions.get('window');
  const dados = new FormData();
  dados.append('foto', { uri, name: 'tela.jpg', type: 'image/jpeg' } as unknown as Blob);
  const query = `rota=${encodeURIComponent(rota)}&largura=${Math.round(width)}&altura=${Math.round(height)}`;
  try {
    await fetch(`${API_URL}/analytics/telas?${query}`, { method: 'POST', body: dados });
  } catch {
    capturadas.delete(rota);
  }
}
