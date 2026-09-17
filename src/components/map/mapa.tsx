import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { mapaHtml } from './mapa-html';

type MapaProps = { localizacao?: { latitude: number; longitude: number } };
const fonte = { html: mapaHtml };

export default function Mapa({ localizacao }: MapaProps) {
  const webviewRef = useRef<WebView>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (pronto) webviewRef.current?.injectJavaScript(
      `window.atualizarLocalizacao(${JSON.stringify(localizacao ?? null)}); true;`,
    );
  }, [pronto, localizacao]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={fonte}
        originWhitelist={['*']}
        style={styles.mapa}
        scrollEnabled={false}
        onLoadStart={() => setPronto(false)}
        onMessage={({ nativeEvent }) => {
          if (nativeEvent.data === 'pronto') setPronto(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 350, borderRadius: 16, overflow: 'hidden' },
  mapa: { flex: 1, backgroundColor: '#eef2f6' },
});
