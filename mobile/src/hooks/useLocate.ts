import { DEFAULT_PLACE, latLonToGrid, parsePlace } from '@/lib/location';
import {
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  getLastKnownPositionAsync,
  requestForegroundPermissionsAsync,
} from 'expo-location';
import { useEffect, useEffectEvent, useState } from 'react';
import { findPlace } from '~/lib/api';
import { useStored, writeStored } from '~/lib/store';

export type LocateError = 'denied' | 'failed' | 'outside';

// 동네 이름을 누르면 폰 위치로 바꾼다. 이미 허용돼 있으면 열 때마다 조용히 따라간다(웹 useLocate와 같은 흐름)
export function useLocate() {
  const saved = parsePlace(useStored('place') ?? undefined);
  const place = saved ?? DEFAULT_PLACE;
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<LocateError | null>(null);

  const locate = async (silent: boolean) => {
    setError(null);
    if (!silent) setLocating(true);
    try {
      const permission = silent
        ? await getForegroundPermissionsAsync()
        : await requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (!silent) setError('denied');
        return;
      }
      // 누를 땐 방금 위치가 필요하다. 조용히 따라갈 땐 10분 안 위치면 충분하다
      const position = silent
        ? ((await getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 })) ??
          (await getCurrentPositionAsync()))
        : await getCurrentPositionAsync();
      const { latitude, longitude } = position.coords;
      const grid = latLonToGrid(latitude, longitude);
      // 같은 격자면 예보가 같아서 다시 받을 필요가 없다
      if (silent && grid.nx === place.nx && grid.ny === place.ny) return;
      const result = await findPlace(latitude, longitude);
      if ('error' in result) {
        if (!silent) setError('outside');
        return;
      }
      writeStored('place', JSON.stringify(result.place));
    } catch {
      if (!silent) setError('failed');
    } finally {
      if (!silent) setLocating(false);
    }
  };

  // 권한을 묻는 창은 사용자가 이름을 눌렀을 때만 띄운다
  const locateSilently = useEffectEvent(() => locate(true));
  useEffect(() => {
    locateSilently();
  }, []);

  return { place, placeSaved: saved !== null, locating, error, locate };
}

export type Locate = ReturnType<typeof useLocate>;
