'use server';

import { MAX_OFFSET } from '@/lib/config';
import { regionName } from '@/lib/kakao';
import {
  isInKorea,
  latLonToGrid,
  type Place,
  PLACE_COOKIE,
} from '@/lib/location';
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

const isGrid = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) > 0 && Number(value) < 300;

export async function saveSubscription(
  subscription: unknown,
  offset: number,
  { nx, ny }: Pick<Place, 'nx' | 'ny'>
) {
  if (!isSubscription(subscription) || !Number.isFinite(offset)) return;
  if (!isGrid(nx) || !isGrid(ny)) return;
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

export type PlaceResult = { place: Place } | { error: string };

// 폰 위치를 기상청 격자와 동네 이름으로 바꿔 쿠키에 둔다. 쿠키가 바뀌면 Next가 화면을 새 동네로 다시 그린다.
export async function updatePlace(
  lat: number,
  lon: number
): Promise<PlaceResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !isInKorea(lat, lon)) {
    return { error: '기상청 예보는 국내 위치만 볼 수 있어요' };
  }
  const place: Place = {
    name: (await regionName(lat, lon)) ?? '현재 위치',
    ...latLonToGrid(lat, lon),
  };
  (await cookies()).set(PLACE_COOKIE, JSON.stringify(place), {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return { place };
}
