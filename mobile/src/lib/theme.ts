import { useColorScheme } from 'react-native';

export const useTheme = () =>
  useColorScheme() === 'dark' ? ('dark' as const) : ('light' as const);

// SVG 선 색은 클래스로 못 줘서 global.css의 --ink 값을 여기서도 쓴다
export const useInk = () => (useTheme() === 'dark' ? '#f1efe8' : '#111111');
