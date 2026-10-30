import { COMMUTES, EVENING_HOUR } from '@/lib/config';
import type { Place } from '@/lib/location';

const API_BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];
// 발표 시각 이후 API에 반영되기까지 약 10분 걸린다.
const PUBLISH_DELAY_MS = 10 * 60 * 1000;
// 초단기실황은 매시 정각 관측분이 40분쯤 올라온다.
const NOW_DELAY_MS = 40 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEKDAYS = '일월화수목금토';

export type Sky =
  'sunny' | 'mostlyCloudy' | 'cloudy' | 'rain' | 'sleet' | 'snow' | 'shower';

export type HourWeather = {
  temp: number;
  feel: number;
  pop: number;
  sky: Sky;
  wind: number;
};

export type CommuteWeather = HourWeather & { label: string; time: string };

export type HourlyItem = { label: string; temp: number; pop: number; sky: Sky };

export type DayWeather = {
  dateKey: string;
  dateLabel: string;
  min: number;
  max: number;
  sky: Sky;
  pop: number;
  commutes: CommuteWeather[];
  hourly: HourlyItem[];
};

export type NowWeather = { temp: number; feel: number; sky: Sky };

export type Forecast = {
  now: NowWeather;
  today: DayWeather;
  tomorrow: DayWeather;
};

type Base = { date: string; hour: number };
type KmaItem = {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
};
type Grid = Map<string, Record<string, number>>;
type GridPoint = Pick<Place, 'nx' | 'ny'>;

const pad = (n: number) => String(n).padStart(2, '0');

// getUTC* 가 한국 시각을 돌려주도록 9시간 민 Date. 서버가 UTC로 돌아도 같은 결과를 낸다.
const toKst = (date: Date) => new Date(date.getTime() + KST_OFFSET_MS);

const toDateKey = (kst: Date) =>
  `${kst.getUTCFullYear()}${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}`;

export const formatDateLabel = (date: Date) => {
  const kst = toKst(date);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 ${WEEKDAYS[kst.getUTCDay()]}요일`;
};

export const kstHour = (date: Date) => toKst(date).getUTCHours();

export const isEvening = (date: Date) => kstHour(date) >= EVENING_HOUR;

export const yesterdayKey = (date: Date) =>
  toDateKey(new Date(toKst(date).getTime() - DAY_MS));

const isPrecip = (sky: Sky) =>
  sky === 'rain' || sky === 'sleet' || sky === 'snow' || sky === 'shower';

function latestBase(kst: Date): Base {
  const published = new Date(kst.getTime() - PUBLISH_DELAY_MS);
  const hour = BASE_HOURS.findLast((h) => h <= published.getUTCHours());
  if (hour === undefined) {
    return {
      date: toDateKey(new Date(published.getTime() - DAY_MS)),
      hour: 23,
    };
  }
  return { date: toDateKey(published), hour };
}

// 새벽 발표분에만 오늘 전체 시간대(이미 지난 출근 시간 포함)와 최저/최고기온이 들어 있다.
function dayBase(kst: Date): Base {
  const published = new Date(kst.getTime() - PUBLISH_DELAY_MS);
  if (published.getUTCHours() >= 2) {
    return { date: toDateKey(published), hour: 2 };
  }
  return { date: toDateKey(new Date(published.getTime() - DAY_MS)), hour: 23 };
}

function field(value: unknown, key: string): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return (value as Record<string, unknown>)[key];
}

function isKmaItem(value: unknown): value is KmaItem {
  return ['category', 'fcstDate', 'fcstTime', 'fcstValue'].every(
    (key) => typeof field(value, key) === 'string'
  );
}

async function requestKma(
  operation: 'getVilageFcst' | 'getUltraSrtNcst',
  base: Base,
  point: GridPoint
): Promise<unknown[]> {
  const rawKey = process.env.KMA_SERVICE_KEY;
  if (!rawKey) throw new Error('KMA_SERVICE_KEY가 설정되지 않았어요');

  const params = new URLSearchParams({
    // URLSearchParams가 다시 인코딩하므로 Encoding 키를 넣어도 이중 인코딩(403)되지 않게 먼저 푼다.
    serviceKey: decodeURIComponent(rawKey),
    pageNo: '1',
    numOfRows: '1500',
    dataType: 'JSON',
    base_date: base.date,
    base_time: `${pad(base.hour)}00`,
    nx: String(point.nx),
    ny: String(point.ny),
  });
  // 발표 직후엔 NO_DATA가 올 수 있어서 영구 캐시 대신 짧게 재검증한다.
  const res = await fetch(`${API_BASE}/${operation}?${params}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`기상청 API 응답 오류 (${res.status})`);

  const response = field(await res.json(), 'response');
  const header = field(response, 'header');
  if (field(header, 'resultCode') !== '00') {
    throw new Error(`기상청 API 오류: ${String(field(header, 'resultMsg'))}`);
  }
  const items = field(field(field(response, 'body'), 'items'), 'item');
  if (!Array.isArray(items)) throw new Error('기상청 API 응답 형식이 달라요');
  return items;
}

