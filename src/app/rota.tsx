import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { acompanharLocalizacao, type Localizacao, } from '@/services/navegacao';
import { BackButton } from "@/components/ui/back-button";
import { AppText } from "@/components/ui/app-text";
import { getPharmacyById } from "@/constants/mock-data";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { calcularCaminhada, type Rota, type ModoLocomocao, } from '@/services/caminhada';
import Mapa from "@/components/map/mapa";
import { simularPercurso } from '@/services/simulacao';
import { calcularDistancia } from '@/services/progresso-rota';

export default function RotaScreen() {
  const { farmaciaId } = useLocalSearchParams<{
    farmaciaId?: string | string[];
  }>();

  const id = Array.isArray(farmaciaId) ? farmaciaId[0] : farmaciaId;

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
  const [simulando, setSimulando] = useState(false);
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
  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <BackButton tone="dark" />

      {farmacia ? (
        <>
          <AppText variant="h3">{farmacia.name}</AppText>
          <AppText>{farmacia.address}</AppText>

          <Mapa
            farmacias={farmaciasDaRota}
            localizacao={posicaoAtual ?? rota?.origem}
            geometria={rota?.geometria}
          />
          <AppText variant="h3">Como você vai?</AppText>

          <Button
            title="A pé"
            variant={modo === 'pedestrian' ? 'solid' : 'outline'}
            onPress={() => escolherModo('pedestrian')}
            disabled={carregando}
          />

          <Button
            title="Carro"
            variant={modo === 'auto' ? 'solid' : 'outline'}
            onPress={() => escolherModo('auto')}
            disabled={carregando}
          />

          <Button
            title="Moto"
            variant={modo === 'motorcycle' ? 'solid' : 'outline'}
            onPress={() => escolherModo('motorcycle')}
            disabled={carregando}
          />

          <Button
            title="Bicicleta"
            variant={modo === 'bicycle' ? 'solid' : 'outline'}
            onPress={() => escolherModo('bicycle')}
            disabled={carregando}
          />
          <Button
            title="Calcular rota"
            onPress={calcular}
            loading={carregando}
          />

          {erro ? <AppText>{erro}</AppText> : null}

          {rota ? (
            <>
              <Button
                title={navegando ? 'Encerrar rota' : 'Iniciar rota'}
                loading={iniciando}
                onPress={navegando ? encerrarNavegacao : iniciarNavegacao}
              />

              <Button
                title={simulando ? 'Parar simulação' : 'Simular percurso'}
                variant="outline"
                onPress={simulando ? encerrarNavegacao : iniciarSimulacao}
                disabled={iniciando}
              />
              <AppText>
                Distância: {(rota.distanciaMetros / 1000).toFixed(2)} km
              </AppText>

              <AppText>
                Tempo estimado: {Math.ceil(rota.tempoSegundos / 60)} minutos
              </AppText>

              {navegando && rota.passos[passoAtual] ? (
                <>
                  <AppText variant="h3">Orientação atual</AppText>

                  <AppText>
                    {rota.passos[passoAtual].instrucao}
                  </AppText>

                  {rota.passos[passoAtual + 1] ? (
                    <>
                      <AppText>Próxima manobra</AppText>

                      <AppText>
                        {rota.passos[passoAtual + 1].instrucao}
                      </AppText>
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <AppText>UBS não encontrada.</AppText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: 24,
    gap: 16,
  },
});
