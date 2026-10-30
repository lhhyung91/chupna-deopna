import type { Sky } from '@/lib/weather';
import Image from 'next/image';

export type WeatherIconKind =
  Sky | 'wind' | 'umbrella' | 'hot' | 'good' | 'cold';

// 테마에 따라 바뀌지 않는 아이콘
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

type Props = { kind: WeatherIconKind; size: 24 | 32 | 36 | 40 | 44 | 56 | 96 };

// 화면 크기는 rem으로 잡아 좁은 폰에서 글자와 같이 줄어들게 한다(width/height는 받을 이미지 크기).
const SIZE_CLASS: Record<Props['size'], string> = {
  24: 'size-6',
  32: 'size-8',
  36: 'size-9',
  40: 'size-10',
  44: 'size-11',
  56: 'size-14',
  96: 'size-24',
};

// 장식용 아이콘이라 alt를 비우고, 의미는 옆의 텍스트 라벨이 전달한다.
export function WeatherIcon({ kind, size }: Props) {
  return (
    <Image
      src={`/icons/${FILES[kind]}.png`}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${SIZE_CLASS[size]}`}
    />
  );
}
