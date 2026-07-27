import { Image } from 'react-native';

const WORDMARK_ASPECT = 1646 / 1046;
const WORDMARK_LIGHT_ASPECT = 581 / 370;
const PILL_ASPECT = 324 / 938;

export type WordmarkVariant = 'colored' | 'light';

export type WordmarkProps = {
  height?: number;
  variant?: WordmarkVariant;
};

export function Wordmark({ height = 32, variant = 'colored' }: WordmarkProps) {
  const isLight = variant === 'light';

  return (
    <Image
      source={
        isLight
          ? require('../../../assets/images/brand/wordmark-light.png')
          : require('../../../assets/images/brand/wordmark.png')
      }
      resizeMode="contain"
      style={{
        height,
        width: height * (isLight ? WORDMARK_LIGHT_ASPECT : WORDMARK_ASPECT),
      }}
    />
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
