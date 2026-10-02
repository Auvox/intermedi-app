import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import type { ImagePickerAsset } from 'expo-image-picker';
import { API_URL, ApiError } from '@/constants/api';
import { normalizarMedicamento } from '@/services/medicamentos';
import type { Medicine } from '@/constants/mock-data';

type RemedioReconhecido =
  Parameters<typeof normalizarMedicamento>[0];

type RespostaFoto = {
  textoReconhecido: string;
  medicamentos: RemedioReconhecido[];
};

export async function buscarMedicamentosPorFoto(
  foto: ImagePickerAsset,
): Promise<{
  textoReconhecido: string;
  medicamentos: Medicine[];
}> {
  const form = new FormData();
  const nome = foto.fileName || 'embalagem.jpg';

  if (Platform.OS === 'web') {
    const respostaFoto = await fetch(foto.uri);
    const imagem = await respostaFoto.blob();

    form.append('foto', imagem, nome);
  } else {
    const arquivo = new File(foto.uri);
    form.append('foto', arquivo, nome);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const enviar = Platform.OS === 'web' ? globalThis.fetch : expoFetch;
    const resposta = await enviar(
      `${API_URL}/remedios/reconhecer-foto`,
      {
        method: 'POST',
        body: form,
        signal: controller.signal,
      },
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new ApiError(
        dados.error || 'Não foi possível ler a foto.',
        resposta.status,
      );
    }

    const resultado = dados as RespostaFoto;

    if (
      typeof resultado.textoReconhecido !== 'string' ||
      !Array.isArray(resultado.medicamentos)
    ) {
      throw new Error('O servidor retornou uma resposta inválida.');
    }

    return {
      textoReconhecido: resultado.textoReconhecido,
      medicamentos: resultado.medicamentos.map(normalizarMedicamento),
    };
  } catch (erro) {
    if (controller.signal.aborted) {
      throw new Error(
        'A leitura demorou demais. Tente uma foto mais próxima do nome.',
      );
    }

    if (erro instanceof Error) throw erro;

    throw new Error('Não foi possível enviar a foto.');
  } finally {
    clearTimeout(timeout);
  }
}
