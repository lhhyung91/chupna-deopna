import type { ChooseOutfit, ClothingItem, OutfitLevel } from '@/lib/outfit';

// 옷 카드 ↻로 고른 조합. 키는 기본 조합, 값은 고른 조합의 옷 이름들. 웹과 앱이 같이 쓴다
export type Picks = Record<string, string>;

// 값이 표에 있는 조합인지는 쓰는 쪽(combosOf)에서 다시 걸러서, 여기선 문자열만 남긴다
export function parsePicks(raw: string | null): Picks {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    );
  } catch {
    return {};
  }
}

// 조합은 옷 이름을 이어 붙여 부른다. 단계 번호 대신 쓰면 표 순서가 바뀌어도 엉뚱한 단계에 붙지 않는다
const nameOf = (items: ClothingItem[]) =>
  items.map((item) => item.kind).join('+');

const combosOf = (level: OutfitLevel) => [
  level.items,
  ...(level.alternatives ?? []),
];

export const choosePick =
  (picks: Picks): ChooseOutfit =>
  (level) =>
    combosOf(level).find(
      (combo) => nameOf(combo) === picks[nameOf(level.items)]
    ) ?? level.items;

// 누를 때마다 다음 조합으로, 끝나면 기본 추천으로 돌아가며 그때는 기록을 지운다. 저장할 문자열을 돌려준다
export function nextPicks(picks: Picks, level: OutfitLevel) {
  const combos = combosOf(level);
  const current = combos.findIndex(
    (combo) => nameOf(combo) === nameOf(choosePick(picks)(level))
  );
  const key = nameOf(level.items);
  const updated = {
    ...picks,
    [key]: nameOf(combos[(current + 1) % combos.length]),
  };
  if (updated[key] === key) delete updated[key];
  return JSON.stringify(updated);
}
