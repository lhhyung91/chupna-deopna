import type { ReactNode } from 'react';
import {
  type AccessibilityState,
  ImageBackground,
  Pressable,
  View,
} from 'react-native';
import { haptic } from '~/lib/haptic';

const OFFSET = {
  3: 'left-[3px] top-[3px] -right-[3px] -bottom-[3px]',
  5: 'left-[5px] top-[5px] -right-[5px] -bottom-[5px]',
} as const;

type RaisedProps = {
  depth: keyof typeof OFFSET;
  // 그림자 판도 같은 모서리여야 해서 겉 칸과 같은 rounded 클래스를 받는다
  rounded: string;
  // 눌린 버튼은 그림자가 접힌다
  flat?: boolean;
  className?: string;
  children: ReactNode;
};

// 웹의 각진 그림자(Npx Npx 0 ink). RN 그림자는 흐림 없이 테두리 모양 그대로 못 그려서 같은 모양 판을 뒤에 깐다
export function Raised({
  depth,
  rounded,
  flat = false,
  className = '',
  children,
}: RaisedProps) {
  return (
    <View className={className}>
      {!flat && (
        <View className={`absolute bg-ink ${rounded} ${OFFSET[depth]}`} />
      )}
      {children}
    </View>
  );
}

// 웹 card 유틸리티: 굵은 테두리·각진 그림자·노이즈 면
export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Raised depth={5} rounded="rounded-[18px]">
      <ImageBackground
        source={require('~/assets/texture_noise.png')}
        resizeMode="repeat"
        className={`overflow-hidden rounded-[18px] border-[2.5px] border-ink bg-card ${className}`}
      >
        {children}
      </ImageBackground>
    </Raised>
  );
}

type TactileProps = {
  onPress: () => void;
  rounded: string;
  // 겉 칸 모양·바탕 클래스(테두리는 여기서 붙인다)
  className?: string;
  // 고른 상태도 눌린 모양으로 둔다(피드백 버튼)
  down?: boolean;
  wrapperClassName?: string;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  children: ReactNode;
};

// 웹 tactile: 누르는 동안 3px 눌리고 각진 그림자가 접힌다. 이동 클래스는 두 상태 모두 둬야 NativeWind 오류가 안 난다(CLAUDE.md)
export function Tactile({
  onPress,
  rounded,
  className = '',
  down = false,
  wrapperClassName,
  accessibilityLabel,
  accessibilityState,
  children,
}: TactileProps) {
  return (
    <Pressable
      onPress={() => {
        haptic();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      className={wrapperClassName}
    >
      {({ pressed }) => (
        <Raised depth={3} rounded={rounded} flat={down || pressed}>
          <View
            className={`border-2 border-ink ${rounded} ${down || pressed ? 'translate-x-[3px] translate-y-[3px]' : 'translate-x-0 translate-y-0'} ${className}`}
          >
            {children}
          </View>
        </Raised>
      )}
    </Pressable>
  );
}
