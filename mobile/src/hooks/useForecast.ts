import type { Place } from '@/lib/location';
import type { Forecast } from '@/lib/weather';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getForecast } from '~/lib/api';
import { readStored, writeStored } from '~/lib/store';

type Saved = { key: string; forecast: Forecast };

const keyOf = ({ nx, ny }: Pick<Place, 'nx' | 'ny'>) => `${nx}-${ny}`;

function readSaved(): Saved | null {
  try {
    const raw = readStored('forecast');
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

// 마지막 예보를 저장해 두고 열자마자 그린 뒤 새로 받는다(웹 서비스 워커가 하던 일). 앱으로 돌아올 때도 새로 받는다
export function useForecast(place: Place) {
  const key = keyOf(place);
  const [saved, setSaved] = useState(readSaved);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () =>
      getForecast(place)
        .then((forecast) => {
          if (!active) return;
          const next = { key, forecast };
          setSaved(next);
          setFailed(false);
          writeStored('forecast', JSON.stringify(next));
        })
        .catch(() => active && setFailed(true));
    load();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') load();
    });
    return () => {
      active = false;
      subscription.remove();
    };
    // place 객체가 아니라 격자가 바뀔 때만 다시 받는다
  }, [key, attempt]);

  return {
    forecast: saved?.forecast ?? null,
    // 어느 동네 예보인지. 동네가 바뀌어 새 예보가 오면 화면 전체를 페이드한다
    forecastKey: saved?.key ?? key,
    // 다른 동네 예보를 보여주는 중이면 새 동네 예보가 올 때까지 흐리게 둔다
    stale: saved !== null && saved.key !== key,
    failed,
    retry: () => setAttempt((n) => n + 1),
  };
}
