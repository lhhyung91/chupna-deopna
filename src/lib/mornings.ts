// 예보 API는 지난날 아침 값을 다시 주지 않아서, "어제 아침보다"를 쓰려고 날마다 출근 체감을 남긴다.
// 서버가 첫 화면부터 그려야 깜빡이지 않아서 localStorage 대신 쿠키에 둔다.
export const MORNINGS_COOKIE = 'mornings';

// 오늘과 어제만 있으면 된다
const KEEP_DAYS = 2;

type Mornings = Record<string, number>;

// "20261029:4|20261030:7" → { 20261029: 4, 20261030: 7 }
export function parseMornings(value: string | undefined): Mornings {
  const mornings: Mornings = {};
  for (const entry of (value ?? '').split('|')) {
    const [dateKey, feel] = entry.split(':');
    if (/^\d{8}$/.test(dateKey) && /^-?\d+$/.test(feel ?? '')) {
      mornings[dateKey] = Number(feel);
    }
  }
  return mornings;
}

export function nextMornings(
  value: string | undefined,
  dateKey: string,
  feel: number
) {
  const mornings = { ...parseMornings(value), [dateKey]: Math.round(feel) };
  return Object.keys(mornings)
    .sort()
    .slice(-KEEP_DAYS)
    .map((key) => `${key}:${mornings[key]}`)
    .join('|');
}
