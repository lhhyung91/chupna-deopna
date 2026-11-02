import type { ChooseOutfit, ClothingItem, OutfitLevel } from '@/lib/outfit';
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'outfit-picks';

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

// 사생활 보호 모드 등에서는 localStorage 접근 자체가 throw 할 수 있다.
function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// 값이 표에 있는 조합인지는 쓰는 쪽(combosOf)에서 다시 걸러서, 여기선 문자열만 남긴다
function parse(raw: string | null): Record<string, string> {
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

// ↻ 버튼으로 고른 조합을 폰에 기억해, 다음에 같은 단계가 나오면 그 조합으로 보여준다
export function useOutfitPicks() {
  // 서버 렌더 땐 기본 추천으로 그리고, 하이드레이션 후 고른 조합으로 바뀐다.
  const picks = parse(useSyncExternalStore(subscribe, readRaw, () => null));

  const choose: ChooseOutfit = (level) =>
    combosOf(level).find(
      (combo) => nameOf(combo) === picks[nameOf(level.items)]
    ) ?? level.items;

  // 누를 때마다 다음 조합으로, 끝나면 기본 추천으로 돌아가며 그때는 기록을 지운다
  const next = (level: OutfitLevel) => {
    const combos = combosOf(level);
    const current = combos.findIndex(
      (combo) => nameOf(combo) === nameOf(choose(level))
    );
    const key = nameOf(level.items);
    const updated = {
      ...picks,
      [key]: nameOf(combos[(current + 1) % combos.length]),
    };
    if (updated[key] === key) delete updated[key];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  };

  return { choose, next };
}
