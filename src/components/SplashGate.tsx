'use client';

import { SplashScreen } from '@/components/SplashScreen';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// 등장 동작이 끝나고 구름이 한 번 둥실한 뒤 걷는다
const MIN_MS = 1200;
// 위치 확인이 오래 걸려도 이 이상은 막지 않는다. 그 뒤엔 이름 자리 점이 이어 받는다
const MAX_WAIT_MS = 3000;
// 걷힐 때 아래 화면 전체가 천천히 드러나게 한다. 짧으면 새로고침 때 내용이 툭 나타난다
const FADE_MS = 500;
// 기상청 단기예보가 3시간마다 새로 나와서, 그만큼 지났을 때만 로딩 화면을 다 보여준다
const FULL_EVERY_MS = 3 * 60 * 60 * 1000;
const SHOWN_KEY = 'splash-shown-at';

// 마지막으로 다 보여준 지 3시간이 지났으면 이번에 다 보여주고 시각을 남긴다
function takeFullTurn() {
  try {
    const last = Number(localStorage.getItem(SHOWN_KEY)) || 0;
    if (Date.now() - last < FULL_EVERY_MS) return false;
    localStorage.setItem(SHOWN_KEY, String(Date.now()));
  } catch {}
  return true;
}

// null: 페이지가 아직 안 그려짐, true: 그려졌지만 위치 확인을 기다려 달라, false: 걷어도 됨
const HoldContext = createContext<(hold: boolean) => void>(() => {});

// 로딩 화면을 레이아웃에 한 번만 그린다. 서버를 기다리다 날씨가 와도 같은 요소라 애니메이션이 다시 돌지 않는다
export function SplashProvider({ children }: { children: ReactNode }) {
  const [hold, setHold] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<'show' | 'leaving' | 'gone'>('show');
  // 서버 HTML은 기록을 몰라서 늘 로딩 화면을 그리고, 다 보여줄지는 브라우저에서 한 번만 정한다(화면에는 안 쓰는 값)
  const full = useRef<boolean | null>(null);

  useEffect(() => {
    if (phase === 'gone' || (phase === 'show' && hold === null)) return;
    if (full.current === null) full.current = takeFullTurn();
    // 앱을 연 순간부터 잰다. 서버를 기다린 시간도 포함된다. 3시간 안에 다시 열면 그려지는 대로 바로 걷는다
    const wait =
      phase === 'leaving'
        ? FADE_MS
        : full.current
          ? (hold ? MAX_WAIT_MS : MIN_MS) - performance.now()
          : 0;
    const timer = setTimeout(
      () => setPhase(phase === 'leaving' ? 'gone' : 'leaving'),
      Math.max(0, wait)
    );
    return () => clearTimeout(timer);
  }, [phase, hold]);

  return (
    <HoldContext value={setHold}>
      {children}
      {phase !== 'gone' && <SplashScreen leaving={phase === 'leaving'} />}
    </HoldContext>
  );
}

// 페이지가 그려지면 부른다. hold가 true인 동안(예: 열 때 위치 확인)은 최대 3초까지 로딩 화면을 더 덮어 둔다
export function useSplashHold(hold: boolean) {
  const setHold = useContext(HoldContext);
  useEffect(() => {
    setHold(hold);
  }, [setHold, hold]);
}
