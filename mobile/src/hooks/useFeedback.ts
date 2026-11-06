import {
  addFeedback,
  feedbackOffsets,
  parseFeedback,
  type Feeling,
} from '@/lib/feedback';
import { useStored, writeStored } from '~/lib/store';

// 계산은 웹과 같은 @/lib/feedback, 저장만 앱 저장소
export function useFeedback(dateKey: string) {
  const records = parseFeedback(useStored('outfit-feedback'));
  const save = (feeling: Feeling) =>
    writeStored('outfit-feedback', addFeedback(records, dateKey, feeling));
  return {
    feeling: records[dateKey] ?? null,
    ...feedbackOffsets(records, dateKey),
    save,
  };
}
