import { BlackHanSans_400Regular } from '@expo-google-fonts/black-han-sans/400Regular';
import { NotoSansKR_400Regular } from '@expo-google-fonts/noto-sans-kr/400Regular';
import { NotoSansKR_500Medium } from '@expo-google-fonts/noto-sans-kr/500Medium';
import { NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr/700Bold';
import { NotoSansKR_900Black } from '@expo-google-fonts/noto-sans-kr/900Black';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import '~/global.css';

// 글꼴이 오기 전에 그리면 시스템 글꼴로 한 번 보였다가 바뀌어서 시작 화면으로 덮어 둔다
preventAutoHideAsync();

// 웹과 같은 굵기만 부른다. 한글 글꼴은 굵기마다 6MB라 쓰지 않는 굵기는 넣지 않는다
const FONTS = {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  NotoSansKR_900Black,
  BlackHanSans_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
};

export default function RootLayout() {
  const [loaded, error] = useFonts(FONTS);
  const ready = loaded || error !== null;

  useEffect(() => {
    if (ready) hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}
