import { StyleSheet, View } from 'react-native';
import type { PillKind } from '@/utils/medicine-style';

// Desenho simples do comprimido quando o remédio não tem foto.
export function PillVisual({ kind = 'round', size = 28, colors: pair, back = false }: { kind?: PillKind; size?: number; colors?: [string, string]; back?: boolean }) {
  const [a, b] = pair ?? ['#FFFFFF', '#FFFFFF'];
  if (kind === 'capsule') {
    const w = size * 1.5, h = size * 0.62;
    return <View style={[styles.capsule, { width: w, height: h, borderRadius: h / 2 }]}>
      <View style={{ flex: 1, backgroundColor: a }} />
      <View style={{ flex: 1, backgroundColor: b }} />
    </View>;
  }
  if (kind === 'oval') {
    const w = size * 1.4, h = size * 0.75;
    return <View style={[styles.tablet, { width: w, height: h, borderRadius: h / 2, backgroundColor: a }]} />;
  }
  return <View style={[styles.tablet, { width: size, height: size, borderRadius: size / 2, backgroundColor: a, boxShadow: size > 60 ? '0 14px 30px rgba(13,35,28,0.18), inset 0 -6px 12px rgba(0,0,0,0.06)' : undefined }]}>
    {!back && <View style={[styles.groove, { height: size * 0.66, width: Math.max(1.5, size / 70) }]} />}
  </View>;
}

const styles = StyleSheet.create({
  capsule: { flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(13,35,28,0.12)' },
  tablet: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(13,35,28,0.14)' },
  groove: { backgroundColor: 'rgba(13,35,28,0.22)', borderRadius: 2 },
});
