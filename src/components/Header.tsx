'use client';

import { PlaceHeading } from '@/components/PlaceHeading';
import { haptic } from '@/lib/haptic';
import type { Place } from '@/lib/location';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export type Tab = 'today' | 'tomorrow';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'tomorrow', label: '내일' },
];

type Props = {
  place?: Place;
  dateLabel?: string;
  tab?: Tab;
  onTabChange?: (tab: Tab) => void;
  action?: ReactNode;
};

export function Header({
  place,
  dateLabel,
  tab = 'today',
  onTabChange,
  action,
}: Props) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        {/* 로딩 화면은 빌드 때 만들어져 동네·날짜를 몰라서 회색 막대로 둔다 */}
        {place && dateLabel ? (
          <PlaceHeading place={place} dateLabel={dateLabel} />
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            <div className="h-7 w-36 rounded-full bg-skeleton" />
            <div className="h-4 w-32 rounded-full bg-skeleton" />
          </div>
        )}
        {action}
      </div>
      {/* 두 개 중 하나를 고르는 토글이라 탭 패턴 대신 aria-pressed 버튼 묶음으로 둔다 */}
      <div
        role="group"
        aria-label="날짜 선택"
        className="grid grid-cols-2 gap-1 rounded-2xl border-2 border-ink bg-well p-1 shadow-well"
      >
        {TABS.map(({ id, label }) => {
          const selected = id === tab;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              disabled={!onTabChange}
              onClick={() => {
                haptic();
                onTabChange?.(id);
              }}
              className={`relative h-11 rounded-xl text-base ${selected ? 'font-bold text-bg' : 'font-medium text-muted enabled:hover:text-ink'}`}
            >
              {/* 선택 알약 하나(layoutId)를 두 버튼 사이로 미끄러지게 한다. 눌림 효과(tactile)는 알약까지 대각선으로 끌고 가서 이 토글엔 쓰지 않는다 */}
              {selected && (
                <motion.span
                  layoutId="day-tab-pill"
                  transition={{
                    type: 'spring',
                    visualDuration: 0.4,
                    bounce: 0,
                  }}
                  className="absolute inset-0 rounded-[10px] border-2 border-ink bg-ink"
                />
              )}
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
