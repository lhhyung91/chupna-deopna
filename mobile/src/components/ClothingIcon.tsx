import type { ClothingKind } from '@/lib/outfit';
import { Image } from 'react-native';
import { CLOTHING_ICONS } from '~/lib/clothingIcons';
import { useTheme } from '~/lib/theme';

const SIZE_CLASS = { 32: 'size-8', 56: 'size-14', 76: 'size-19' } as const;

export function ClothingIcon({
  kind,
  size,
}: {
  kind: ClothingKind;
  size: keyof typeof SIZE_CLASS;
}) {
  return (
    <Image
      source={CLOTHING_ICONS[kind][useTheme()]}
      resizeMode="contain"
      accessible={false}
      className={SIZE_CLASS[size]}
    />
  );
}
