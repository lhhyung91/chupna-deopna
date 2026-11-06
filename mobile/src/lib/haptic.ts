import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics';

// 웹 haptic()(12ms 진동)과 같은 자리에서 가볍게 한 번
export const haptic = () => {
  impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
};
