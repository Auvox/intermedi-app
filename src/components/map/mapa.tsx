import { useEffect, useMemo, useRef, useState, } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { criarMapaHtml } from './mapa-html';
import type { Rota } from '@/services/caminhada';
import type { FarmaciaMapa } from '@/services/farmacias';
import type { EstiloMapa } from './estilos-mapa';

type MapaProps = {
  onSelectFarmacia?: (id: string) => void;
  enquadrarFarmacias?: boolean;
  centralizarUsuario?: boolean;
  localizacao?: {
    latitude: number;
    longitude: number;
  };
  geometria?: Rota['geometria'];
  farmacias?: FarmaciaMapa[];
  seguindo?: boolean;
  expandido?: boolean;
  claro?: boolean;
  espacoInferior?: number;
  modelo?: EstiloMapa;
};

export default function Mapa(props: MapaProps) {
  // Uma nova WebView recebe novamente os dados da rota depois de carregar o estilo.
  return <MapaConteudo key={props.modelo ?? 'automatico'} {...props} />;
}

function MapaConteudo({ localizacao, geometria, farmacias, seguindo = false, expandido = false, claro = false, espacoInferior = 60, modelo, onSelectFarmacia, enquadrarFarmacias = false, centralizarUsuario = false, }: MapaProps) {
  const webviewRef = useRef<WebView>(null);
  const esquemaDeCores = useColorScheme();
  const temaEscuro = !claro && esquemaDeCores === 'dark';

  const fonte = useMemo(
    () => ({
      html: criarMapaHtml(temaEscuro, modelo),
    }),
    [temaEscuro, modelo],
  );
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!pronto) return;
    webviewRef.current?.injectJavaScript(`window.espacoInferior = ${espacoInferior}; true;`);
  }, [pronto, espacoInferior]);

  useEffect(() => {
    if (!pronto) return;

    webviewRef.current?.injectJavaScript(
      `window.selecionarFarmacia = ${Boolean(onSelectFarmacia)}; window.enquadrarFarmacias = ${enquadrarFarmacias}; window.atualizarFarmacias(${JSON.stringify(farmacias ?? null).replace(/</g, '\\u003c')}); true;`,
    );
  }, [pronto, farmacias, enquadrarFarmacias, onSelectFarmacia]);

  useEffect(() => {
    if (!pronto) return;

    console.log('Rota enviada ao mapa:', {
      tipo: geometria?.type,
      pontos: geometria?.coordinates.length,
    });

    webviewRef.current?.injectJavaScript(
      `window.desenharRota(${JSON.stringify(geometria ?? null)}); true;`,
    );
  }, [pronto, geometria, espacoInferior]);

  useEffect(() => {
    if (!pronto) return;
    // Retoma a posição atual após trocar o modelo durante a navegação.
    // Na prévia, o enquadramento final continua mostrando toda a rota.
    webviewRef.current?.injectJavaScript(
      `window.atualizarLocalizacao(${JSON.stringify(localizacao ?? null)}, ${JSON.stringify(seguindo)}, ${Boolean(geometria)}, ${centralizarUsuario}); true;`,
    );
  }, [pronto, localizacao, seguindo, geometria, espacoInferior, centralizarUsuario]);

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
          if (nativeEvent.data.startsWith('{')) {
            try {
              const message = JSON.parse(nativeEvent.data);
              if (message.type === 'farmacia' && typeof message.id === 'string') onSelectFarmacia?.(message.id);
            } catch { /* Ignore messages that are not marker selections. */ }
          }

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
