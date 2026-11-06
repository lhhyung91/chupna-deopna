import { SITE_URL } from '@/lib/config';
import type { Place } from '@/lib/location';
import type { PlaceResult } from '@/lib/place';
import type { Forecast } from '@/lib/weather';
import Constants from 'expo-constants';

// 개발 중엔 맥에서 띄운 웹 dev 서버(3000)를 부른다. 폰에서 localhost는 폰 자신이라 Metro 주소의 IP를 쓴다
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
const API_URL = __DEV__ && devHost ? `http://${devHost}:3000` : SITE_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  const body: unknown = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return body as T;
}

export const getForecast = ({ nx, ny }: Pick<Place, 'nx' | 'ny'>) =>
  request<Forecast>(`/api/forecast?nx=${nx}&ny=${ny}`);

// 좌표가 접속 기록에 남지 않게 본문으로 보낸다(서버 /api/place와 같은 이유)
export async function findPlace(lat: number, lon: number) {
  const res = await fetch(`${API_URL}/api/place`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lat, lon }),
  });
  return (await res.json()) as PlaceResult;
}
