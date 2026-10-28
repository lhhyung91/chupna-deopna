import { formatTemp } from '@/lib/format';
import type { CommuteWeather, DayWeather, Sky } from '@/lib/weather';

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

export type OutfitLevel = {
  minFeel: number;
  items: ClothingItem[];
  tip?: string;
};

const THERMAL_TIP = '히트텍 챙기면 좋아요';
const OUTERS = new Set<ClothingKind>(['zip_jacket', 'puffer']);

// 체감온도가 minFeel 이상인 첫 단계를 쓴다.
// 하의는 따뜻함이 실제로 달라지는 반바지·긴바지·기모 바지 세 가지만 구분한다(면바지·청바지 차이는 1~2° 수준).
export const LEVELS: OutfitLevel[] = [
  {
    minFeel: 25,
    items: [
      { label: '반팔', kind: 'tee' },
      { label: '반바지', kind: 'shorts' },
    ],
  },
  {
    minFeel: 23,
    items: [
      { label: '반팔', kind: 'tee' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 20,
    items: [
      { label: '긴팔', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 17,
    items: [
      { label: '맨투맨', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 12,
    items: [
      { label: '자켓', kind: 'zip_jacket' },
      { label: '긴팔', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 9,
    items: [
      { label: '트렌치코트', kind: 'zip_jacket' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 5,
    items: [
      { label: '코트', kind: 'zip_jacket' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 0,
    items: [
      { label: '패딩', kind: 'puffer' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
    tip: THERMAL_TIP,
  },
  {
    minFeel: -Infinity,
    items: [
      { label: '패딩', kind: 'puffer' },
      { label: '니트', kind: 'sweatshirt' },
      { label: '기모 바지', kind: 'wide_pants' },
    ],
    tip: THERMAL_TIP,
  },
];

export function getLevelIndex(feel: number) {
  const rounded = Math.round(feel);
  const index = LEVELS.findIndex(({ minFeel }) => rounded >= minFeel);
  return index === -1 ? LEVELS.length - 1 : index;
}

// 기온별 표에 쓰는 범위 문구. 위 단계의 minFeel 바로 아래까지가 이 단계다.
export function levelRange(index: number) {
  const { minFeel } = LEVELS[index];
  if (minFeel === -Infinity) return '영하';
  if (index === 0) return `${minFeel}° 이상`;
  return `${minFeel}–${LEVELS[index - 1].minFeel - 1}°`;
}

const outerOf = (level: OutfitLevel) =>
  level.items.find((item) => OUTERS.has(item.kind));

// 하루 한 벌(chosenIndex)을 입되, 출근·퇴근 단계가 다르면 겉옷으로 어떻게 조절할지 알려준다.
export function getLayerHint(
  commutes: CommuteWeather[],
  offset: number,
  chosenIndex: number
): string | null {
  const [morning, evening] = commutes;
  const colder = morning.feel <= evening.feel ? morning : evening;
  const warmer = colder === morning ? evening : morning;
  const colderLevel = LEVELS[getLevelIndex(colder.feel - offset)];
  const warmerLevel = LEVELS[getLevelIndex(warmer.feel - offset)];
  if (colderLevel === warmerLevel) return null;

  const chosenOuter = outerOf(LEVELS[chosenIndex]);
  const colderOuter = outerOf(colderLevel);
  const at = (c: CommuteWeather) => `${c.label}길 ${formatTemp(c.feel)}`;
  const feel = (c: CommuteWeather) => (c === colder ? '쌀쌀' : '포근');

  if (!chosenOuter && colderOuter) {
    return `${at(colder)}는 쌀쌀해요 · ${colderOuter.label} 챙기세요`;
  }
  if (chosenOuter && !outerOf(warmerLevel)) {
    // 퇴근이 더 추우면 아침엔 덥더라도 들고 나가야 한다
    return warmer === morning
      ? `${at(evening)}는 쌀쌀해요 · ${chosenOuter.label} 챙겨 나가세요`
      : `${at(evening)}엔 ${chosenOuter.label} 벗어도 돼요`;
  }
  if (chosenOuter) {
    return `${at(morning)}는 ${feel(morning)}하고 ${at(evening)}는 ${feel(evening)}해요 · 겉옷으로 조절하세요`;
  }
  // 겉옷이 없는 단계끼리(맨투맨 ↔ 긴팔)는 조절할 게 없다
  return null;
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
