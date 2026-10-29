import { formatTemp } from '@/lib/format';
import type { CommuteWeather, DayWeather, Sky } from '@/lib/weather';

export type ClothingKind =
  | 'tank'
  | 'tee'
  | 'sweatshirt'
  | 'knit'
  | 'cardigan'
  | 'windbreaker'
  | 'zip_jacket'
  | 'fleece'
  | 'light_puffer'
  | 'coat'
  | 'puffer'
  | 'puffer_vest'
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

const THERMAL_TIP = '안에 히트텍 입으면 좋아요';
const OUTERS = new Set<ClothingKind>([
  'cardigan',
  'windbreaker',
  'zip_jacket',
  'fleece',
  'light_puffer',
  'coat',
  'puffer',
]);

// 출근길 체감온도가 minFeel 이상인 첫 단계를 쓴다.
// 출근길은 하루 중 가장 추운 축이라, 하루 평균 기준인 흔한 기온별 옷차림 표보다 경계를 3°씩 낮췄다.
// 하의는 따뜻함이 실제로 달라지는 반바지·긴바지·기모 바지 세 가지만 구분한다(면바지·청바지 차이는 1~2° 수준).
export const LEVELS: OutfitLevel[] = [
  {
    minFeel: 22,
    items: [
      { label: '반팔', kind: 'tee' },
      { label: '반바지', kind: 'shorts' },
    ],
  },
  {
    minFeel: 20,
    items: [
      { label: '반팔', kind: 'tee' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 17,
    items: [
      { label: '가디건', kind: 'cardigan' },
      { label: '반팔', kind: 'tee' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 14,
    items: [
      { label: '맨투맨', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 11,
    items: [
      { label: '바람막이', kind: 'windbreaker' },
      { label: '맨투맨', kind: 'sweatshirt' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 9,
    items: [
      { label: '자켓', kind: 'zip_jacket' },
      { label: '니트', kind: 'knit' },
      { label: '긴바지', kind: 'pants' },
    ],
    tip: '플리스도 좋아요',
  },
  // 경량 패딩이 바람을 더 막아서 코트보다 한 단계 추운 날에 둔다(사용자 체감 기준).
  {
    minFeel: 6,
    items: [
      { label: '코트', kind: 'coat' },
      { label: '니트', kind: 'knit' },
      { label: '긴바지', kind: 'pants' },
    ],
  },
  {
    minFeel: 2,
    items: [
      { label: '경량 패딩', kind: 'light_puffer' },
      { label: '니트', kind: 'knit' },
      { label: '긴바지', kind: 'pants' },
    ],
    tip: '추우면 안에 히트텍 입어요',
  },
  {
    minFeel: -3,
    items: [
      { label: '패딩', kind: 'puffer' },
      { label: '니트', kind: 'knit' },
      { label: '긴바지', kind: 'pants' },
    ],
    tip: THERMAL_TIP,
  },
  {
    minFeel: -Infinity,
    items: [
      { label: '패딩', kind: 'puffer' },
      { label: '니트', kind: 'knit' },
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
  if (minFeel === -Infinity) {
    return `${formatTemp(LEVELS[index - 1].minFeel - 1)} 이하`;
  }
  if (index === 0) return `${formatTemp(minFeel)} 이상`;
  const max = formatTemp(LEVELS[index - 1].minFeel - 1);
  return `${formatTemp(minFeel).slice(0, -1)}~${max}`;
}

const outerOf = (level: OutfitLevel) =>
  level.items.find((item) => OUTERS.has(item.kind));

// lead("퇴근길 11°")는 굵게, text는 그 뒤에 띄어 쓴다. 375px 한 줄에 들어가는 길이로만 쓴다.
export type EveningNote = { lead: string; text: string };

// 옷은 출근길 기준으로 고르고, 퇴근길엔 그 옷으로 어떤지 짧게 알려준다. 말투는 해요체 권유로 맞춘다.
export function getEveningNote(
  morning: CommuteWeather,
  evening: CommuteWeather,
  offset: number
): EveningNote | null {
  const morningIndex = getLevelIndex(morning.feel - offset);
  const eveningIndex = getLevelIndex(evening.feel - offset);
  if (morningIndex === eveningIndex) return null;

  const morningOuter = outerOf(LEVELS[morningIndex]);
  const eveningOuter = outerOf(LEVELS[eveningIndex]);
  // 숫자는 옷을 고른 값과 같은 체감이다
  const lead = `${evening.label}길 ${formatTemp(evening.feel)}`;

  // 겉옷 이름 뒤 조사는 받침마다 달라져서 붙이지 않는다. 단계 번호가 작을수록 따뜻한 단계다
  if (eveningIndex < morningIndex) {
    if (morningOuter && !eveningOuter) {
      return { lead, text: `${morningOuter.label} 벗어도 돼요` };
    }
    return { lead, text: '아침보다 덜 추워요' };
  }
  if (!morningOuter && eveningOuter) {
    return { lead, text: `쌀쌀해요, ${eveningOuter.label} 챙겨요` };
  }
  return { lead, text: '아침보다 추워요, 한 겹 더 챙겨요' };
}

const isWet = (sky: Sky) =>
  sky === 'rain' || sky === 'sleet' || sky === 'shower' || sky === 'snow';
const isSnowy = (sky: Sky) => sky === 'snow' || sky === 'sleet';

// 내일 탭 첫 줄. 저녁에 내일 옷을 고를 때 오늘 아침과 얼마나 다른지가 가장 궁금하다.
export function compareMornings(
  today: CommuteWeather,
  tomorrow: CommuteWeather
) {
  // 화면에 보이는 반올림 값끼리 비교해야 문장 숫자와 칸 숫자가 맞는다
  const diff = Math.round(tomorrow.feel) - Math.round(today.feel);
  const word = diff < 0 ? '추워요' : '따뜻해요';
  if (Math.abs(diff) >= 5) return `오늘 아침보다 ${Math.abs(diff)}° ${word}`;
  if (Math.abs(diff) >= 2) return `오늘 아침보다 조금 ${word}`;
  return '오늘 아침과 비슷해요';
}

// 비·눈 배너 하나. 우산 배너는 눈도 "비 N%"로 적어서, 눈이 오면 눈 배너를 먼저 고른다.
export const getWetBanner = (banners: Banner[]) =>
  banners.find((banner) => banner.kind === 'snow') ??
  banners.find((banner) => banner.kind === 'umbrella');

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
      text: '우산 챙겨요',
    });
  }

  if (isSnowy(day.sky) || day.commutes.some((c) => isSnowy(c.sky))) {
    banners.push({ kind: 'snow', title: '눈 와요', text: '길이 미끄러워요' });
  }

  if (day.commutes.some((c) => c.wind >= STRONG_WIND)) {
    banners.push({
      kind: 'wind',
      title: '바람 강해요',
      text: '더 춥게 느껴져요',
    });
  }

  if (day.max - morning.temp >= TEMP_GAP) {
    banners.push({
      kind: 'tempGap',
      title: `아침 ${formatTemp(morning.temp)} → 낮 ${formatTemp(day.max)}`,
      text: '낮엔 겉옷 벗어요',
    });
  }

  return banners;
}
