import type { Sky } from '@/lib/weather';
import Image from 'next/image';

export type WeatherIconKind =
  Sky | 'wind' | 'umbrella' | 'hot' | 'good' | 'cold';

const FILES: Record<WeatherIconKind, string> = {
  sunny: 'icon_sunny',
  mostlyCloudy: 'icon_mostly_cloudy',
  cloudy: 'icon_cloudy',
  rain: 'icon_rain',
  shower: 'icon_rain',
  sleet: 'icon_sleet',
  snow: 'icon_snow',
  wind: 'icon_wind',
  umbrella: 'icon_umbrella',
  hot: 'icon_cloud_sun_thermometer',
  good: 'icon_cloud_smile',
  cold: 'icon_cloud_snowflake_thermometer',
};

type Props = { kind: WeatherIconKind; size: 24 | 32 | 40 | 56 | 96 };

// 장식용 아이콘이라 alt를 비우고, 의미는 옆의 텍스트 라벨이 전달한다.
export function WeatherIcon({ kind, size }: Props) {
  return (
    <Image
      src={`/icons/${FILES[kind]}.png`}
      alt=""
      width={size}
      height={size}
      className="shrink-0"
    />
  );
}
