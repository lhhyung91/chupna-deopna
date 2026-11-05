import type { ClothingKind } from '@/lib/outfit';
import type { ImageSourcePropType } from 'react-native';

type ThemedIcon = { light: ImageSourcePropType; dark: ImageSourcePropType };

// require는 경로가 고정된 글자여야 번들에 들어가서 옷마다 따로 적는다. Record라 웹에 옷이 늘면 타입 검사에서 걸린다
export const CLOTHING_ICONS: Record<ClothingKind, ThemedIcon> = {
  tank: {
    light: require('~/assets/icons/icon_tank_light.png'),
    dark: require('~/assets/icons/icon_tank_dark.png'),
  },
  tee: {
    light: require('~/assets/icons/icon_tee_light.png'),
    dark: require('~/assets/icons/icon_tee_dark.png'),
  },
  sweatshirt: {
    light: require('~/assets/icons/icon_sweatshirt_light.png'),
    dark: require('~/assets/icons/icon_sweatshirt_dark.png'),
  },
  knit: {
    light: require('~/assets/icons/icon_knit_light.png'),
    dark: require('~/assets/icons/icon_knit_dark.png'),
  },
  cardigan: {
    light: require('~/assets/icons/icon_cardigan_light.png'),
    dark: require('~/assets/icons/icon_cardigan_dark.png'),
  },
  windbreaker: {
    light: require('~/assets/icons/icon_windbreaker_light.png'),
    dark: require('~/assets/icons/icon_windbreaker_dark.png'),
  },
  zip_jacket: {
    light: require('~/assets/icons/icon_zip_jacket_light.png'),
    dark: require('~/assets/icons/icon_zip_jacket_dark.png'),
  },
  fleece: {
    light: require('~/assets/icons/icon_fleece_light.png'),
    dark: require('~/assets/icons/icon_fleece_dark.png'),
  },
  light_puffer: {
    light: require('~/assets/icons/icon_light_puffer_light.png'),
    dark: require('~/assets/icons/icon_light_puffer_dark.png'),
  },
  coat: {
    light: require('~/assets/icons/icon_coat_light.png'),
    dark: require('~/assets/icons/icon_coat_dark.png'),
  },
  puffer: {
    light: require('~/assets/icons/icon_puffer_light.png'),
    dark: require('~/assets/icons/icon_puffer_dark.png'),
  },
  puffer_vest: {
    light: require('~/assets/icons/icon_puffer_vest_light.png'),
    dark: require('~/assets/icons/icon_puffer_vest_dark.png'),
  },
  shorts: {
    light: require('~/assets/icons/icon_shorts_light.png'),
    dark: require('~/assets/icons/icon_shorts_dark.png'),
  },
  shorts_button: {
    light: require('~/assets/icons/icon_shorts_button_light.png'),
    dark: require('~/assets/icons/icon_shorts_button_dark.png'),
  },
  pants: {
    light: require('~/assets/icons/icon_pants_light.png'),
    dark: require('~/assets/icons/icon_pants_dark.png'),
  },
  wide_pants: {
    light: require('~/assets/icons/icon_wide_pants_light.png'),
    dark: require('~/assets/icons/icon_wide_pants_dark.png'),
  },
  puffer_pants: {
    light: require('~/assets/icons/icon_puffer_pants_light.png'),
    dark: require('~/assets/icons/icon_puffer_pants_dark.png'),
  },
};
