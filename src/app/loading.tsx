import { SplashScreen } from '@/components/SplashScreen';

// 서버가 날씨를 받는 동안 보인다. 메인이 같은 로딩 화면을 덮은 채 시작해서 넘어갈 때 끊기지 않는다
export default function Loading() {
  return <SplashScreen />;
}
