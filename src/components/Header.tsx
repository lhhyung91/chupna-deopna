'use client';

import { LOCATION } from '@/lib/config';
import { haptic } from '@/lib/haptic';

export type Tab = 'today' | 'tomorrow';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'tomorrow', label: '내일' },
];

type Props = {
  dateLabel?: string;
  status?: string;
  tab?: Tab;
  onTabChange?: (tab: Tab) => void;
};

export function Header({
  dateLabel,
  status,
  tab = 'today',
  onTabChange,
}: Props) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl">{LOCATION.name}</h1>
          {dateLabel ? (
            <p className="text-sm text-muted">{dateLabel}</p>
          ) : (
            <div className="mt-1 h-4 w-32 rounded-full bg-skeleton" />
          )}
        </div>
        {status && (
          <p className="mt-1 rounded-md border-2 border-ink bg-chip px-2 font-mono text-[11px] leading-4">
            {status}
          </p>
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
              className={`h-11 tactile text-base ${selected ? 'rounded-[10px] border-2 border-ink bg-ink font-bold text-bg' : 'rounded-xl font-medium text-muted enabled:hover:text-ink'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
