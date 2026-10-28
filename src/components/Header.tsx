'use client';

import { LOCATION } from '@/lib/config';

export type Tab = 'today' | 'tomorrow';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'tomorrow', label: '내일' },
];

type Props = {
  dateLabel?: string;
  status: string;
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
          <h1 className="text-2xl font-black">{LOCATION.name}</h1>
          {dateLabel ? (
            <p className="text-sm text-muted">{dateLabel}</p>
          ) : (
            <div className="mt-1 h-4 w-32 rounded-full bg-skeleton" />
          )}
        </div>
        <p className="pt-2 text-xs text-muted">{status}</p>
      </div>
      <div
        role="tablist"
        aria-label="날짜 선택"
        className="grid grid-cols-2 gap-1 rounded-2xl p-1 inset-shadow-neu"
      >
        {TABS.map(({ id, label }) => {
          const selected = id === tab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={!onTabChange}
              onClick={() => onTabChange?.(id)}
              className={`h-11 rounded-xl text-base ${selected ? 'font-bold text-ink shadow-neu-sm' : 'font-medium text-muted'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
