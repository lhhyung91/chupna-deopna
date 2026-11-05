'use server';

import { MAX_OFFSET } from '@/lib/config';
import { isGridNumber, type Place, PLACE_COOKIE } from '@/lib/location';
import { findPlace, type PlaceResult } from '@/lib/place';
import {
  removeStoredSubscription,
  saveStoredSubscription,
} from '@/lib/pushStore';
import { cookies } from 'next/headers';
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

export async function saveSubscription(
  subscription: unknown,
  offset: number,
  { nx, ny }: Pick<Place, 'nx' | 'ny'>
) {
  if (!isSubscription(subscription) || !Number.isFinite(offset)) return;
  if (!isGridNumber(nx) || !isGridNumber(ny)) return;
  await saveStoredSubscription({
    subscription,
    offset: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, Math.round(offset))),
    nx,
    ny,
  });
}

export async function removeSubscription(endpoint: string) {
  await removeStoredSubscription(endpoint);
}

// 찾은 동네를 쿠키에 둔다. 쿠키가 바뀌면 Next가 화면을 새 동네로 다시 그린다.
export async function updatePlace(
  lat: number,
  lon: number
): Promise<PlaceResult> {
  const result = await findPlace(lat, lon);
  if ('error' in result) return result;
  (await cookies()).set(PLACE_COOKIE, JSON.stringify(result.place), {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return result;
}
