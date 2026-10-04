export type CepAddress = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export async function buscarEnderecoPorCep(cep: string, signal?: AbortSignal): Promise<CepAddress> {
  if (!/^\d{8}$/.test(cep)) throw new Error('Informe um CEP com 8 números.');
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancel);
  const timeout = setTimeout(cancel, 10000);
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal });
    if (!response.ok) throw new Error('Falha na consulta do CEP.');
    const data = await response.json();
    if (data?.erro) throw new Error('CEP não encontrado. Confira o CEP ou preencha o endereço manualmente.');
    if (typeof data?.localidade !== 'string' || typeof data?.uf !== 'string') {
      throw new Error('Resposta de CEP inválida.');
    }
    return {
      rua: typeof data.logradouro === 'string' ? data.logradouro : '',
      bairro: typeof data.bairro === 'string' ? data.bairro : '',
      cidade: data.localidade,
      estado: data.uf,
    };
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof Error && error.message.startsWith('CEP não encontrado')) throw error;
    throw new Error('Não foi possível consultar o CEP. Preencha o endereço manualmente ou tente novamente.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}
