import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useUser } from './user-context';
import type { MascotId } from '@/components/ui/mascot';
import type { Tone } from '@/constants/theme';
import type { PillKind } from '@/utils/medicine-style';

// Rotina do paciente salva neste aparelho: mascote, remédios do dia, doses tomadas,
// diário de dores e notificações lidas. O banco ainda não tem tabelas para isso.
export type Dose = { id: string; medicineId: string; name: string; dosage: string; time: string; kind: PillKind; tone: Tone; photo?: string | null; note?: string };
export type DoseStatus = 'tomado' | 'pulado';
export type PainEntry = { date: string; regions: string[] };
type CareState = {
  mascot: MascotId; introSeen: boolean; tourDone: boolean;
  doses: Dose[]; log: Record<string, Record<string, { status: DoseStatus; at: string }>>;
  pains: PainEntry[]; readNotifications: string[]; snoozed: Record<string, string>;
};
const initial: CareState = { mascot: 'broto', introSeen: false, tourDone: false, doses: [], log: {}, pains: [], readNotifications: [], snoozed: {} };
const storageKey = (userId: number | string) => 'intermedi:care:' + userId;

export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const minutesOf = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + (m || 0); };
export const formatTime = (time: string) => time.replace(':', 'h').replace(/h00$/, 'h');

// Usado no cadastro: grava a escolha do mascote antes do primeiro carregamento da conta.
export async function seedCare(userId: number, data: Partial<CareState>) {
  const saved = await AsyncStorage.getItem(storageKey(userId)).catch(() => null);
  const current = saved ? { ...initial, ...JSON.parse(saved) } : initial;
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify({ ...current, ...data }));
}

type CareData = CareState & {
  ready: boolean;
  update: (change: Partial<CareState> | ((state: CareState) => Partial<CareState>)) => void;
  addDose: (dose: Omit<Dose, 'id'>) => void;
  removeDose: (id: string) => void;
  setDoseStatus: (id: string, status: DoseStatus | null) => void;
  snooze: (id: string, minutes: number) => void;
  savePain: (regions: string[]) => void;
  todayDoses: (Dose & { status?: DoseStatus })[];
  nextDose?: Dose;
};
const Context = createContext<CareData | undefined>(undefined);
let queue: Promise<void> = Promise.resolve();

export function CareProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const key = user ? storageKey(user.id) : '';
  const [stored, setStored] = useState<{ key: string; data: CareState }>({ key: '', data: initial });
  const ready = !!key && stored.key === key;
  useEffect(() => {
    if (!key) return; let active = true;
    AsyncStorage.getItem(key).then(saved => { if (active) setStored({ key, data: saved ? { ...initial, ...JSON.parse(saved) } : initial }); })
      .catch(() => { if (active) setStored({ key, data: initial }); });
    return () => { active = false; };
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    queue = queue.then(() => AsyncStorage.setItem(key, JSON.stringify(stored.data))).catch(error => console.warn('Não foi possível salvar a rotina.', error));
  }, [key, ready, stored]);

  const update = useCallback((change: Partial<CareState> | ((state: CareState) => Partial<CareState>)) => {
    setStored(s => ({ ...s, data: { ...s.data, ...(typeof change === 'function' ? change(s.data) : change) } }));
  }, []);
  const data = ready ? stored.data : initial;
  const today = dayKey();
  const todayDoses = useMemo(() => [...data.doses].sort((a, b) => minutesOf(a.time) - minutesOf(b.time))
    .map(dose => ({ ...dose, status: data.log[today]?.[dose.id]?.status })), [data.doses, data.log, today]);
  const nextDose = todayDoses.find(dose => !dose.status);

  const value: CareData = {
    ...data, ready, update, todayDoses, nextDose,
    addDose: dose => update(s => ({ doses: [...s.doses, { ...dose, id: `${dose.medicineId}-${dose.time}-${Date.now()}` }] })),
    removeDose: id => update(s => ({ doses: s.doses.filter(d => d.id !== id) })),
    setDoseStatus: (id, status) => update(s => {
      const day = { ...(s.log[today] ?? {}) };
      if (status) day[id] = { status, at: new Date().toISOString() }; else delete day[id];
      return { log: { ...s.log, [today]: day } };
    }),
    snooze: (id, minutes) => update(s => ({ snoozed: { ...s.snoozed, [id]: new Date(Date.now() + minutes * 60000).toISOString() } })),
    savePain: regions => update(s => ({ pains: [...s.pains.filter(p => p.date !== today), { date: today, regions }] })),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCare() { const value = useContext(Context); if (!value) throw Error('CareProvider ausente'); return value; }
