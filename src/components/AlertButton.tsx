'use client';

import { removeSubscription, saveSubscription } from '@/app/actions';
import { haptic } from '@/lib/haptic';
import {
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

type Props = { offset: number };

type Status = 'checking' | 'ready' | 'busy' | 'denied' | 'failed';

const MESSAGES: Partial<Record<Status, string>> = {
  denied: '알림이 꺼져 있어요. 설정 > 알림에서 춥나덥나를 켜주세요',
  failed: '알림을 켜지 못했어요. 잠시 후 다시 해주세요',
};

const noop = () => () => {};
// 아이폰은 홈 화면에 추가한 앱에서만 PushManager가 생긴다.
const isPushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window;

// PushManager는 VAPID 공개키를 바이트로 받는다. 문자열 지원은 브라우저마다 달라 직접 바꾼다.
function toBytes(base64Url: string) {
  const padded = base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

// 헤더 오른쪽 종 아이콘. 눌러서 여는 설정 창은 포커스 가두기·Esc 닫기가 내장된 <dialog>를 쓴다.
export function AlertButton({ offset }: Props) {
  const supported = useSyncExternalStore(noop, isPushSupported, () => null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [status, setStatus] = useState<Status>('checking');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // 처음 열 땐 이미 켜둔 구독만 확인한다. 서비스 워커 등록은 켤 때 한다.
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker
      .getRegistration('/')
      .then((registration) => registration?.pushManager.getSubscription())
      .then((existing) => {
        setSubscription(existing ?? null);
        setStatus(Notification.permission === 'denied' ? 'denied' : 'ready');
      })
      .catch(() => setStatus('ready'));
  }, [supported]);

  // 크론이 서버에서 옷을 고르므로, 앱을 열거나 보정값이 바뀔 때마다 서버 쪽 보정값을 맞춘다.
  useEffect(() => {
    if (subscription) void saveSubscription(subscription.toJSON(), offset);
  }, [subscription, offset]);

  const toggle = async () => {
    haptic();
    setStatus('busy');
    try {
      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscription(subscription.endpoint);
        setSubscription(null);
        setStatus('ready');
        return;
      }
      // 아이폰은 누른 직후에만 권한 창을 띄워 주므로 다른 await보다 먼저 묻는다.
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'ready');
        return;
      }
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      // subscribe는 활성화된 워커가 있어야 해서, 등록 뒤 활성화까지 기다린다.
      const registration = await navigator.serviceWorker.ready;
      const created = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toBytes(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
        ),
      });
      setSubscription(created);
      setStatus('ready');
    } catch {
      setStatus('failed');
    }
  };

  // 카드 바깥(dialog 자신의 여백·배경)을 누르면 닫는다
  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  const on = subscription !== null;
  const message =
    supported === false
      ? '홈 화면에 추가하면 알림을 받을 수 있어요'
      : MESSAGES[status];

  return (
    <>
      <button
        type="button"
        aria-label={`저녁 알림 설정, ${on ? '켜짐' : '꺼짐'}`}
        aria-haspopup="dialog"
        onClick={() => {
          haptic();
          dialogRef.current?.showModal();
        }}
        className="relative flex size-11 shrink-0 tactile items-center justify-center rounded-2xl border-2 border-ink bg-card shadow-btn"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        {on && (
          <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-ink bg-point" />
        )}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={closeOnBackdrop}
        className="m-auto w-full max-w-sm bg-transparent p-4 text-ink backdrop:bg-black/50"
      >
        <div className="flex flex-col gap-4 card p-5 motion-safe:animate-pop">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-lg font-bold">
              저녁 알림
            </h2>
            <form method="dialog">
              <button
                type="submit"
                aria-label="닫기"
                className="-m-2 flex size-10 items-center justify-center rounded-xl text-muted hover:text-ink"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </form>
          </div>
          <p className="-mt-2 text-sm break-keep text-muted">
            내일 비가 오거나 오늘과 5° 넘게 차이 날 때만 저녁 8시쯤 알려줘요
          </p>
          {supported !== false && (
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-well p-4 shadow-well">
              <span className="font-bold">알림 받기</span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label="알림 받기"
                disabled={
                  !supported || status === 'checking' || status === 'busy'
                }
                onClick={toggle}
                className={`relative h-8 w-14 shrink-0 rounded-full border-2 border-ink shadow-well transition-colors disabled:opacity-50 ${on ? 'bg-point' : 'bg-card'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-6 rounded-full border-2 border-ink bg-card transition-transform ${on ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>
          )}
          <p
            aria-live="polite"
            className="text-xs break-keep text-muted empty:hidden"
          >
            {message}
          </p>
        </div>
      </dialog>
    </>
  );
}
