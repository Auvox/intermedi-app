import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type LoggedUser = {
  id: number;
  nome: string;
  email: string;
  fotoPerfilPaciente?: string | null;
};

type UserContextData = {
  user: LoggedUser | null;
  setUser: (user: LoggedUser | null) => Promise<void>;
};

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<LoggedUser | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('usuario')
      .then((savedUser) => {
        if (savedUser) setUserState(JSON.parse(savedUser));
      })
      .catch((error) => console.error('Erro ao carregar usuário:', error));
  }, []);

  async function setUser(nextUser: LoggedUser | null) {
    setUserState(nextUser);

    if (nextUser) {
      await AsyncStorage.setItem('usuario', JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem('usuario');
    }
  }

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }

  return context;
}
