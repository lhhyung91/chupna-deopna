'use client';

import { updatePlace } from '@/app/actions';
import { haptic } from '@/lib/haptic';
import { latLonToGrid, type Place } from '@/lib/location';
import { useEffect, useEffectEvent, useState } from 'react';

type Props = { place: Place; dateLabel: string };

type Status = 'idle' | 'locating' | 'denied' | 'failed' | 'outside';

const MESSAGES: Partial<Record<Status, string>> = {
  denied:
    '위치 권한이 꺼져 있어요. 설정 > 개인정보 보호 및 보안 > 위치 서비스 > Safari 웹 사이트를 켜주세요',
  failed: '위치를 못 잡았어요. 잠시 후 다시 눌러주세요',
  outside: '기상청 예보는 국내 위치만 볼 수 있어요',
};

// 동네 이름을 누르면 폰 위치로 바꾼다. 이미 허용돼 있으면 열 때마다 조용히 따라간다.
export function PlaceHeading({ place, dateLabel }: Props) {
  const [status, setStatus] = useState<Status>('idle');

  const locate = (silent: boolean) => {
    if (!('geolocation' in navigator)) {
      if (!silent) setStatus('failed');
      return;
    }
    if (!silent) setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const grid = latLonToGrid(latitude, longitude);
        // 같은 격자면 예보가 같아서 다시 그릴 필요가 없다
        if (silent && grid.nx === place.nx && grid.ny === place.ny) return;
        const result = await updatePlace(latitude, longitude);
        setStatus('error' in result ? 'outside' : 'idle');
      },
      (error) => {
        if (silent) return;
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'failed');
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

  const message = MESSAGES[status];

  return (
    <div>
      <h1>
        <button
          type="button"
          onClick={() => {
            haptic();
            locate(false);
          }}
          disabled={status === 'locating'}
          aria-label={`${place.name}, 현재 위치로 바꾸기`}
          className="-mx-1 flex items-center gap-1 rounded-lg px-1 font-display text-3xl"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          {status === 'locating' ? '위치 찾는 중…' : place.name}
        </button>
      </h1>
      <p className="text-sm text-muted">{dateLabel}</p>
      <p
        aria-live="polite"
        className="mt-1 text-xs break-keep text-muted empty:hidden"
      >
        {message}
      </p>
    </div>
  );
}
