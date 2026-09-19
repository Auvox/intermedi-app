import { useEffect, useMemo, useRef, useState, } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { criarMapaHtml } from './mapa-html';
import type { Rota } from '@/services/caminhada';
import type { Pharmacy } from '@/constants/mock-data';

type MapaProps = {
  localizacao?: {
    latitude: number;
    longitude: number;
  };
  geometria?: Rota['geometria'];
  farmacias?: Pharmacy[];
  seguindo?: boolean;
  expandido?: boolean;
};

export default function Mapa({ localizacao, geometria, farmacias, seguindo = false, expandido = false, }: MapaProps) {
  const webviewRef = useRef<WebView>(null);
  const esquemaDeCores = useColorScheme();
  const temaEscuro = esquemaDeCores === 'dark';

  const fonte = useMemo(
    () => ({
      html: criarMapaHtml(temaEscuro),
    }),
    [temaEscuro],
  );
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!pronto) return;

    webviewRef.current?.injectJavaScript(
      `window.atualizarFarmacias(${JSON.stringify(farmacias ?? null).replace(/</g, '\\u003c')}); true;`,
    );
  }, [pronto, farmacias]);

  useEffect(() => {
    if (pronto) webviewRef.current?.injectJavaScript(
      `window.atualizarLocalizacao(
  ${JSON.stringify(localizacao ?? null)},
  ${JSON.stringify(seguindo)}
); true;`,
    );
  }, [pronto, localizacao, seguindo]);

  useEffect(() => {
    if (!pronto) return;

    console.log('Rota enviada ao mapa:', {
      tipo: geometria?.type,
      pontos: geometria?.coordinates.length,
    });

    webviewRef.current?.injectJavaScript(
      `window.desenharRota(${JSON.stringify(geometria ?? null)}); true;`,
    );
  }, [pronto, geometria]);

  return (
    <View
      style={[
        styles.container,
        expandido && styles.expandido,
      ]}>
      <WebView
        ref={webviewRef}
        source={fonte}
        originWhitelist={['*']}
        style={styles.mapa}
        scrollEnabled={false}
        onLoadStart={() => setPronto(false)}
        onMessage={({ nativeEvent }) => {
          console.log('Mensagem do mapa:', nativeEvent.data);

          if (nativeEvent.data === 'pronto') {
            setPronto(true);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 350, borderRadius: 16, overflow: 'hidden' },
  mapa: { flex: 1, backgroundColor: '#eef2f6' },
  expandido: {
    flex: 1,
    height: '100%',
    borderRadius: 0,
  },
});
