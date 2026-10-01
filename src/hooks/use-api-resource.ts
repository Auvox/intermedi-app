import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
// Atualiza ao abrir a tela e ignora respostas de telas fechadas ou consultas antigas.
export function useApiResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const current = ++sequence.current;
    setLoading(true); setError(''); setData(undefined);
    try { const result = await loader(); if (current === sequence.current) setData(result); }
    catch (e) { if (current === sequence.current) setError(e instanceof Error ? e.message : 'Não foi possível carregar os dados.'); }
    finally { if (current === sequence.current) setLoading(false); }
  }, [loader]);
  useFocusEffect(useCallback(() => { void reload(); return () => { sequence.current++; }; }, [reload]));
  return { data, loading, error, reload };
}