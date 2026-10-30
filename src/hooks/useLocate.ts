import { updatePlace } from '@/app/actions';
import { latLonToGrid, type Place } from '@/lib/location';
import { useEffect, useEffectEvent, useState, useTransition } from 'react';

export type LocateError = 'denied' | 'failed' | 'outside';

// 동네 이름을 누르면 폰 위치로 바꾼다. 이미 허용돼 있으면 열 때마다 조용히 따라간다.
export function useLocate(place: Place) {
  const [locating, setLocating] = useState(false);
  // 열 때마다 하는 조용한 확인은 화면에 보이지 않게 따로 둔다. 로딩 화면만 이걸 기다린다
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<LocateError | null>(null);
  // 서버가 새 동네를 다 그릴 때까지 이어져야 화면이 한 템포 늦게 툭 바뀌지 않는다
  const [updating, startUpdate] = useTransition();

  const locate = (silent: boolean) => {
    if (!('geolocation' in navigator)) {
      if (!silent) setError('failed');
      return;
    }
    setError(null);
    (silent ? setChecking : setLocating)(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        (silent ? setChecking : setLocating)(false);
        const grid = latLonToGrid(latitude, longitude);
        // 같은 격자면 예보가 같아서 다시 그릴 필요가 없다
        if (silent && grid.nx === place.nx && grid.ny === place.ny) return;
        startUpdate(async () => {
          const result = await updatePlace(latitude, longitude);
          if ('error' in result) setError('outside');
        });
      },
      (positionError) => {
        (silent ? setChecking : setLocating)(false);
        if (silent) return;
        setError(
          positionError.code === positionError.PERMISSION_DENIED
            ? 'denied'
            : 'failed'
        );
      },
      // 누를 땐 방금 위치가 필요하다. 브라우저에 저장된 값은 이동 전 위치일 수 있어 쓰지 않는다
      silent
        ? { timeout: 10_000, maximumAge: 10 * 60 * 1000 }
        : { timeout: 15_000, maximumAge: 0 }
    );
  };

  const locateSilently = useEffectEvent(() => locate(true));
  useEffect(() => {
    // 권한을 묻는 창은 사용자가 이름을 눌렀을 때만 띄운다
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((permission) => {
        if (permission.state === 'granted') locateSilently();
      })
      .catch(() => {});
  }, []);

  return {
    busy: locating || updating,
    settling: checking || updating,
    error,
    locate,
  };
}

export type Locate = ReturnType<typeof useLocate>;
