export const SITE_URL = 'https://chupna-deopna.vercel.app';

export const COMMUTES = [
  { label: '출근', startHour: 8, endHour: 9 },
  { label: '퇴근', startHour: 18, endHour: 19 },
] as const;

// 퇴근 시간이 시작되면 피드백 카드를 맨 위로 올린다.
export const EVENING_HOUR = COMMUTES[1].startHour;

// 피드백으로 옷차림을 당기거나 미는 최대 폭(°). 서버에 저장할 때도 같은 범위로 자른다.
export const MAX_OFFSET = 3;
