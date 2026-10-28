'use client';

import { Header } from '@/components/Header';
import { WeatherIcon } from '@/components/WeatherIcon';
import { haptic } from '@/lib/haptic';
import { formatDateLabel } from '@/lib/weather';
import { useEffect } from 'react';

type Props = { error: unknown; retry: () => void };

export default function ErrorPage({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header dateLabel={formatDateLabel(new Date())} />
      <div className="mt-6 flex flex-col items-center gap-5 card px-6 pt-10 pb-8">
        <WeatherIcon kind="cloudy" size={96} />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold">날씨를 불러오지 못했어요</h2>
          <p className="text-sm text-muted">
            인터넷 연결을 확인하고
            <br />
            다시 시도해 주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            haptic();
            retry();
          }}
          className="h-12 tactile rounded-xl border-[2.5px] border-ink bg-point px-8 font-bold text-on-bright shadow-hard-sm"
        >
          다시 시도
        </button>
      </div>
    </>
  );
}
