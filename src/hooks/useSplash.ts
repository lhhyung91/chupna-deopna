import { useEffect, useState } from 'react';

// 등장 동작(약 0.8초)이 끝나고 구름이 한 번 둥실한 뒤 걷는다
const MIN_MS = 1200;
// 위치 확인이 오래 걸려도 이 이상은 막지 않는다. 그 뒤엔 이름 자리 점이 이어 받는다
const MAX_WAIT_MS = 3000;
const FADE_MS = 300;

// 앱을 연 뒤 로딩 화면을 얼마나 덮어 둘지. 다른 앱에서 돌아와 화면만 새로 받을 땐 다시 마운트되지 않아 나오지 않는다
export function useSplash(waiting = false) {
  const [phase, setPhase] = useState<'show' | 'leaving' | 'gone'>('show');

  useEffect(() => {
    if (phase === 'gone') return;
    // 앱을 연 순간부터 잰다. 서버를 기다리며 loading.tsx가 보인 시간도 포함된다
    const wait =
      phase === 'leaving'
        ? FADE_MS
        : (waiting ? MAX_WAIT_MS : MIN_MS) - performance.now();
    const timer = setTimeout(
      () => setPhase(phase === 'leaving' ? 'gone' : 'leaving'),
      Math.max(0, wait)
    );
    return () => clearTimeout(timer);
  }, [phase, waiting]);

  return phase;
}
