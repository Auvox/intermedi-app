import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { acompanharLocalizacao, type Localizacao, } from '@/services/navegacao';
import { BackButton } from "@/components/ui/back-button";
import { AppText } from "@/components/ui/app-text";
import { getPharmacyById } from "@/constants/mock-data";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { calcularCaminhada, type Rota, type ModoLocomocao, } from '@/services/caminhada';
import Mapa from "@/components/map/mapa";
import { simularPercurso } from '@/services/simulacao';
import { calcularDistancia, calcularDistanciaRestante } from '@/services/progresso-rota';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

const OPCOES_MODO = [
  { valor: 'pedestrian', titulo: 'A pé', icone: 'walk' },
  { valor: 'auto', titulo: 'Carro', icone: 'car' },
  { valor: 'motorcycle', titulo: 'Moto', icone: 'motorbike' },
  { valor: 'bicycle', titulo: 'Bike', icone: 'bike' },
] as const;

export default function RotaScreen() {
  const { farmaciaId } = useLocalSearchParams<{
    farmaciaId?: string | string[];
  }>();

  const id = Array.isArray(farmaciaId) ? farmaciaId[0] : farmaciaId;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const farmacia = id ? getPharmacyById(id) : undefined;

  const farmaciasDaRota = useMemo(
    () => (farmacia ? [farmacia] : []),
    [farmacia]
  );

  const [rota, setRota] = useState<Rota | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [navegando, setNavegando] = useState(false);
  const [posicaoAtual, setPosicaoAtual] = useState<Localizacao | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const acompanhamentoRef = useRef<{ remove(): void } | null>(null);
  const [, setSimulando] = useState(false);
  const [passoAtual, setPassoAtual] = useState(0);
  const [modo, setModo] = useState<ModoLocomocao>('pedestrian');

  const sessaoRef = useRef(0);

  function escolherModo(novoModo: ModoLocomocao) {
    if (carregando || novoModo === modo) return;

    encerrarNavegacao();
    setModo(novoModo);
    setRota(null);
    setPosicaoAtual(null);
    setPassoAtual(0);
    setErro('');
  }
  async function calcular() {
    if (!farmacia || carregando) return;



    encerrarNavegacao();
    setPosicaoAtual(null);

    setPassoAtual(0);

    setCarregando(true);
    setErro("");
    setRota(null);

    try {
      const resultado = await calcularCaminhada(farmacia, modo);
      setRota(resultado);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível calcular a rota."
      );
    } finally {
      setCarregando(false);
    }

  }
  function encerrarNavegacao() {
    sessaoRef.current += 1;
    acompanhamentoRef.current?.remove();
    acompanhamentoRef.current = null;

    setNavegando(false);
    setIniciando(false);
    setSimulando(false);
  }

  async function iniciarNavegacao() {
    if (!rota || iniciando || navegando) return;

    const sessao = ++sessaoRef.current;

    setIniciando(true);
    setErro('');
    setPosicaoAtual(rota.origem);

    try {
      const acompanhamento = await acompanharLocalizacao(
        (posicao) => {
          if (sessaoRef.current === sessao) {
            setPosicaoAtual(posicao);
          }
        },
      );

      if (sessaoRef.current !== sessao) {
        acompanhamento.remove();
        return;
      }

      acompanhamentoRef.current = acompanhamento;
      setNavegando(true);
    } catch (error) {
      if (sessaoRef.current === sessao) {
        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível iniciar a navegação.',
        );
      }
    } finally {
      if (sessaoRef.current === sessao) {
        setIniciando(false);
      }
    }
  }
  function iniciarSimulacao() {
    if (!rota || carregando) return;

    encerrarNavegacao();

    const sessao = sessaoRef.current;

    setErro('');

    try {
      acompanhamentoRef.current = simularPercurso(
        rota.geometria,
        (posicao) => {
          if (sessaoRef.current === sessao) {
            setPosicaoAtual(posicao);
          }
        },
        () => {
          if (sessaoRef.current === sessao) {
            encerrarNavegacao();
          }
        },
      );

      setSimulando(true);
      setNavegando(true);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar a simulação.',
      );
    }
  }

  useEffect(() => {
    if (!navegando || !rota || !posicaoAtual) return;

    const proximoPasso = rota.passos[passoAtual + 1];

    if (!proximoPasso) return;

    const distancia = calcularDistancia(
      posicaoAtual,
      proximoPasso.localizacaoManobra,
    );

    if (distancia <= 20) {
      setPassoAtual((atual) => atual + 1);
    }
  }, [navegando, rota, posicaoAtual, passoAtual]);

  useEffect(() => {
    return () => {
      sessaoRef.current += 1;
      acompanhamentoRef.current?.remove();
    };
  }, []);

  const distanciaRestante =
  rota && posicaoAtual
    ? Math.min(
        rota.distanciaMetros,
        calcularDistanciaRestante(
          rota.geometria,
          posicaoAtual,
        ),
      )
    : rota?.distanciaMetros ?? 0;

