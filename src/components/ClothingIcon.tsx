import type { ClothingKind } from '@/lib/outfit';
import Image from 'next/image';

type Props = { kind: ClothingKind; size: 32 | 76; priority?: boolean };

// 화면 크기는 rem으로 잡아 좁은 폰에서 글자와 같이 줄어들게 한다
const SIZE_CLASS: Record<Props['size'], string> = {
  32: 'size-8',
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
