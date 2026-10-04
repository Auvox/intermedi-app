import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useUser } from './user-context';
import type { Medicine } from '@/constants/mock-data';
import type { Farmacia } from '@/services/farmacias';
type Favorites = { medicines: Medicine[]; pharmacies: Farmacia[] };
type Data = Favorites & { ready: boolean; toggleMedicine: (m: Medicine) => void; togglePharmacy: (p: Farmacia) => void };
const Context = createContext<Data | undefined>(undefined);
const empty: Favorites = { medicines: [], pharmacies: [] };
let queue: Promise<void> = Promise.resolve();
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useUser(); const key = user ? 'intermedi:favorites:' + user.id : '';
  const [stored, setStored] = useState<{ key: string; data: Favorites }>({ key: '', data: empty });
  const ready = !!key && stored.key === key;
  useEffect(() => {
if (!key) return; let active = true;
    AsyncStorage.getItem(key).then(saved => { if (!active) return; let data = empty; if (saved) { const p = JSON.parse(saved); if (Array.isArray(p.medicines) && Array.isArray(p.pharmacies)) data = p; } setStored({ key, data }); })
      .catch(() => { if (active) setStored({ key, data: empty }); }); return () => { active = false; };
}, [key]);
  useEffect(() => { if (!ready) return; queue = queue.then(() => AsyncStorage.setItem(key, JSON.stringify(stored.data))).catch(error => console.warn('Não foi possível salvar favoritos.', error)); }, [key, ready, stored]);
  function toggleMedicine(m: Medicine) { if (!ready) return; setStored(s => ({ ...s, data: { ...s.data, medicines: s.data.medicines.some(i => i.id === m.id) ? s.data.medicines.filter(i => i.id !== m.id) : [...s.data.medicines, m] } })); }
  function togglePharmacy(p: Farmacia) { if (!ready) return; setStored(s => ({ ...s, data: { ...s.data, pharmacies: s.data.pharmacies.some(i => i.idFarmacia === p.idFarmacia) ? s.data.pharmacies.filter(i => i.idFarmacia !== p.idFarmacia) : [...s.data.pharmacies, p] } })); }
  return <Context.Provider value={{ ...(ready ? stored.data : empty), ready, toggleMedicine, togglePharmacy }}>{children}</Context.Provider>;
}
export function useFavorites() { const value = useContext(Context); if (!value) throw Error('FavoritesProvider ausente'); return value; }
