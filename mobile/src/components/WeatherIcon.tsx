import type { Sky } from '@/lib/weather';
import { Image, type ImageSourcePropType } from 'react-native';

export type WeatherIconKind =
  Sky | 'wind' | 'umbrella' | 'hot' | 'good' | 'cold';

// 테마에 따라 바뀌지 않는 아이콘(웹 WeatherIcon과 같은 파일)
const FILES: Record<WeatherIconKind, ImageSourcePropType> = {
  sunny: require('~/assets/icons/icon_sunny.png'),
  mostlyCloudy: require('~/assets/icons/icon_mostly_cloudy.png'),
  cloudy: require('~/assets/icons/icon_cloudy.png'),
  rain: require('~/assets/icons/icon_rain.png'),
  shower: require('~/assets/icons/icon_rain.png'),
  sleet: require('~/assets/icons/icon_sleet.png'),
  snow: require('~/assets/icons/icon_snow.png'),
  wind: require('~/assets/icons/icon_wind.png'),
  umbrella: require('~/assets/icons/icon_umbrella.png'),
  hot: require('~/assets/icons/icon_cloud_sun_thermometer.png'),
  good: require('~/assets/icons/icon_cloud_smile.png'),
  cold: require('~/assets/icons/icon_cloud_snowflake_thermometer.png'),
};

const SIZE_CLASS = {
  32: 'size-8',
  36: 'size-9',
  44: 'size-11',
  56: 'size-14',
} as const;

// 장식용이라 읽지 않고, 의미는 옆 글자가 전달한다
export function WeatherIcon({
  kind,
  size,
}: {
  kind: WeatherIconKind;
  size: keyof typeof SIZE_CLASS;
}) {
  return (
    <Image
      source={FILES[kind]}
      resizeMode="contain"
      accessible={false}
      className={`shrink-0 ${SIZE_CLASS[size]}`}
    />
  );
}
