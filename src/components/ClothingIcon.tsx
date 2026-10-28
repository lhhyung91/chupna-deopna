import type { ClothingKind } from '@/lib/outfit';
import Image from 'next/image';

type Props = { kind: ClothingKind; size: 32 | 76 };

// JS로 다크 모드를 감지하면 첫 화면에서 깜빡이므로 두 이미지를 CSS로 전환한다.
export function ClothingIcon({ kind, size }: Props) {
  return (
    <>
      <Image
        src={`/icons/icon_${kind}_light.png`}
        alt=""
        width={size}
        height={size}
        className="dark:hidden"
      />
      <Image
        src={`/icons/icon_${kind}_dark.png`}
        alt=""
        width={size}
        height={size}
        className="hidden dark:block"
      />
    </>
  );
}