async function fetchItems(base: Base, point: GridPoint): Promise<KmaItem[]> {
  const items = await requestKma('getVilageFcst', base, point);
  return items.filter(isKmaItem);
}

// 초단기실황(관측값)의 기온·풍속·강수형태. 실패하면 null을 돌려 예보값으로 대신하게 한다.
async function fetchObserved(kst: Date, point: GridPoint) {
  const observed = new Date(kst.getTime() - NOW_DELAY_MS);
  const base = { date: toDateKey(observed), hour: observed.getUTCHours() };
  try {
    const values = Object.fromEntries(
      (await requestKma('getUltraSrtNcst', base, point)).map((item) => [
        String(field(item, 'category')),
        Number(field(item, 'obsrValue')),
      ])
    );
    if (!Number.isFinite(values.T1H)) return null;
    return { temp: values.T1H, wind: values.WSD ?? 0, pty: values.PTY ?? 0 };
  } catch {
    return null;
  }
}

function toGrid(items: KmaItem[]): Grid {
  const grid: Grid = new Map();
  for (const item of items) {
    const value = Number(item.fcstValue);
    // PCP의 '강수없음'처럼 숫자가 아닌 값은 쓰지 않는다.
    if (Number.isNaN(value)) continue;
    const key = item.fcstDate + item.fcstTime;
    grid.set(key, { ...grid.get(key), [item.category]: value });
  }
  return grid;
}

function toSky(sky: number, pty: number): Sky {
  if (pty === 1) return 'rain';
  if (pty === 2) return 'sleet';
  if (pty === 3) return 'snow';
  if (pty === 4) return 'shower';
  if (sky === 3) return 'mostlyCloudy';
  if (sky === 4) return 'cloudy';
  return 'sunny';
}

// 기상청 겨울철 체감온도 식. 여름철 식은 습도가 필요해서 10°C 초과일 땐 기온을 그대로 쓴다.
function feelsLike(temp: number, wind: number) {
  if (temp > 10 || wind < 1.3) return temp;
  const v = (wind * 3.6) ** 0.16;
  return 13.12 + 0.6215 * temp - 11.37 * v + 0.3965 * v * temp;
}

function hourAt(grid: Grid, date: string, hour: number): HourWeather | null {
  const v = grid.get(`${date}${pad(hour)}00`);
  if (v?.TMP === undefined) return null;
  const wind = v.WSD ?? 0;
  return {
    temp: v.TMP,
    feel: feelsLike(v.TMP, wind),
    pop: v.POP ?? 0,
    sky: toSky(v.SKY ?? 1, v.PTY ?? 0),
    wind,
  };
}

function commuteAt(
  grid: Grid,
  date: string,
  commute: (typeof COMMUTES)[number]
): CommuteWeather {
  const hours = [commute.startHour, commute.endHour]
    .map((hour) => hourAt(grid, date, hour))
    .filter((h) => h !== null);
  if (hours.length === 0) throw new Error('출퇴근 시간대 예보가 없어요');

  // 두 시간 중 더 춥고 더 궂은 쪽을 기준으로 삼는다.
  const wettest = hours.reduce((a, b) => (b.pop > a.pop ? b : a));
  return {
    label: commute.label,
    time: `${pad(commute.startHour)}–${pad(commute.endHour)}시`,
    temp: Math.min(...hours.map((h) => h.temp)),
    feel: Math.min(...hours.map((h) => h.feel)),
    pop: wettest.pop,
    sky: wettest.sky,
    wind: Math.max(...hours.map((h) => h.wind)),
  };
}