const proporcaoRestante =
  rota && rota.distanciaMetros > 0
    ? distanciaRestante / rota.distanciaMetros
    : 0;

const tempoRestante =
  rota
    ? Math.max(
        0,
        rota.tempoSegundos * proporcaoRestante,
      )
    : 0;

 if (navegando && rota) {
  return (
    <View style={styles.telaNavegacao}>

      <Mapa
        farmacias={farmaciasDaRota}
        localizacao={posicaoAtual ?? rota.origem}
        geometria={rota.geometria}
        seguindo
        expandido
      />

      <View
        style={[
          styles.topoNavegacao,
          { paddingTop: insets.top + 12 },
        ]}>
        <View style={styles.painelInstrucao}>
          <BackButton
            tone="light"
            onPress={encerrarNavegacao}
          />

          <View style={styles.textosInstrucao}>
            {rota.passos[passoAtual] ? (
              <>
                <AppText style={styles.instrucaoAtual}>
                  {rota.passos[passoAtual].instrucao}
                </AppText>

                {rota.passos[passoAtual + 1] ? (
                  <AppText style={styles.proximaInstrucao}>
                    Depois: {rota.passos[passoAtual + 1].instrucao}
                  </AppText>
                ) : (
                  <AppText style={styles.proximaInstrucao}>
                    Você está chegando ao destino
                  </AppText>
                )}
              </>

            ) : null}
          </View>
        </View>
      </View>
      <View
  style={[
    styles.painelResumo,
    { paddingBottom: insets.bottom + 12 },
  ]}>
  <View style={styles.itemResumo}>
    <AppText style={styles.valorResumo}>
      {Math.ceil(tempoRestante / 60)} min
    </AppText>

    <AppText style={styles.rotuloResumo}>
      Tempo restante
    </AppText>
  </View>

  <View style={styles.separadorResumo} />

  <View style={styles.itemResumo}>
    <AppText style={styles.valorResumo}>
      {distanciaRestante >= 1000
        ? `${(distanciaRestante / 1000).toFixed(1)} km`
        : `${Math.round(distanciaRestante)} m`}
    </AppText>

    <AppText style={styles.rotuloResumo}>
      Distância restante
    </AppText>
  </View>
</View>
    </View>
  );
}

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.conteudo,
        { paddingTop: insets.top + Spacing.md },
      ]}>
      <View style={styles.cabecalho}>
        <BackButton tone="dark" />

        <View style={styles.cabecalhoTexto}>
          <AppText variant="h3">Trajeto até a unidade</AppText>
          <AppText variant="label" numberOfLines={1}>
            {farmacia?.name ?? 'Unidade não encontrada'}
          </AppText>
        </View>
      </View>

      {farmacia ? (
        <>
          <View
            style={[
              styles.destino,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.destinoIcone}>
              <Ionicons
                name="medical"
                size={22}
                color={Colors.textOnPrimary}
              />
            </View>

            <View style={styles.destinoTexto}>
              <AppText variant="bodyBold">{farmacia.name}</AppText>
              <AppText variant="label" numberOfLines={2}>
                {farmacia.address}
              </AppText>
            </View>
          </View>

          <Mapa
            farmacias={farmaciasDaRota}
            localizacao={posicaoAtual ?? rota?.origem}
            geometria={rota?.geometria}
          />

          <View style={styles.secaoTitulo}>
            <AppText variant="h3">Como você vai?</AppText>
            <AppText variant="caption">Escolha o tipo de rota</AppText>
          </View>

          <View style={styles.modos}>
            {OPCOES_MODO.map((opcao) => {
              const selecionado = modo === opcao.valor;

              return (
                <Pressable
                  key={opcao.valor}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selecionado }}
                  disabled={carregando}
                  onPress={() => escolherModo(opcao.valor)}
                  style={({ pressed }) => [
                    styles.modo,
                    {
                      backgroundColor: selecionado
                        ? colors.primarySoft
                        : colors.surface,
                      borderColor: selecionado
                        ? Colors.primary
                        : colors.border,
                    },
                    pressed && styles.pressionado,
                    carregando && styles.desabilitado,
                  ]}>
                  <MaterialCommunityIcons
                    name={opcao.icone}
                    size={21}
                    color={selecionado ? Colors.primary : colors.textSecondary}
                  />
                  <AppText
                    variant="caption"
                    color={selecionado ? Colors.primary : colors.textSecondary}
                    style={styles.modoTexto}>
                    {opcao.titulo}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <Button
            title="Calcular rota"
            onPress={calcular}
            loading={carregando}
            style={styles.botaoCalcular}
          />

          {erro ? (
            <View style={[styles.erro, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
              <AppText variant="label" color={Colors.danger} style={styles.erroTexto}>
                {erro}
              </AppText>
            </View>
          ) : null}

          {rota ? (
            <View
              style={[
                styles.resumoRota,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <View style={styles.resumoDados}>
                <View style={styles.resumoItem}>
                  <Ionicons name="time-outline" size={21} color={Colors.primary} />
                  <View>
                    <AppText variant="bodyBold">
                      {Math.ceil(rota.tempoSegundos / 60)} min
                    </AppText>
                    <AppText variant="caption">Tempo estimado</AppText>
                  </View>
                </View>

                <View style={[styles.resumoDivisor, { backgroundColor: colors.border }]} />

                <View style={styles.resumoItem}>
                  <Ionicons name="navigate-outline" size={21} color={Colors.primary} />
                  <View>
                    <AppText variant="bodyBold">
                      {(rota.distanciaMetros / 1000).toFixed(1)} km
                    </AppText>
                    <AppText variant="caption">Distância</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.acoesRota}>
                <Button
                  title="Iniciar"
                  loading={iniciando}
                  onPress={iniciarNavegacao}
                  fullWidth={false}
                  style={styles.acaoRota}
                />

                <Button
                  title="Simular"
                  variant="outline"
                  onPress={iniciarSimulacao}
                  disabled={iniciando}
                  fullWidth={false}
                  style={styles.acaoRota}
                />
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <View style={[styles.vazio, { backgroundColor: colors.surface }]}>
          <Ionicons name="location-outline" size={32} color={colors.textMuted} />
          <AppText variant="bodyBold">UBS não encontrada</AppText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cabecalhoTexto: {
    flex: 1,
  },
  destino: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  destinoIcone: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinoTexto: {
    flex: 1,
    gap: 2,
  },
  secaoTitulo: {
    gap: 2,
  },
  modos: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modo: {
    flex: 1,
    minWidth: 64,
    paddingVertical: 10,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  modoTexto: {
    fontWeight: '700',
  },
  pressionado: {
    opacity: 0.75,
  },
  desabilitado: {
    opacity: 0.5,
  },
  botaoCalcular: {
    paddingVertical: Spacing.md,
  },
  erro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  erroTexto: {
    flex: 1,
  },
  resumoRota: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  resumoDados: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  resumoDivisor: {
    width: 1,
    height: 38,
    marginHorizontal: Spacing.sm,
  },
  acoesRota: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  acaoRota: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  vazio: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  telaNavegacao: {
  flex: 1,
  backgroundColor: '#ffffff',
},

topoNavegacao: {
  position: 'absolute',
  top: 0,
  left: 16,
  right: 16,
  zIndex: 10,
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
},

painelInstrucao: {
  flex: 1,
  padding: 16,
  borderRadius: 16,
  backgroundColor: '#10b968',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
},

textosInstrucao: {
  flex: 1,
},

instrucaoAtual: {
  color: '#ffffff',
  fontSize: 18,
  fontWeight: '700',
},

proximaInstrucao: {
  color: 'rgba(255,255,255,0.85)',
  fontSize: 13,
  marginTop: 6,
},
painelResumo: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  paddingTop: 14,
  paddingHorizontal: 24,
  backgroundColor: 'rgba(20,20,20,0.92)',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
},

itemResumo: {
  flex: 1,
  alignItems: 'center',
},

valorResumo: {
  color: '#ffffff',
  fontSize: 20,
  fontWeight: '700',
},

rotuloResumo: {
  color: 'rgba(255,255,255,0.7)',
  fontSize: 12,
  marginTop: 2,
},

separadorResumo: {
  width: 1,
  height: 34,
  backgroundColor: 'rgba(255,255,255,0.25)',
},

});
