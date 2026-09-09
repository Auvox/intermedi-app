import { createContext, useContext, useState, type ReactNode } from "react";

export type RegisterData = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  confirmaSenha: string;
  remedioFrequente: string;
};

const initialRegisterData: RegisterData = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  senha: "",
  confirmaSenha: "",
  remedioFrequente: "",
};

type RegisterContextData = {
  registerData: RegisterData;
  setRegisterData: (data: Partial<RegisterData>) => void;
  resetRegisterData: () => void;
};

const RegisterContext = createContext<RegisterContextData | undefined>(
  undefined,
);

// Guarda os dados preenchidos na 1ª etapa (cadastro) para que a 2ª etapa
// (endereço) consiga enviar tudo junto numa única requisição.
export function RegisterProvider({ children }: { children: ReactNode }) {
  const [registerData, setRegisterDataState] =
    useState<RegisterData>(initialRegisterData);

  function setRegisterData(data: Partial<RegisterData>) {
    setRegisterDataState((prev) => ({ ...prev, ...data }));
  }

  function resetRegisterData() {
    setRegisterDataState(initialRegisterData);
  }

  return (
    <RegisterContext.Provider
      value={{ registerData, setRegisterData, resetRegisterData }}
    >
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegisterData() {
  const context = useContext(RegisterContext);

  if (!context) {
    throw new Error(
      "useRegisterData deve ser usado dentro de um RegisterProvider",
    );
  }

  return context;
}
