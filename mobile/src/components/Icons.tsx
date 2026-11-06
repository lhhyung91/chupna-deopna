import Svg, { Circle, Path } from 'react-native-svg';

type Props = { size: number; color: string };

// 웹 컴포넌트에 직접 그려 둔 선 아이콘들(같은 path)
const stroke = (color: string, width: number) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function PinIcon({ size, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.4)}>
      <Path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <Circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  );
}

export function RefreshIcon({ size, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.4)}>
      <Path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
    </Svg>
  );
}

export function CheckIcon({ size, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 3)}>
      <Path d="M5 12.5l4.5 4.5L19 7" />
    </Svg>
  );
}

export function ChevronIcon({ size, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.5)}>
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function ArrowHeadIcon({ color }: Pick<Props, 'color'>) {
  return (
    <Svg width={12} height={14} viewBox="0 0 12 14" {...stroke(color, 2.5)}>
      <Path d="M3 2l6 5-6 5" />
    </Svg>
  );
}
