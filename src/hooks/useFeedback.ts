import {
  addFeedback,
  feedbackOffsets,
  parseFeedback,
  type Feeling,
} from '@/lib/feedback';
import { useSyncExternalStore } from 'react';

export type { Feeling };

const STORAGE_KEY = 'outfit-feedback';

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

export function useFeedback(dateKey: string) {
  // 서버 렌더 땐 기록이 없는 것으로 보고, 하이드레이션 후 localStorage 값으로 바뀐다.
  const records = parseFeedback(
    useSyncExternalStore(subscribe, readRaw, () => null)
  );

  const save = (feeling: Feeling) => {
    try {
      localStorage.setItem(STORAGE_KEY, addFeedback(records, dateKey, feeling));
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  };

  return {
    feeling: records[dateKey] ?? null,
    ...feedbackOffsets(records, dateKey),
    save,
  };
}
