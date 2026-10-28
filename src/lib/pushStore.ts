import { Redis } from '@upstash/redis';
import type { PushSubscription } from 'web-push';

export type StoredSubscription = {
  subscription: PushSubscription;
  offset: number;
};

// 기기(endpoint)마다 한 칸. 같은 기기가 다시 구독하면 보정값과 함께 덮어쓴다.
// 다른 프로젝트와 같은 Redis를 같이 쓰므로 키 앞에 프로젝트 이름을 붙인다.
const KEY = 'chupna-deopna:push:subscriptions';

// Vercel이 연결한 Upstash 환경 변수를 읽는다. 빌드 땐 변수가 없어서 쓸 때 만든다(REST라 비용이 없다).
const redis = () => Redis.fromEnv();

export async function saveStoredSubscription(stored: StoredSubscription) {
  await redis().hset(KEY, { [stored.subscription.endpoint]: stored });
}

export async function removeStoredSubscription(endpoint: string) {
  await redis().hdel(KEY, endpoint);
}

export async function listStoredSubscriptions() {
  const all = await redis().hgetall<Record<string, StoredSubscription>>(KEY);
  return Object.values(all ?? {});
}
