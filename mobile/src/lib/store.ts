import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// 웹의 쿠키·localStorage 자리. 이름은 웹과 같게 둔다
const KEYS = [
  'place',
  'outfit-feedback',
  'outfit-picks',
  'mornings',
  'forecast',
] as const;
export type StoreKey = (typeof KEYS)[number];

// 저장소는 비동기라 앱을 열 때 한 번 다 읽어 메모리에 두고, 화면은 메모리 값을 바로 읽는다
const cache = new Map<StoreKey, string | null>();
const listeners = new Set<() => void>();

export async function loadStore() {
  try {
    for (const [key, value] of await AsyncStorage.multiGet(KEYS)) {
      cache.set(key as StoreKey, value);
    }
  } catch {
    // 못 읽으면 처음 쓰는 것처럼 기본값으로 연다
  }
}

export const readStored = (key: StoreKey) => cache.get(key) ?? null;

export function writeStored(key: StoreKey, value: string) {
  cache.set(key, value);
  listeners.forEach((listener) => listener());
  AsyncStorage.setItem(key, value).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStored(key: StoreKey) {
  return useSyncExternalStore(subscribe, () => readStored(key));
}
