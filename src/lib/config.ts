// 개인용이라 위치를 기상청 격자 좌표로 고정한다 (서울 중구).
export const LOCATION = { name: '서울 중구', nx: 60, ny: 127 };

export const COMMUTES = [
  { label: '출근', startHour: 8, endHour: 9 },
  { label: '퇴근', startHour: 18, endHour: 19 },
] as const;

// 퇴근 시간이 시작되면 피드백 카드를 맨 위로 올린다.
export const EVENING_HOUR = COMMUTES[1].startHour;
