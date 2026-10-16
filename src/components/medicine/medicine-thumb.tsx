import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { toneColors, type Tone } from '@/constants/theme';
import { PillVisual } from './pill-visual';
import type { PillKind } from '@/utils/medicine-style';

// Miniatura quadrada do remédio: foto do banco ou o desenho do comprimido.
export function MedicineThumb({ uri, tone = 'neutral', kind = 'round', size = 58, name }: { uri?: string | null; tone?: Tone; kind?: PillKind; size?: number; name?: string }) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const bg = tone === 'neutral' ? colors.surfaceMuted : toneColors(colors, tone).bg;
  const capsule: [string, string] | undefined = kind === 'capsule' ? [tone === 'orange' ? '#EE8F68' : '#7F74E0', tone === 'orange' ? '#FFFFFF' : '#EF8FA6'] : undefined;
  return <View style={[styles.frame, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg }]}>
    {uri && !failed ? <Image source={{ uri }} style={styles.image} resizeMode="contain" accessibilityLabel={name ? `Foto de ${name}` : undefined} onError={() => setFailed(true)} />
      : <PillVisual kind={kind} size={size * 0.48} colors={capsule} />}
  </View>;
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '86%', height: '86%' },
});
