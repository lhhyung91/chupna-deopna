'use client';

import { ClothingIcon } from '@/components/ClothingIcon';
import { levelRange, LEVELS } from '@/lib/outfit';
import { animate, AnimatePresence, motion } from 'motion/react';
import { useId, useRef, useState } from 'react';

type Props = { currentIndex: number; offset: number };

// 펼침과 화면 이동이 같은 속도로 함께 움직여야 화면이 표를 따라가는 것처럼 보인다
const PANEL_TRANSITION = { duration: 0.25, ease: 'easeOut' } as const;
const SCROLL_GAP = 16;

const PANEL = {
  open: { height: 'auto', opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

// details는 높이 애니메이션이 안 돼서, 펼침 상태를 직접 들고 motion으로 높이를 움직인다.
export function OutfitGuide({ currentIndex, offset }: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const sectionRef = useRef<HTMLElement>(null);

  // 페이지 맨 끝이라 브라우저 기본 스크롤은 다 펼쳐진 뒤에야 움직이므로, 펼침과 함께 직접 스크롤한다.
  const toggle = () => {
    const section = sectionRef.current;
    if (!open && section) {
      const target =
        window.scrollY + section.getBoundingClientRect().top - SCROLL_GAP;
      animate(window.scrollY, target, {
        ...PANEL_TRANSITION,
        onUpdate: (y) => window.scrollTo(0, y),
      });
    }
    setOpen(!open);
  };

  return (
    <section ref={sectionRef} className="card">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={toggle}
          className="flex w-full items-center justify-between gap-2 p-5 font-bold"
        >
          기온별 옷차림
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            animate={{ rotate: open ? 180 : 0 }}
            transition={PANEL_TRANSITION}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </button>
      </h2>
      {/* 닫힌 동안엔 목록을 그리지 않아 옷 그림도 받지 않는다 */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={listId}
            variants={PANEL}
            initial="closed"
            animate="open"
            exit="closed"
            transition={PANEL_TRANSITION}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-5 pb-5">
              <ol className="flex flex-col gap-1">
                {LEVELS.map((level, i) => {
                  const current = i === currentIndex;
                  return (
                    <li
                      key={levelRange(i)}
                      aria-current={current ? 'true' : undefined}
                      className={`grid grid-cols-[4.5rem_1fr] items-center gap-x-3 rounded-xl px-3 py-2 text-sm ${current ? 'border-2 border-ink bg-ink font-bold text-bg' : 'border-2 border-transparent'}`}
                    >
                      <span className="font-num font-bold tabular-nums">
                        {levelRange(i)}
                      </span>
                      <span className="flex flex-col gap-1 break-keep">
                        {/* 바로 아래 조합 문구가 같은 순서로 이름을 알려준다 */}
                        <span aria-hidden="true" className="flex gap-1">
                          {level.items.map((item) => (
                            <ClothingIcon
                              key={item.label}
                              kind={item.kind}
                              size={32}
                            />
                          ))}
                        </span>
                        {level.items.map((item) => item.label).join(' + ')}
                        {level.tip && (
                          <span
                            className={`block text-xs ${current ? '' : 'text-muted'}`}
                          >
                            {level.tip}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="text-xs text-muted">
                출근길 체감온도 기준
                {offset > 0 &&
                  ` · 추위를 타는 편이라 ${offset}° 더 따뜻하게 추천 중`}
                {offset < 0 &&
                  ` · 더위를 타는 편이라 ${-offset}° 더 가볍게 추천 중`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
