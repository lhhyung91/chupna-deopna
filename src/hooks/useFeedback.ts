import { MAX_OFFSET } from '@/lib/config';
import { useSyncExternalStore } from 'react';

export type Feeling = 'hot' | 'good' | 'cold';

const STORAGE_KEY = 'outfit-feedback';
const KEEP_DAYS = 14;

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

const isFeeling = (value: unknown): value is Feeling =>
  value === 'hot' || value === 'good' || value === 'cold';

function parse(raw: string | null): Record<string, Feeling> {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return {};
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, Feeling] =>
        isFeeling(entry[1])
      )
    );
  } catch {
    return {};
  }
}

export function useFeedback(dateKey: string) {
  // 서버 렌더 땐 기록이 없는 것으로 보고, 하이드레이션 후 localStorage 값으로 바뀐다.
  const records = parse(useSyncExternalStore(subscribe, readRaw, () => null));

  // 오늘 누른 피드백은 내일 추천부터 반영한다.
  const score = Object.entries(records)
    .filter(([date]) => date !== dateKey)
    .reduce((sum, [, f]) => sum + (f === 'cold' ? 1 : f === 'hot' ? -1 : 0), 0);
  const offset = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, score));

  const save = (feeling: Feeling) => {
    const recent = Object.entries({ ...records, [dateKey]: feeling })
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-KEEP_DAYS);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Object.fromEntries(recent))
      );
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  };

  return { feeling: records[dateKey] ?? null, offset, save };
}
