import type { OutfitLevel } from '@/lib/outfit';
import { choosePick, nextPicks, parsePicks } from '@/lib/picks';
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

// ↻ 버튼으로 고른 조합을 폰에 기억해, 다음에 같은 단계가 나오면 그 조합으로 보여준다
export function useOutfitPicks() {
  // 서버 렌더 땐 기본 추천으로 그리고, 하이드레이션 후 고른 조합으로 바뀐다.
  const picks = parsePicks(
    useSyncExternalStore(subscribe, readRaw, () => null)
  );

  const next = (level: OutfitLevel) => {
    try {
      localStorage.setItem(STORAGE_KEY, nextPicks(picks, level));
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  };

  return { choose: choosePick(picks), next };
}
