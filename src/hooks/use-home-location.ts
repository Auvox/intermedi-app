import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

type Position = { latitude: number; longitude: number };
export function useHomeLocation() {
  const [position, setPosition] = useState<Position>();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function locate() {
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (!active) return;
        if (permission.status === 'undetermined' || (attempt > 0 && permission.canAskAgain)) {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (!active) return;
        if (!permission.granted) {
          setPosition(undefined);
          setMessage('Localização desativada. Mostrando as farmácias cadastradas. Você pode permitir o acesso nas configurações do dispositivo ou navegador.');
          return;
        }
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const result = await Promise.race([
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 15000); }),
          ]);
          if (active) {
            setPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude });
            setMessage('');
          }
        } finally { clearTimeout(timer); }
      } catch {
        if (active) {
          setPosition(undefined);
          setMessage('Não foi possível obter sua localização. Mostrando as farmácias cadastradas.');
        }
      } finally { if (active) setLoading(false); }
    }
    void locate();
    return () => { active = false; };
  }, [attempt]);
  function refresh() { setLoading(true); setMessage(''); setAttempt(value => value + 1); }
  return { position, loading, message, refresh };
}
