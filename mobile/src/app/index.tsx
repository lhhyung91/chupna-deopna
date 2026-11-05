import { levelRange, LEVELS } from '@/lib/outfit';
import {
  Image,
  ImageBackground,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CLOTHING_ICONS } from '~/lib/clothingIcons';

// 뼈대 확인용 화면: 웹과 같은 옷차림 기준(LEVELS)·옷 그림·노이즈 바탕·글꼴·색 토큰이 앱에서도 그대로 나오는지 본다
export default function Home() {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const level = LEVELS[0];
  const [first] = level.items;

  return (
    <ImageBackground
      source={require('~/assets/texture_noise.png')}
      resizeMode="repeat"
      className="flex-1 bg-bg"
    >
      <SafeAreaView className="flex-1 items-center justify-center gap-6 px-5">
        <Text className="font-display text-5xl text-ink">춥나덥나</Text>
        <View className="items-center gap-3 rounded-[18px] border-[2.5px] border-ink bg-well px-8 py-6">
          <Image
            source={CLOTHING_ICONS[first.kind][theme]}
            className="size-24"
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text className="font-sans-bold text-xl text-ink">
            {level.items.map(({ label }) => label).join(' · ')}
          </Text>
          <Text className="font-sans-medium text-base text-muted">
            출근길 체감 {levelRange(0)}
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
