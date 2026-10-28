// 안드로이드 크롬에서만 진동하고, iOS 사파리는 Vibration API가 없어 시각 반응만 남는다.
export function haptic() {
  try {
    navigator.vibrate?.(12);
  } catch {
    // 권한 정책으로 막힌 환경에서도 버튼 동작은 이어가야 한다
  }
}
