'use server';

import { MAX_OFFSET } from '@/lib/config';
import {
  removeStoredSubscription,
  saveStoredSubscription,
} from '@/lib/pushStore';
import type { PushSubscription } from 'web-push';

// 공개 엔드포인트라 클라이언트 값을 그대로 믿지 않고 모양과 범위를 확인한다.
const isSubscription = (value: unknown): value is PushSubscription => {
  if (typeof value !== 'object' || value === null) return false;
  const { endpoint, keys } = value as Partial<PushSubscription>;
  return (
    typeof endpoint === 'string' &&
    endpoint.startsWith('https://') &&
    typeof keys?.p256dh === 'string' &&
    typeof keys.auth === 'string'
  );
};

export async function saveSubscription(subscription: unknown, offset: number) {
  if (!isSubscription(subscription) || !Number.isFinite(offset)) return;
  await saveStoredSubscription({
    subscription,
    offset: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, Math.round(offset))),
  });
}

export async function removeSubscription(endpoint: string) {
  await removeStoredSubscription(endpoint);
}
