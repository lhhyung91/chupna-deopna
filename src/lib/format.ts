import type { Sky } from '@/lib/weather';

// 음수는 하이픈 대신 유니코드 마이너스로 써서 범위 기호(~)·문장 부호와 헷갈리지 않게 한다.
export const formatTemp = (temp: number) => {
  const rounded = Math.round(temp);
  return `${rounded < 0 ? '−' : ''}${Math.abs(rounded)}°`;
};

export const SKY_LABEL: Record<Sky, string> = {
  sunny: '맑음',
  mostlyCloudy: '구름많음',
  cloudy: '흐림',
  rain: '비',
  sleet: '비/눈',
  snow: '눈',
  shower: '소나기',
};
