import { createContext, useContext, useState, type ReactNode } from "react";
import type { MascotId } from "@/components/ui/mascot";

export type RegisterData = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  confirmaSenha: string;
  remedioFrequente: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  mascote: MascotId;
};

const initialRegisterData: RegisterData = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  senha: "",
  confirmaSenha: "",
  remedioFrequente: "",
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  complemento: "",
  mascote: "broto",
};

type RegisterContextData = {
  registerData: RegisterData;
  setRegisterData: (data: Partial<RegisterData>) => void;
  resetRegisterData: () => void;
};

const RegisterContext = createContext<RegisterContextData | undefined>(
  undefined,
);

// Guarda os dados de todas as etapas do cadastro para que a última (mascote)
// envie tudo junto numa única requisição.
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
