'use client';

import { SplashScreen } from '@/components/SplashScreen';
import { APP_HEIGHT_KEY, LAST_OPENED_KEY } from '@/lib/splash';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

// 위치 확인이 오래 걸려도 이 이상은 막지 않는다. 그 뒤엔 이름 자리 점이 이어 받는다
const MAX_WAIT_MS = 1500;
// 걷힐 때 아래 화면 전체가 천천히 드러나게 한다. 짧으면 새로고침 때 내용이 툭 나타난다
const FADE_MS = 500;

// null: 페이지가 아직 안 그려짐, true: 그려졌지만 위치 확인을 기다려 달라, false: 걷어도 됨
const HoldContext = createContext<(hold: boolean) => void>(() => {});
// 메인은 로딩 화면 뒤에서 미리 그려지므로, 첫 움직임은 로딩 화면이 걷히기 시작할 때 튼다
const RevealedContext = createContext(false);

// 로딩 화면을 레이아웃에 한 번만 그린다. 서버를 기다리다 날씨가 와도 같은 요소라 애니메이션이 다시 돌지 않는다
export function SplashProvider({ children }: { children: ReactNode }) {
  const [hold, setHold] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<'show' | 'leaving' | 'gone'>('show');

  // sw.js가 첫 화면(/)을 열 때마다 새로 저장하므로, 같은 때를 남겨 다음에 로딩 화면을 숨길지 정한다(layout.tsx)
  useEffect(() => {
    if (location.pathname !== '/' || location.search) return;
    try {
      localStorage.setItem(LAST_OPENED_KEY, String(Date.now()));
    } catch {}
  }, []);

  // 다시 열 때 저장된 화면을 바로 띄우는 서비스 워커(public/sw.js). dev에선 고친 코드가 안 보이게 되므로 배포본에서만 쓴다
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => {});
  }, []);

  // 로딩 화면이 걷힐 땐 앱 높이가 자리 잡은 뒤라, 그 실제 높이를 남겨 다음에 열 때 로딩 화면 높이로 쓴다(layout.tsx)
  useEffect(() => {
    if (phase !== 'gone') return;
    const standalone =
      ('standalone' in navigator && navigator.standalone === true) ||
      matchMedia('(display-mode: standalone)').matches;
    if (!standalone || innerHeight <= innerWidth) return;
    try {
      localStorage.setItem(APP_HEIGHT_KEY, String(innerHeight));
    } catch {}
  }, [phase]);

  useEffect(() => {
    if (phase === 'gone' || (phase === 'show' && hold === null)) return;
    // 날씨가 그려지면 바로 걷는다. 위치 확인 시간은 앱을 연 순간부터 잰다
    // 숨은 채 열린 로딩 화면(layout.tsx의 data-splash="skip")은 덮을 게 없어서, 위치를 기다리면 내용만 비어 보인다
    const covering = document.documentElement.dataset.splash !== 'skip';
    const wait =
      phase === 'leaving'
        ? FADE_MS
        : hold && covering
          ? MAX_WAIT_MS - performance.now()
          : 0;
    const timer = setTimeout(
      () => setPhase(phase === 'leaving' ? 'gone' : 'leaving'),
      Math.max(0, wait)
    );
    return () => clearTimeout(timer);
  }, [phase, hold]);

  return (
    <HoldContext value={setHold}>
      <RevealedContext value={phase !== 'show'}>{children}</RevealedContext>
      {phase !== 'gone' && <SplashScreen leaving={phase === 'leaving'} />}
    </HoldContext>
  );
}

// 페이지가 그려지면 부른다. hold가 true인 동안(예: 열 때 위치 확인)은 최대 1.5초까지 로딩 화면을 더 덮어 둔다
export function useSplashHold(hold: boolean) {
  const setHold = useContext(HoldContext);
  useEffect(() => {
    setHold(hold);
  }, [setHold, hold]);
}

export const useSplashRevealed = () => useContext(RevealedContext);
