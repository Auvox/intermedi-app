import { apiRequest } from '@/constants/api';

export async function buscarRota(
  origem,
  destino,
  modo = 'pedestrian',
) {
  return apiRequest('/rotas', {
    method: 'POST',
    body: JSON.stringify({ origem, destino, modo }),
  });
}