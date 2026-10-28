import type { Sky } from '@/lib/weather';

export const formatTemp = (temp: number) => `${Math.round(temp)}°`;

export const SKY_LABEL: Record<Sky, string> = {
  sunny: '맑음',
  mostlyCloudy: '구름많음',
  cloudy: '흐림',
  rain: '비',
  sleet: '비/눈',
  snow: '눈',
  shower: '소나기',
};
