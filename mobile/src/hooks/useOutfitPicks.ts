import type { OutfitLevel } from '@/lib/outfit';
import { choosePick, nextPicks, parsePicks } from '@/lib/picks';
import { useStored, writeStored } from '~/lib/store';

// ↻로 고른 조합. 계산은 웹과 같은 @/lib/picks, 저장만 앱 저장소
export function useOutfitPicks() {
  const picks = parsePicks(useStored('outfit-picks'));
  return {
    choose: choosePick(picks),
    next: (level: OutfitLevel) =>
      writeStored('outfit-picks', nextPicks(picks, level)),
  };
}
