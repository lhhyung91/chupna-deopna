'use client';

import { LOCATION } from '@/lib/config';
import { haptic } from '@/lib/haptic';
import { motion } from 'motion/react';

export type Tab = 'today' | 'tomorrow';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'tomorrow', label: '내일' },
];

type Props = {
  dateLabel?: string;
  tab?: Tab;
  onTabChange?: (tab: Tab) => void;
};

export function Header({ dateLabel, tab = 'today', onTabChange }: Props) {
  return (
    <header className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl">{LOCATION.name}</h1>
        {dateLabel ? (
          <p className="text-sm text-muted">{dateLabel}</p>
        ) : (
          <div className="mt-1 h-4 w-32 rounded-full bg-skeleton" />
        )}
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
              className={`relative h-11 tactile rounded-xl text-base ${selected ? 'font-bold text-bg' : 'font-medium text-muted enabled:hover:text-ink'}`}
            >
              {/* 선택 알약을 버튼마다 그리지 않고 하나(layoutId)를 두 버튼 사이로 미끄러지게 한다 */}
              {selected && (
                <motion.span
                  layoutId="day-tab-pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
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
