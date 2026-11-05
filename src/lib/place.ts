import { regionName } from '@/lib/kakao';
import { isInKorea, latLonToGrid, type Place } from '@/lib/location';

export type PlaceResult = { place: Place } | { error: string };

// 폰 위치를 기상청 격자와 동네 이름으로 바꾼다. 웹(쿠키)과 앱(/api/place)이 같이 쓰고, 좌표는 여기서 쓰고 버린다
export async function findPlace(
  lat: number,
  lon: number
): Promise<PlaceResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !isInKorea(lat, lon)) {
    return { error: '기상청 예보는 국내 위치만 볼 수 있어요' };
  }
  return {
    place: {
      name: (await regionName(lat, lon)) ?? '현재 위치',
      ...latLonToGrid(lat, lon),
    },
  };
}
