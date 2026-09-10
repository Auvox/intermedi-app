import { Image, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/context/theme-context';

// Display only the lettering of the original asset, excluding the surrounding cross.
const WORDMARK_CROP = { x: 44, y: 132, width: 530, height: 96 };
const PILL_ASPECT = 324 / 938;

export type WordmarkVariant = 'colored' | 'light';

export type WordmarkProps = {
  height?: number;
  variant?: WordmarkVariant;
};

export function Wordmark({ height = 36, variant }: WordmarkProps) {
  const { isDark, colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLight = variant ? variant === 'light' : isDark;
  const scale = Math.min(height / WORDMARK_CROP.height, Math.max(1, width - 48) / WORDMARK_CROP.width);

  return (
    <View
      accessibilityLabel="Intermedi"
      accessibilityRole="image"
      accessible
      style={{
        height: WORDMARK_CROP.height * scale,
        width: WORDMARK_CROP.width * scale,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
      <Image
        source={require('../../../assets/images/brand/wordmark-light.png')}
        tintColor={isLight ? colors.textOnPrimary : colors.primary}
        accessible={false}
        style={{
          position: 'absolute',
          width: 581 * scale,
          height: 370 * scale,
          left: -WORDMARK_CROP.x * scale,
          top: -WORDMARK_CROP.y * scale,
        }}
      />
    </View>
  );
}

export type PillIconProps = {
  size?: number;
  color?: string;
};

export function PillIcon({ size = 24, color }: PillIconProps) {
  return (
    <Image
      source={require('../../../assets/images/brand/pill.png')}
      resizeMode="contain"
      tintColor={color}
      style={{ width: size * PILL_ASPECT, height: size }}
    />
  );
}
