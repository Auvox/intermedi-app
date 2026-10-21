import { usePathname } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { AppState, Platform, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { useUser } from '@/context/user-context';
import {
  appEmSegundoPlano,
  appVoltou,
  capturaDeTelasLigada,
  definirUsuarioAnalytics,
  enviarCapturaDaTela,
  iniciarAnalytics,
  mudarDeTelaAnalytics,
  registrarToque,
} from '@/services/analytics';

// Envolve o app inteiro (_layout.tsx): registra onde a pessoa toca em cada
// tela para o mapa de calor do admin. Só observa os toques (não interfere em
// botões nem na rolagem); arrastar a tela não conta como toque.
export function RastreadorToques({ children }: { children: ReactNode }) {
  const rota = usePathname() || '/';
  const { user } = useUser();
  const raiz = useRef<View>(null);
  const inicioToque = useRef<{ x: number; y: number } | null>(null);
  const rotaAtual = useRef(rota);

  useEffect(() => iniciarAnalytics(), []);
  useEffect(() => definirUsuarioAnalytics(user?.id), [user?.id]);

  useEffect(() => {
    rotaAtual.current = rota;
    mudarDeTelaAnalytics(rota);
    if (!capturaDeTelasLigada || Platform.OS === 'web') return undefined;
    // espera a tela terminar de desenhar antes da captura
    const espera = setTimeout(() => {
      captureRef(raiz, { format: 'jpg', quality: 0.6, result: 'tmpfile' })
        .then((uri) => enviarCapturaDaTela(rota, uri))
        .catch(() => {});
    }, 1500);
    return () => clearTimeout(espera);
  }, [rota]);

  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') appVoltou(rotaAtual.current);
      else appEmSegundoPlano();
    });
    return () => assinatura.remove();
  }, []);

  const aoComecar = (event: GestureResponderEvent) => {
    inicioToque.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
  };
  const aoTerminar = (event: GestureResponderEvent) => {
    const inicio = inicioToque.current;
    inicioToque.current = null;
    const { pageX, pageY } = event.nativeEvent;
    // mais de 12 px de movimento = rolagem ou arraste, não um toque
    if (!inicio || Math.hypot(pageX - inicio.x, pageY - inicio.y) > 12) return;
    registrarToque(pageX, pageY);
  };

  return (
    <View ref={raiz} collapsable={false} style={styles.raiz} onTouchStart={aoComecar} onTouchEnd={aoTerminar}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ raiz: { flex: 1 } });
