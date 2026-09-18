export type Localizacao = {
  latitude: number;
  longitude: number;
};

export function acompanharLocalizacao(
  aoAtualizar: (localizacao: Localizacao) => void,
): Promise<{ remove(): void }>;