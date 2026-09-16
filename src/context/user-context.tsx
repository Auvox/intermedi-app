import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type LoggedUser = {
  id: number;
  nome: string;
  email: string;
  token: string;
  cpf?: string;
  telefone?: string;
  remedioFrequente?: string;
  fotoPerfilPaciente?: string | null;
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

  useEffect(() => {
    AsyncStorage.getItem('intermedi-session-v2')
      .then((savedUser) => {
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.token && parsed.id) setUserState(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setUser = useCallback(async (nextUser: LoggedUser | null, remember?: boolean) => {
    if (remember !== undefined) persistSession.current = remember;
    if (!nextUser) setUserState(null);
    if (nextUser && persistSession.current) {
      await AsyncStorage.setItem('intermedi-session-v2', JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem('intermedi-session-v2');
    }
    setUserState(nextUser);
  }, []);

  return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }

  return context;
}
