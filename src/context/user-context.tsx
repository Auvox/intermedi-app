import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { apiRequest } from '@/constants/api';

export type LoggedUser = {
  id: number;
  nome: string;
  email: string;
  token: string;
  cpf?: string;
  telefone?: string;
  remedioFrequente?: string;
  fotoPerfilPaciente?: string | null;
  cepPaciente?: string;
  ruaPaciente?: string;
  numeroPaciente?: string;
  bairroPaciente?: string;
  cidadePaciente?: string;
  estadoPaciente?: string;
  complementoPaciente?: string;
};

type UserContextData = {
  user: LoggedUser | null;
  loading: boolean;
  setUser: (user: LoggedUser | null, remember?: boolean) => Promise<void>;
};

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<LoggedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const persistSession = useRef(true);
  const currentUser = useRef(user);
  useEffect(() => { currentUser.current = user; }, [user]);

  useEffect(() => {
    AsyncStorage.getItem('intermedi-session-v2')
      .then((savedUser) => {
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.token && parsed.id) setUserState(parsed);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const setUser = useCallback(async (nextUser: LoggedUser | null, remember?: boolean) => {
    if (remember !== undefined) persistSession.current = remember;
    if (nextUser && currentUser.current?.id === nextUser.id) nextUser = { ...currentUser.current, ...nextUser };
    if (!nextUser) setUserState(null);
    if (nextUser && persistSession.current) {
      await AsyncStorage.setItem('intermedi-session-v2', JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem('intermedi-session-v2');
    }
    setUserState(nextUser);
  }, []);

  // Refresh persisted sessions too, so existing users receive their saved address.
  const token = user?.token;
  useEffect(() => {
    if (!token) return;
    let active = true;
    const snapshot = currentUser.current;
    if (!snapshot) return;
    apiRequest<{ resultado: Partial<LoggedUser> }>(`/paciente/${snapshot.id}`, {}, token)
      .then(async ({ resultado: address }) => {
        if (!active || currentUser.current !== snapshot || !snapshot) return;
        if (!address) return;
        await setUser({
          ...snapshot,
          cepPaciente: address.cepPaciente ?? '', ruaPaciente: address.ruaPaciente ?? '',
          numeroPaciente: address.numeroPaciente ?? '', bairroPaciente: address.bairroPaciente ?? '',
          cidadePaciente: address.cidadePaciente ?? '', estadoPaciente: address.estadoPaciente ?? '',
          complementoPaciente: address.complementoPaciente ?? '',
        });
      })
      .catch(() => { });
    return () => { active = false; };
  }, [token, setUser]);

  return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }

  return context;
}
