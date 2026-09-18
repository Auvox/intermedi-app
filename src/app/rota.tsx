import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { BackButton } from "@/components/ui/back-button";
import { AppText } from "@/components/ui/app-text";
import { getPharmacyById } from "@/constants/mock-data";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { calcularCaminhada, type Rota } from "@/services/caminhada";
import Mapa from "@/components/map/mapa";

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

  async function calcular() {
    if (!farmacia || carregando) return;

    setCarregando(true);
    setErro("");
    setRota(null);

    try {
      const resultado = await calcularCaminhada(farmacia);
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

    if (!farmacia || carregando) return;
    {
      setNavegando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <BackButton tone="dark" />

      {farmacia ? (
        <>
          <AppText variant="h3">{farmacia.name}</AppText>
          <AppText>{farmacia.address}</AppText>

          <Mapa
            farmacias={farmaciasDaRota}
            localizacao={rota?.origem}
            geometria={rota?.geometria}
          />

          <Button
            title="Calcular caminhada"
            onPress={calcular}
            loading={carregando}
          />

          {erro ? <AppText>{erro}</AppText> : null}

          {rota ? (
            <>
              <Button
                title={navegando ? "Encerrar rota" : "Iniciar rota"}
                onPress={() => setNavegando((valorAtual) => !valorAtual)}
              />
              <AppText>
                Distância: {(rota.distanciaMetros / 1000).toFixed(2)} km
              </AppText>

              <AppText>
                Tempo estimado: {Math.ceil(rota.tempoSegundos / 60)} minutos
              </AppText>

              {navegando && rota.passos?.[0] ? (
                <>
                  <AppText variant="h3">Orientação inicial</AppText>
                  <AppText>{rota.passos[0].instrucao}</AppText>

                  {rota.passos[1] ? (
                    <>
                      <AppText>
                        Próxima manobra em aproximadamente{" "}
                        {Math.round(rota.passos[0].distanciaMetros)} m
                      </AppText>

                      <AppText>{rota.passos[1].instrucao}</AppText>
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
