import type { ReactNode } from 'react';
import { ImageBackground, View } from 'react-native';

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