function buildDay(
  grid: Grid,
  kstDay: Date,
  hourlySlots: { kst: Date; label: string }[]
): DayWeather {
  const date = toDateKey(kstDay);
  const hours = Array.from({ length: 24 }, (_, h) => hourAt(grid, date, h));
  const known = hours.filter((h) => h !== null);
  const daytime = hours.slice(6, 22).filter((h) => h !== null);

  let min: number | undefined;
  let max: number | undefined;
  for (const [key, v] of grid) {
    if (!key.startsWith(date)) continue;
    min ??= v.TMN;
    max ??= v.TMX;
  }

  const wet = daytime.filter((h) => isPrecip(h.sky));
  const sky =
    wet.length > 0
      ? wet.reduce((a, b) => (b.pop > a.pop ? b : a)).sky
      : (hours[12]?.sky ?? 'sunny');

  return {
    dateKey: date,
    dateLabel: formatDateLabel(new Date(kstDay.getTime() - KST_OFFSET_MS)),
    min: min ?? Math.min(...known.map((h) => h.temp)),
    max: max ?? Math.max(...known.map((h) => h.temp)),
    sky,
    pop: Math.max(0, ...known.map((h) => h.pop)),
    commutes: COMMUTES.map((c) => commuteAt(grid, date, c)),
    hourly: hourlySlots.flatMap(({ kst, label }) => {
      const h = hourAt(grid, toDateKey(kst), kst.getUTCHours());
      return h ? [{ label, temp: h.temp, pop: h.pop, sky: h.sky }] : [];
    }),
  };
}

// 시간대별 "지금" 칸이 예보값이면 위 지금 날씨(관측값)와 숫자가 어긋나서, 같은 값으로 맞춘다.
function withNow(day: DayWeather, now: NowWeather): DayWeather {
  const [first, ...rest] = day.hourly;
  if (!first) return day;
  return {
    ...day,
    hourly: [{ ...first, temp: now.temp, sky: now.sky }, ...rest],
  };
}

export async function fetchForecast(
  now: Date,
  point: GridPoint
): Promise<Forecast> {
  const kst = toKst(now);
  const latest = latestBase(kst);
  const early = dayBase(kst);
  const isSameBase = latest.date === early.date && latest.hour === early.hour;
  const [earlyItems, latestItems, observed] = await Promise.all([
    fetchItems(early, point),
    isSameBase ? [] : fetchItems(latest, point),
    fetchObserved(kst, point),
  ]);
  // 같은 시각이면 최신 발표분이 덮어쓰도록 뒤에 둔다.
  const grid = toGrid([...earlyItems, ...latestItems]);

  const currentHour = new Date(Math.floor(kst.getTime() / HOUR_MS) * HOUR_MS);
  const tomorrow = new Date(kst.getTime() + DAY_MS);
  const tomorrowMidnight = new Date(
    Math.floor(tomorrow.getTime() / DAY_MS) * DAY_MS
  );

  // 하늘 상태는 실황에 없어서 이번 시각 예보를 쓰고, 지금 비·눈이 관측되면 그쪽을 따른다.
  const forecastNow = hourAt(grid, toDateKey(kst), kst.getUTCHours());
  const nowWeather: NowWeather | null = observed
    ? {
        temp: observed.temp,
        feel: feelsLike(observed.temp, observed.wind),
        sky:
          observed.pty > 0
            ? toSky(1, observed.pty)
            : (forecastNow?.sky ?? 'sunny'),
      }
    : forecastNow;
  if (!nowWeather) throw new Error('지금 날씨 정보가 없어요');

  return {
    now: nowWeather,
    today: withNow(
      buildDay(
        grid,
        kst,
        Array.from({ length: 24 }, (_, i) => {
          const slot = new Date(currentHour.getTime() + i * HOUR_MS);
          return {
            kst: slot,
            label: i === 0 ? '지금' : `${pad(slot.getUTCHours())}시`,
          };
        })
      ),
      nowWeather
    ),
    tomorrow: buildDay(
      grid,
      tomorrow,
      Array.from({ length: 18 }, (_, i) => {
        const hour = 6 + i;
        return {
          kst: new Date(tomorrowMidnight.getTime() + hour * HOUR_MS),
          label: `${pad(hour)}시`,
        };
      })
    ),
  };
}
