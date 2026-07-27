import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Wordmark } from '@/components/ui/brand-mark';
import { CrossPatternBackground } from '@/components/ui/cross-pattern-background';
import { Colors, Spacing } from '@/constants/theme';

const DOT_COUNT = 4;
const REDIRECT_DELAY = 1400;

export default function SplashRedirectScreen() {
  const router = useRouter();
  const [dotOpacities] = useState(() =>
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.3)),
  );

  useEffect(() => {
    const animations = dotOpacities.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(value, {
            toValue: 1,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((DOT_COUNT - 1 - index) * 150),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    const timeout = setTimeout(() => router.replace('/welcome'), REDIRECT_DELAY);

    return () => {
      animations.forEach((animation) => animation.stop());
      clearTimeout(timeout);
    };
  }, [dotOpacities, router]);

  return (
    <View style={styles.container}>
      <CrossPatternBackground />

      <View style={styles.center}>
        <Wordmark height={90} variant="light" />
      </View>

      <View style={styles.dots}>
        {dotOpacities.map((opacity, index) => (
          <Animated.View key={index} style={[styles.dot, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: '30%',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textOnPrimary,
  },
});
