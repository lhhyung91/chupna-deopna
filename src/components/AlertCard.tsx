'use client';

import { removeSubscription, saveSubscription } from '@/app/actions';
import { haptic } from '@/lib/haptic';
import { useEffect, useState, useSyncExternalStore } from 'react';

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

export function AlertCard({ offset }: Props) {
  const supported = useSyncExternalStore(noop, isPushSupported, () => null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [status, setStatus] = useState<Status>('checking');

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

  const on = subscription !== null;
  const message =
    supported === false
      ? '홈 화면에 추가하면 알림을 받을 수 있어요'
      : MESSAGES[status];

  return (
    <section
      aria-labelledby="alert-title"
      className="flex flex-col gap-3 card p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="alert-title" className="font-bold">
            저녁 알림
          </h2>
          <p className="text-sm break-keep text-muted">
            내일 비가 오거나 오늘과 5° 넘게 차이 날 때만 저녁 8시쯤 알려줘요
          </p>
        </div>
        {supported !== false && (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby="alert-title"
            disabled={!supported || status === 'checking' || status === 'busy'}
            onClick={toggle}
            className={`relative h-8 w-14 shrink-0 rounded-full border-2 border-ink shadow-well transition-colors disabled:opacity-50 ${on ? 'bg-point' : 'bg-well'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-6 rounded-full border-2 border-ink bg-card transition-transform ${on ? 'translate-x-6' : ''}`}
            />
          </button>
        )}
      </div>
      <p
        aria-live="polite"
        className="text-xs break-keep text-muted empty:hidden"
      >
        {message}
      </p>
    </section>
  );
}
