import { MAX_OFFSET } from '@/lib/config';

// 춥다/덥다 피드백. 저장소(웹 localStorage·앱 AsyncStorage)만 다르고 계산은 웹과 앱이 같이 쓴다
export type Feeling = 'hot' | 'good' | 'cold';
export type FeedbackRecords = Record<string, Feeling>;

const KEEP_DAYS = 14;

const isFeeling = (value: unknown): value is Feeling =>
  value === 'hot' || value === 'good' || value === 'cold';

export function parseFeedback(raw: string | null): FeedbackRecords {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return {};
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, Feeling] =>
        isFeeling(entry[1])
      )
    );
  } catch {
    return {};
  }
}

const offsetOf = (entries: [string, Feeling][]) => {
  const score = entries.reduce(
    (sum, [, f]) => sum + (f === 'cold' ? 1 : f === 'hot' ? -1 : 0),
    0
  );
  return Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, score));
};

// 오늘 추천은 아침에 보여준 그대로 두고, 오늘 누른 피드백은 내일 탭과 저녁 알림부터 반영한다.
export function feedbackOffsets(records: FeedbackRecords, dateKey: string) {
  return {
    offset: offsetOf(
      Object.entries(records).filter(([date]) => date !== dateKey)
    ),
    nextOffset: offsetOf(Object.entries(records)),
  };
}

// 최근 14일만 남겨 저장할 문자열로 돌려준다
export function addFeedback(
  records: FeedbackRecords,
  dateKey: string,
  feeling: Feeling
) {
  const recent = Object.entries({ ...records, [dateKey]: feeling })
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-KEEP_DAYS);
  return JSON.stringify(Object.fromEntries(recent));
}
