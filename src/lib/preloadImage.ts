import { getImageProps } from 'next/image';
import { preload } from 'react-dom';

// 아직 안 그린 그림을 뒤에서 받아 둔다. <Image>와 같은 srcSet이라 나중에 그릴 때 브라우저가 같은 크기를 골라 받아 둔 걸 쓴다
export function preloadImage(src: string, size: number) {
  const { props } = getImageProps({ src, alt: '', width: size, height: size });
  preload(props.src, {
    as: 'image',
    imageSrcSet: props.srcSet,
    fetchPriority: 'low',
  });
}
