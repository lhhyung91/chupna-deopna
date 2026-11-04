import type { ClothingKind } from '@/lib/outfit';
import { preloadImage } from '@/lib/preloadImage';
import Image from 'next/image';

type Props = { kind: ClothingKind; size: 32 | 56 | 76; priority?: boolean };

// 화면 크기는 rem으로 잡아 좁은 폰에서 글자와 같이 줄어들게 한다
const SIZE_CLASS: Record<Props['size'], string> = {
  32: 'size-8',
  56: 'size-14',
  76: 'size-19',
};

// JS로 다크 모드를 감지하면 첫 화면에서 깜빡이므로 두 이미지를 CSS로 전환한다.
// eager로 바꾸면 안 보이는 쪽까지 받으므로 lazy는 두고 우선순위만 올린다(Next 문서 권장).
export function ClothingIcon({ kind, size, priority = false }: Props) {
  const fetchPriority = priority ? 'high' : 'auto';
  return (
    <>
      <Image
        src={`/icons/icon_${kind}_light.png`}
        alt=""
        width={size}
        height={size}
        fetchPriority={fetchPriority}
        className={`dark:hidden ${SIZE_CLASS[size]}`}
      />
      <Image
        src={`/icons/icon_${kind}_dark.png`}
        alt=""
        width={size}
        height={size}
        fetchPriority={fetchPriority}
        className={`hidden dark:block ${SIZE_CLASS[size]}`}
      />
    </>
  );
}

// 탭을 넘긴 순간 받기 시작하면 칸은 있어도 그림이 잠깐 비어서 다른 탭 옷을 미리 받는다
export function preloadClothing(kind: ClothingKind, size: Props['size']) {
  // 위 그림과 같은 이유로 지금 테마 그림만 받는다
  const theme = matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  preloadImage(`/icons/icon_${kind}_${theme}.png`, size);
}
