import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

type Props = { uri?: string | null; name: string; large?: boolean };
export function MedicinePhoto(props: Props) {
  return <Photo key={props.uri || 'sem-foto'} {...props} />;
}
function Photo({ uri, name, large = false }: Props) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(uri) && !failed;
  return (
    <View style={[styles.frame, large ? styles.large : styles.small, !showPhoto && styles.placeholder]}>
      {showPhoto ? <Image source={{ uri: uri! }} style={styles.image} resizeMode="contain"
        accessibilityLabel={`Foto de ${name}`} onError={() => setFailed(true)} />
        : <Ionicons name="medkit" size={large ? 64 : 25} color={Colors.textOnPrimary} accessibilityLabel={`${name} sem foto disponível`} />}
    </View>
  );
}
const styles = StyleSheet.create({
  frame: { borderRadius: Radius.md, overflow: 'hidden', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  small: { width: 52, height: 52 },
  large: { width: '100%', height: 240 },
  placeholder: { backgroundColor: Colors.primary },
  image: { width: '100%', height: '100%' },
});