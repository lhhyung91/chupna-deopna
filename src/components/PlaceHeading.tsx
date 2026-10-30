'use client';

import type { Locate, LocateError } from '@/hooks/useLocate';
import { haptic } from '@/lib/haptic';
import type { Place } from '@/lib/location';

type Props = {
  place: Place;
  placeSaved: boolean;
  locate: Locate;
  dateLabel: string;
};

const MESSAGES: Record<LocateError, string> = {
  denied:
    '위치 권한이 꺼져 있어요. 설정 > 개인정보 보호 및 보안 > 위치 서비스 > Safari 웹 사이트를 켜주세요',
  failed: '위치를 못 잡았어요. 잠시 후 다시 눌러주세요',
  outside: '기상청 예보는 국내 위치만 볼 수 있어요',
};

export function PlaceHeading({
  place,
  placeSaved,
  locate: { busy, error, locate },
  dateLabel,
}: Props) {
  // 권한 창은 누를 때만 띄우므로, 처음 온 사람은 기본 동네가 자기 동네가 아닐 수 있다는 걸 알아야 한다
  const message = error
    ? MESSAGES[error]
    : placeSaved
      ? null
      : '이름을 누르면 지금 위치로 바뀌어요';

  return (
    <div>
      <h1>
        <button
          type="button"
          onClick={() => {
            haptic();
            locate(false);
          }}
          disabled={busy}
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
          {busy ? (
            <>
              위치 찾는 중
              {/* 위치를 잡고 새 예보가 올 때까지 이어서 움직여, 멈춘 게 아니라는 걸 보여준다 */}
              <span aria-hidden="true" className="ml-1 flex gap-1">
                <span className="size-1.5 splash-dot rounded-full bg-splash-dot" />
                <span className="size-1.5 splash-dot rounded-full bg-splash-dot" />
                <span className="size-1.5 splash-dot rounded-full bg-splash-dot" />
              </span>
            </>
          ) : (
            place.name
          )}
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
