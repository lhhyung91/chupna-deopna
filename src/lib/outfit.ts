import type { DayWeather, Sky } from '@/lib/weather';

export type ClothingKind =
  | 'tank'
  | 'tee'
  | 'sweatshirt'
  | 'zip_jacket'
  | 'puffer'
  | 'shorts'
  | 'shorts_button'
  | 'pants'
  | 'wide_pants'
  | 'puffer_pants';

export type ClothingItem = { label: string; kind: ClothingKind };

export type BannerKind = 'tempGap' | 'umbrella' | 'snow' | 'wind';

export type Banner = { kind: BannerKind; title: string; text: string };

const TEMP_GAP = 10;
const RAIN_POP = 60;
const STRONG_WIND = 9;

// 체감온도가 minFeel 이상인 첫 단계를 쓴다.
// 기온별 옷차림 표는 기온 기준이라 체감온도에 그대로 쓰면 하의가 과해져서, 하의는 영하 전까지 청바지·슬랙스로 둔다.
const LEVELS: { minFeel: number; items: ClothingItem[] }[] = [
  {
    minFeel: 28,
    items: [
      { label: '반팔', kind: 'tee' },
      { label: '반바지', kind: 'shorts' },
    ],
  },
  {
    minFeel: 23,
    items: [
      { label: '반팔', kind: 'tee' },
      { label: '면바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 20,
    items: [
      { label: '긴팔', kind: 'sweatshirt' },
      { label: '슬랙스', kind: 'pants' },
    ],
  },
  {
    minFeel: 17,
    items: [
      { label: '맨투맨', kind: 'sweatshirt' },
      { label: '청바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 12,
    items: [
      { label: '자켓', kind: 'zip_jacket' },
      { label: '긴팔', kind: 'sweatshirt' },
      { label: '슬랙스', kind: 'pants' },
    ],
  },
  {
    minFeel: 9,
    items: [
      { label: '트렌치코트', kind: 'zip_jacket' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '청바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 5,
    items: [
      { label: '코트', kind: 'zip_jacket' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '청바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 0,
    items: [
      { label: '패딩', kind: 'puffer' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '청바지', kind: 'pants' },
    ],
  },
  {
    minFeel: -Infinity,
    items: [
      { label: '패딩', kind: 'puffer' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '기모 바지', kind: 'wide_pants' },
    ],
  },
];

export function recommendOutfit(feel: number): ClothingItem[] {
  const rounded = Math.round(feel);
  const level =
    LEVELS.find(({ minFeel }) => rounded >= minFeel) ??
    LEVELS[LEVELS.length - 1];
  return level.items;
}

const isWet = (sky: Sky) =>
  sky === 'rain' || sky === 'sleet' || sky === 'shower' || sky === 'snow';
const isSnowy = (sky: Sky) => sky === 'snow' || sky === 'sleet';

// 놓치면 곤란한 순서(우산 > 눈 > 강풍 > 일교차)로 쌓는다.
export function getBanners(day: DayWeather): Banner[] {
  const banners: Banner[] = [];
  const [morning] = day.commutes;

  const rainy = day.commutes.filter((c) => c.pop >= RAIN_POP || isWet(c.sky));
  if (rainy.length > 0) {
    const wettest = rainy.reduce((a, b) => (b.pop > a.pop ? b : a));
    const when =
      rainy.length === day.commutes.length ? '출퇴근' : wettest.label;
    banners.push({
      kind: 'umbrella',
      title: `${when}길 비 ${wettest.pop}%`,
      text: '우산 챙기세요',
    });
  }

  if (isSnowy(day.sky) || day.commutes.some((c) => isSnowy(c.sky))) {
    banners.push({ kind: 'snow', title: '눈 소식', text: '미끄럼 주의' });
  }

  if (day.commutes.some((c) => c.wind >= STRONG_WIND)) {
    banners.push({
      kind: 'wind',
      title: '바람이 강해요',
      text: '실제보다 춥게 느껴져요',
    });
  }

  if (day.max - morning.temp >= TEMP_GAP) {
    banners.push({
      kind: 'tempGap',
      title: `아침 ${Math.round(morning.temp)}° → 낮 ${Math.round(day.max)}°`,
      text: '겉옷 챙기고 낮엔 벗어도 돼요',
    });
  }

  return banners;
}
