import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { AppText } from './app-text';

export const LOADING_CYCLE_MS = 3000;
const AnimatedPath = Animated.createAnimatedComponent(Path);
// Trace the open cross from its upper right tip, around the left, to the lower right.
const CROSS_PATH = 'M126 60 V28 Q126 14 112 14 H80 Q66 14 66 28 V60 H34 Q20 60 20 74 V104 Q20 120 34 120 H66 V150 Q66 164 80 164 H112 Q126 164 126 150 V120';
const CROSS_LENGTH = 421;

export function LoadingScreen({ message }: { message?: string }) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withRepeat(withSequence(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      withTiming(1.5, { duration: 1000, easing: Easing.linear }),
    ), -1);
    return () => cancelAnimation(phase);
  }, [phase]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CROSS_LENGTH * (1 - Math.min(phase.value, 1)),
    opacity: phase.value > 1.3 ? Math.max(0, (1.5 - phase.value) / 0.2) : 1,
  }));

  return <View style={styles.page} accessibilityRole="progressbar" accessibilityLabel={message ?? 'Carregando aplicativo'}>
    <View style={styles.logo}>
      <Image source={require('../../../assets/images/brand/loading-logo-text.png')} resizeMode="contain" style={[styles.logo, styles.frame]} />
      <Svg width={236} height={157} viewBox="0 0 280 185" style={styles.frame}>
        <AnimatedPath d={CROSS_PATH} fill="none" stroke="#FFFFFF" strokeWidth={7}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={[CROSS_LENGTH, CROSS_LENGTH]}
          animatedProps={animatedProps} />
      </Svg>
    </View>
    <View style={styles.indicator}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      {message ? <AppText color="#FFFFFF" style={styles.message}>{message}</AppText> : null}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#00B963', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 236, height: 157 },
  frame: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  indicator: { position: 'absolute', bottom: '8%', alignItems: 'center', gap: 16, paddingHorizontal: 24 },
  message: { textAlign: 'center' },
});
