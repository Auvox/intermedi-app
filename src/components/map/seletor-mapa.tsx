import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { ESTILOS_MAPA, type EstiloMapa } from './estilos-mapa';

type Props = { estilo: EstiloMapa; onChange: (estilo: EstiloMapa) => void; erro?: string };

export function SeletorMapa({ estilo, onChange, erro }: Props) {
  const [aberto, setAberto] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const atual = ESTILOS_MAPA.find(item => item.id === estilo)!;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Escolher modelo do mapa. Atual: ${atual.nome}`}
        onPress={() => setAberto(true)}
        style={[styles.botao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="layers-outline" size={20} color={colors.primaryDark} />
        <AppText variant="label" color={colors.text}>Mapa · {atual.nome}</AppText>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>
      {erro ? <AppText variant="caption" color={colors.danger} accessibilityRole="alert">{erro}</AppText> : null}
      <Modal transparent visible={aberto} animationType="slide" onRequestClose={() => setAberto(false)}>
        <View style={styles.modal}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Fechar modelos do mapa" onPress={() => setAberto(false)} />
          <View style={[styles.painel, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16, marginTop: insets.top + 16 }]} accessibilityViewIsModal>
            <View style={styles.cabecalho}>
              <AppText variant="h3">Modelo do mapa</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={8} onPress={() => setAberto(false)} style={styles.fechar}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.opcoes}>
              {ESTILOS_MAPA.map(item => {
                const selecionado = item.id === estilo;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selecionado }}
                    accessibilityLabel={`${item.nome}, ${item.descricao}`}
                    onPress={() => { onChange(item.id); setAberto(false); }}
                    style={[styles.opcao, { borderColor: selecionado ? colors.primary : colors.border, backgroundColor: selecionado ? colors.primarySoft : colors.surface }]}>
                    <View style={[styles.amostra, { backgroundColor: item.fundo }]} importantForAccessibility="no-hide-descendants">
                      <View style={[styles.agua, { backgroundColor: item.agua }]} />
                      <View style={[styles.rua, { backgroundColor: item.rua }]} />
                      {item.id === '3d' ? <Ionicons name="business" size={26} color="#708776" /> : null}
                    </View>
                    <View style={styles.textos}>
                      <AppText variant="bodyBold">{item.nome}</AppText>
                      <AppText variant="caption" color={colors.textSecondary}>{item.descricao}</AppText>
                    </View>
                    <Ionicons name={selecionado ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={selecionado ? colors.primary : colors.textMuted} />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 44, borderWidth: 1, borderRadius: 14 },
  modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  painel: { maxHeight: '90%', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  opcoes: { gap: 8 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderWidth: 1, borderRadius: 14 },
  amostra: { width: 60, height: 48, borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  agua: { position: 'absolute', width: 24, height: 70, right: -5, transform: [{ rotate: '25deg' }] },
  rua: { position: 'absolute', width: 80, height: 7, transform: [{ rotate: '-30deg' }] },
  textos: { flex: 1, gap: 2 },
});
