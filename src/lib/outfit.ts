import { formatTemp, precipName } from '@/lib/format';
import type {
  CommuteWeather,
  DayWeather,
  HourlyItem,
  Sky,
} from '@/lib/weather';

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

// 옷은 출근길 기준이라, 퇴근길에 그 옷으로 달라지는 점만 짧게 알려준다. 덜 추워지는 건 차이 배지가 이미 말한다.
export function getEveningTip(
  morning: CommuteWeather,
  evening: CommuteWeather,
  offset: number
): string | null {
  const morningIndex = getLevelIndex(morning.feel - offset);
  const eveningIndex = getLevelIndex(evening.feel - offset);
  if (morningIndex === eveningIndex) return null;

  const morningOuter = outerOf(LEVELS[morningIndex]);
  const eveningOuter = outerOf(LEVELS[eveningIndex]);
  const when = `${evening.label}길엔`;

  // 겉옷 이름 뒤 조사는 받침마다 달라져서 붙이지 않는다. 단계 번호가 작을수록 따뜻한 단계다
  if (eveningIndex < morningIndex) {
    return morningOuter && !eveningOuter
      ? `${when} ${morningOuter.label} 벗어도 돼요`
      : null;
  }
  if (!morningOuter && eveningOuter) {
    return `${when} ${eveningOuter.label} 챙겨요`;
  }
  return `${when} 한 겹 더 챙겨요`;
}

const isWet = (sky: Sky) =>
  sky === 'rain' || sky === 'sleet' || sky === 'shower' || sky === 'snow';
const isSnowy = (sky: Sky) => sky === 'snow' || sky === 'sleet';
// 우산·요약 문구·출퇴근 비 표시가 같은 기준을 쓴다
export const isRainy = ({ pop, sky }: { pop: number; sky: Sky }) =>
  pop >= RAIN_POP || isWet(sky);

// 옷 카드의 "+ 우산" 칸. 출퇴근 중 한 번이라도 비·눈이면 챙긴다.
export const needsUmbrella = (day: DayWeather) => day.commutes.some(isRainy);

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

  const rainy = day.commutes.filter(isRainy);
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

// 출근·퇴근 둘 다면 "출퇴근길", 하나면 그쪽 길
const whenOf = (commutes: CommuteWeather[], fallback: string) =>
  commutes.length >= 2
    ? '출퇴근길'
    : commutes.length === 1
      ? `${commutes[0].label}길`
      : fallback;

// 오늘 안에 처음 비·눈이 오는 시각. 시간대별 칸은 자정을 넘기면 시각이 작아져서 거기서 멈춘다.
function firstWetHour(hourly: HourlyItem[]) {
  let last = -1;
  for (const item of hourly) {
    const hour = Number.parseInt(item.label, 10);
    // "지금" 칸은 위 하늘 문구가 이미 말한다
    if (Number.isNaN(hour)) continue;
    if (hour < last) return null;
    last = hour;
    if (isRainy(item)) return item;
  }
  return null;
}

// 하늘 문구 아래 한 줄. 비가 언제 오는지가 가장 궁금하고(지금 오는 중이면 생략), 없으면 일교차를 알린다.
export function getSkyNote(day: DayWeather, nowSky?: Sky) {
  const start = nowSky && isWet(nowSky) ? null : firstWetHour(day.hourly);
  if (start) return `${start.label}부터 ${precipName(start.sky)}`;
  if (day.max - day.commutes[0].temp >= TEMP_GAP) return '일교차 커요';
  return null;
}

// [지금 말투, 저녁에 돌아볼 때 말투]. 20° 넘으면 추위보다 더위를 말한다.
const DELTA_TEXT = {
  bigUp: ['크게 올라요', '크게 올랐어요'],
  warmer: ['덜 추워요', '덜 추웠어요'],
  hotter: ['더 더워요', '더 더웠어요'],
  same: ['비슷해요', '비슷했어요'],
  colder: ['더 추워요', '더 추웠어요'],
  cooler: ['덜 더워요', '덜 더웠어요'],
  bigDown: ['크게 내려요', '크게 내렸어요'],
} as const;

// 옷을 고른 값과 같은 체감끼리, 화면에 보이는 반올림 값으로 비교한다.
export function getCommuteDelta(
  morning: CommuteWeather,
  evening: CommuteWeather,
  past: boolean
) {
  const delta = Math.round(evening.feel) - Math.round(morning.feel);
  const hot = Math.round(evening.feel) >= 20;
  const key =
    delta >= 8
      ? 'bigUp'
      : delta >= 3
        ? hot
          ? 'hotter'
          : 'warmer'
        : delta > -3
          ? 'same'
          : delta > -8
            ? hot
              ? 'cooler'
              : 'colder'
            : 'bigDown';
  return { delta, text: DELTA_TEXT[key][past ? 1 : 0] };
}

function feelWord(morning: CommuteWeather, evening: CommuteWeather) {
  const warmest = Math.round(Math.max(morning.feel, evening.feel));
  const coldest = Math.round(Math.min(morning.feel, evening.feel));
  if (warmest < 5) return '추워요';
  if (warmest < 14) return '쌀쌀해요';
  if (coldest >= 26) return '더워요';
  if (coldest >= 20) return '따뜻해요';
  return '선선해요';
}

export type Take = [situation: string, action: string];

// 요약 카드 맨 아래 두 줄. 위험한 것부터(눈 > 비 > 강풍 > 일교차) 하나만 고른다.
// 강풍은 체감온도에 이미 들어가 옷에 반영되므로 비보다 뒤에 둔다.
export function getTake(
  day: DayWeather,
  offset: number,
  todayMorning?: CommuteWeather
): Take {
  const [morning, evening] = day.commutes;

  const snowy = day.commutes.filter((c) => isSnowy(c.sky));
  if (snowy.length > 0 || isSnowy(day.sky)) {
    return [`${whenOf(snowy, '낮')}에 눈 소식.`, '미끄럽지 않은 신발 신어요'];
  }

  const rainy = day.commutes.filter(isRainy);
  if (rainy.length > 0) {
    if (rainy.length === 1 && rainy[0] === evening && morning.feel <= 10) {
      return ['아침엔 쌀쌀, 퇴근길엔 비.', '겉옷 입고 우산 챙겨요'];
    }
    return [`${whenOf(rainy, '')}에 비가 와요.`, '우산 챙겨요'];
  }

  if (day.commutes.some((c) => c.wind >= STRONG_WIND)) {
    return ['바람이 강해요.', '실제보다 춥게 느껴져요'];
  }

  if (day.max - morning.temp >= TEMP_GAP) {
    return [
      `낮엔 ${formatTemp(day.max)}까지 올라요.`,
      '벗기 쉬운 겉옷으로 입어요',
    ];
  }

  return [
    // 내일 탭은 오늘 아침과 얼마나 다른지가 가장 궁금하다
    todayMorning
      ? `${compareMornings(todayMorning, morning)}.`
      : `하루 종일 ${feelWord(morning, evening)}.`,
    getEveningTip(morning, evening, offset) ?? '추천대로 입으면 돼요',
  ];
}
