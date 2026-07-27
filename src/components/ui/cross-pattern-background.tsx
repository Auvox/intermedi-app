import { Image, StyleSheet } from 'react-native';

export function CrossPatternBackground() {
  return (
    <Image
      source={require('../../../assets/images/brand/cross-pattern.png')}
      resizeMode="cover"
      style={styles.image}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
    pointerEvents: 'none',
  },
});
