import { hideAsync } from 'expo-splash-screen';
import { useEffect } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { Raised } from '~/components/Card';
import { WeatherScreen } from '~/components/WeatherScreen';
import { useForecast } from '~/hooks/useForecast';
import { useLocate } from '~/hooks/useLocate';

export default function Home() {
  const locate = useLocate();
  const { forecast, stale, failed, retry } = useForecast(locate.place);
  const ready = forecast !== null || failed;

  // 저장된 예보가 있으면 바로, 처음 열면 예보가 올 때 시작 화면을 걷는다
  useEffect(() => {
    if (ready) hideAsync();
  }, [ready]);

  if (forecast) {
    return (
      <WeatherScreen
        forecast={forecast}
        locate={locate}
        busy={locate.locating || stale}
      />
    );
  }
  if (!failed) return null;

  return (
    <ImageBackground
      source={require('~/assets/texture_noise.png')}
      resizeMode="repeat"
      className="flex-1 items-center justify-center gap-4 bg-bg px-5"
    >
      <Text className="font-sans-bold text-lg text-ink">
        날씨를 불러오지 못했어요
      </Text>
      <Raised depth={3} rounded="rounded-2xl">
        <Pressable
          onPress={retry}
          accessibilityRole="button"
          className="rounded-2xl border-2 border-ink bg-card px-5 py-3"
        >
          <View>
            <Text className="font-sans-bold text-base text-ink">다시 시도</Text>
          </View>
        </Pressable>
      </Raised>
    </ImageBackground>
  );
}
