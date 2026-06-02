'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────── 类型导出 ─────────── */
export interface TimelineActivity {
  time: string;
  title: string;
  description: string;
  /** 出处，如 "东京梦华录" */
  source?: string;
  /** 现代对应 —— 该活动在今日生活中的映射 */
  modern?: string;
  /** 东京梦华录原文引用 */
  originalText?: string;
  /** 具体所属章节 */
  chapter?: string;
  /** 证据片段 —— AI 生成时依据的原文关键词或文句 */
  evidence?: string[];
  /** RAG 引用的原文片段 ID 列表（来自 /api/generate-day） */
  sourceChunkIds?: string[];
}

interface TimelineProps {
  activities: TimelineActivity[];
}

/* ─────────── 时辰 → 小时映射 ─────────── */
const SHICHEN_TO_HOUR: Record<string, [number, number]> = {
  子: [23, 1],
  丑: [1, 3],
  寅: [3, 5],
  卯: [5, 7],
  辰: [7, 9],
  巳: [9, 11],
  午: [11, 13],
  未: [13, 15],
  申: [15, 17],
  酉: [17, 19],
  戌: [19, 21],
  亥: [21, 23],
};

function parseTimeRange(timeStr: string): [number, number] | null {
  const ch = timeStr.charAt(0);
  const range = SHICHEN_TO_HOUR[ch];
  if (range) return range;
  const m = timeStr.match(/(\d+):(\d+)/);
  if (m) {
    const start = +m[1];
    const em = timeStr.match(/[-~至](\d+):(\d+)/);
    const end = em ? +em[1] : start + 2;
    return [start, end];
  }
  return null;
}

/* ─────────── 组件 ─────────── */
export default function Timeline({ activities }: TimelineProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [sourceExpandedIdx, setSourceExpandedIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const calcActive = useCallback(() => {
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < activities.length; i++) {
      const range = parseTimeRange(activities[i].time);
      if (!range) continue;
      const startMin = range[0] * 60;
      const endMin = range[1] * 60;
      if (curMin >= startMin && curMin < endMin) return i;
    }
    for (let i = 0; i < activities.length; i++) {
      const range = parseTimeRange(activities[i].time);
      if (!range) continue;
      if (curMin < range[0] * 60) return i;
    }
    return activities.length - 1;
  }, [activities]);

  useEffect(() => {
    setMounted(true);
    setActiveIdx(calcActive());
    const id = setInterval(() => setActiveIdx(calcActive()), 60_000);
    return () => clearInterval(id);
  }, [calcActive]);

  useEffect(() => {
    if (!mounted || activeIdx < 0 || hasScrolled.current) return;
    hasScrolled.current = true;
    const timer = setTimeout(() => {
      const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 700);
    return () => clearTimeout(timer);
  }, [activeIdx, mounted]);

  const expand = (i: number) => setExpandedIdx((p) => (p === i ? null : i));
  const toggleSource = (i: number) => setSourceExpandedIdx((p) => (p === i ? null : i));

  return (
    <div className="relative" ref={listRef}>
      {/* ══════ 顶部装饰 ══════ */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-scroll-dark/15 to-gold-accent/25" />
        <div className="w-1 h-1 rounded-full bg-gold-accent/60" />
        <span className="text-[10px] font-chinese tracking-[0.25em] text-ink-light/40 select-none">
          一·日·之·序
        </span>
        <div className="w-1 h-1 rounded-full bg-gold-accent/60" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-scroll-dark/15 to-gold-accent/25" />
      </div>

      {/* ══════ 时间轴主体 ══════ */}
      <div className="relative">
        {/* ── 纵向墨线 ── */}
        <div className="absolute left-[13px] sm:left-[17px] top-3 bottom-3 w-[3px] bg-gradient-to-b from-gold-accent/40 via-gold-accent/20 to-transparent" />

        {activities.map((act, i) => {
          const isActive = i === activeIdx;
          const isExpanded = expandedIdx === i;
          const isPast = activeIdx > -1 && i < activeIdx;

          return (
            <div
              key={i}
              data-idx={i}
              className="relative pl-[38px] sm:pl-[44px] pb-6 sm:pb-7 last:pb-0 group"
              style={{
                animation:
                  mounted && i < 12
                    ? `timeline-in 0.55s ease-out ${i * 0.07}s both`
                    : 'none',
              }}
            >
              {/* ── 时间圆点 ── */}
              <div
                className={`
                  absolute left-0 sm:left-1 top-[7px] w-[26px] h-[26px] sm:w-[32px] sm:h-[32px]
                  rounded-full border-[3px] transition-all duration-500 ease-out z-10
                  ${isActive
                    ? 'border-gold-accent bg-gold-accent shadow-[0_0_20px_rgba(184,135,43,0.6)]'
                    : isPast
                      ? 'border-scroll-dark/20 bg-scroll-dark/10'
                      : 'border-gold-accent/30 bg-rice-paper group-hover:border-gold-accent/70 group-hover:shadow-[0_0_14px_rgba(184,135,43,0.3)]'
                  }
                `}
              >
                <span
                  className={`
                    absolute inset-[5px] rounded-full transition-all duration-500
                    ${isActive ? 'bg-rice-paper animate-pulse' : 'bg-transparent'}
                  `}
                />
              </div>

              {/* ── 当前标记 ── */}
              {isActive && (
                <span
                  className="absolute left-[30px] sm:left-[36px] -top-[6px] text-[9px] leading-none
                             font-chinese text-gold-accent font-bold tracking-wider
                             bg-gold-accent/10 px-1.5 py-1 rounded-sm animate-fade-in"
                >
                  {act.time.charAt(0)}时·当前
                </span>
              )}

              {/* ──── 卡片主体 ──── */}
              <div
                onClick={() => expand(i)}
                className={`
                  relative rounded-lg cursor-pointer overflow-hidden
                  transition-all duration-400 ease-out
                  ${isActive
                    ? 'bg-gradient-to-br from-amber-50/90 to-amber-100/60 shadow-[0_2px_28px_rgba(184,135,43,0.15)]'
                    : isPast
                      ? 'bg-rice-paper/40 hover:bg-rice-paper/70'
                      : 'bg-gradient-to-br from-amber-50/50 to-amber-100/20 hover:from-amber-50/80 hover:to-amber-100/40 hover:shadow-sm'
                  }
                  ${!isActive ? 'hover:-translate-y-0.5' : ''}
                `}
              >
                {/* ── 水墨卷轴风格边框 ── */}
                <div
                  className={`
                    absolute top-0 left-0 right-0 h-[2px] rounded-t-lg
                    ${isActive
                      ? 'bg-gradient-to-r from-transparent via-gold-accent/70 to-transparent'
                      : isPast
                        ? 'bg-gradient-to-r from-transparent via-scroll-dark/10 to-transparent'
                        : 'bg-gradient-to-r from-transparent via-scroll-dark/20 to-transparent group-hover:via-gold-accent/30'
                    }
                  `}
                />
                <div
                  className={`
                    absolute bottom-0 left-0 right-0 h-[1.5px] rounded-b-lg
                    ${isActive
                      ? 'bg-gradient-to-r from-transparent via-gold-accent/40 to-transparent'
                      : isPast
                        ? 'bg-gradient-to-r from-transparent via-scroll-dark/8 to-transparent'
                        : 'bg-gradient-to-r from-transparent via-scroll-dark/12 to-transparent'
                    }
                  `}
                />
                <div
                  className={`
                    absolute top-2 bottom-2 left-0 w-[2px] rounded-full
                    ${isActive
                      ? 'bg-gold-accent/40'
                      : isPast
                        ? 'bg-scroll-dark/8'
                        : 'bg-scroll-dark/10 group-hover:bg-gold-accent/20'
                    }
                    transition-colors duration-400
                  `}
                />
                <span
                  className={`
                    absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] rounded-tr-lg
                    transition-all duration-400
                    ${isActive
                      ? 'border-gold-accent/60 opacity-100'
                      : 'border-scroll-dark/15 opacity-0 group-hover:opacity-60 group-hover:border-gold-accent/30'
                    }
                  `}
                />
                <span
                  className={`
                    absolute bottom-0 left-0 w-5 h-5 border-b-[1.5px] border-l-[1.5px] rounded-bl-lg
                    transition-all duration-400
                    ${isActive
                      ? 'border-gold-accent/60 opacity-100'
                      : 'border-scroll-dark/15 opacity-0 group-hover:opacity-60 group-hover:border-gold-accent/30'
                    }
                  `}
                />

                {/* ──── 卡片内容 ──── */}
                <div className="relative px-4 sm:px-5 py-3 sm:py-4">
                  {/* 第一行：时辰标签 + 展开箭头 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`
                        inline-block text-[11px] sm:text-xs font-chinese font-bold tracking-wider
                        px-2 py-0.5 rounded-[2px] transition-colors
                        ${isActive
                          ? 'text-gold-accent bg-gold-accent/10'
                          : isPast
                            ? 'text-ink-light/35 bg-scroll-dark/5'
                            : 'text-ink-light/55 bg-scroll-dark/6 group-hover:text-gold-accent/70 group-hover:bg-gold-accent/8'
                        }
                      `}
                    >
                      {act.time}
                    </span>

                    {/* 状态指示 */}
                    {isActive && (
                      <span className="text-[10px] font-chinese text-gold-accent/60 tracking-wider animate-fade-in">
                        · 进行中
                      </span>
                    )}
                    {isPast && (
                      <span className="text-[10px] font-chinese text-ink-light/30 tracking-wider">
                        · 已过
                      </span>
                    )}

                    {/* 展开箭头 */}
                    <span
                      className={`
                        ml-auto transition-all duration-400 ease-out flex-shrink-0
                        ${isExpanded ? 'rotate-180' : ''}
                        ${isActive ? 'text-gold-accent/50' : 'text-ink-light/25 group-hover:text-ink-light/50'}
                      `}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </span>
                  </div>

                  {/* 活动名称 */}
                  <h4
                    className={`
                      text-sm sm:text-[15px] font-chinese font-bold transition-colors
                      ${isActive
                        ? 'text-scroll-dark'
                        : isPast
                          ? 'text-scroll-dark/45'
                          : 'text-scroll-dark/85'
                      }
                    `}
                  >
                    {act.title}
                  </h4>

                  {/* 描述（折叠时截断 2 行） */}
                  <p
                    className={`
                      text-xs sm:text-[13px] font-chinese font-light leading-relaxed mt-1.5
                      transition-all duration-300
                      ${isActive ? 'text-scroll-dark/65' : isPast ? 'text-scroll-dark/35' : 'text-scroll-dark/55'}
                      ${isExpanded ? '' : 'line-clamp-2'}
                    `}
                  >
                    {act.description}
                  </p>

                  {/* 展开提示 */}
                  {!isExpanded && (
                    <p
                      className={`
                        text-[10px] font-chinese mt-2 tracking-wider flex items-center gap-1
                        transition-all duration-300
                        ${isActive
                          ? 'text-gold-accent/50'
                          : 'text-ink-light/30 group-hover:text-ink-light/50'
                        }
                      `}
                    >
                      <span>点击展开详情</span>
                      <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                    </p>
                  )}
                </div>

                {/* ──── 展开区域 ──── */}
                <div
                  className={`
                    transition-all duration-400 ease-in-out overflow-hidden
                    ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="relative px-4 sm:px-5 pb-4 sm:pb-5">
                    <div className="h-px bg-gradient-to-r from-transparent via-scroll-dark/12 to-transparent mb-3" />

                    <div className="space-y-3.5">
                      {/* 场景描述 */}
                      <div>
                        <span className="text-[10px] font-chinese text-ink-light/40 tracking-widest block mb-1.5 flex items-center gap-1.5">
                          <span className="w-0.5 h-0.5 bg-ink-light/30 rounded-full" />
                          场景描述
                        </span>
                        <p className="text-xs sm:text-[13px] text-scroll-dark/65 leading-relaxed font-chinese font-light">
                          {act.description}
                        </p>
                      </div>

                      {/* ── 查看原文依据按钮 ── */}
                      {act.originalText && act.chapter && (
                        <div className="pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSource(i);
                            }}
                            className={`
                              w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border text-xs sm:text-sm font-chinese font-bold tracking-wider transition-all duration-300
                              ${isActive
                                ? 'border-gold-accent/30 text-gold-accent bg-gold-accent/5 hover:bg-gold-accent/10 hover:border-gold-accent/50'
                                : 'border-border-warm text-ink-light bg-white/40 hover:bg-rice-paper/60 hover:border-gold-accent/30 hover:text-gold-accent'
                              }
                              ${sourceExpandedIdx === i ? 'rounded-b-none border-b-0' : ''}
                            `}
                          >
                            <span className="text-sm">📜</span>
                            <span>查看原文依据</span>
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-300 ${sourceExpandedIdx === i ? 'rotate-180' : ''}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* 卷轴展开原文面板 */}
                          <div
                            className={`
                              transition-all duration-500 ease-in-out overflow-hidden border border-t-0 rounded-b-sm
                              ${isActive
                                ? 'border-gold-accent/30'
                                : 'border-border-warm'
                              }
                              ${sourceExpandedIdx === i ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
                            `}
                          >
                            <div
                              className={`p-3 sm:p-4 space-y-3 ${
                                isActive ? 'bg-gold-accent/[0.03]' : 'bg-white/30'
                              }`}
                              style={{
                                animation: sourceExpandedIdx === i
                                  ? 'scroll-unfold 0.6s cubic-bezier(0.77, 0, 0.18, 1) both'
                                  : 'none',
                              }}
                            >
                              {/* 上卷轴杆 */}
                              <div className="max-w-xs mx-auto">
                                <div className="scroll-rod !h-2" />
                              </div>

                              {/* 内页 */}
                              <div className="relative bg-gradient-to-b from-amber-50/90 to-amber-100/40 mx-auto px-3 sm:px-4 py-3 border-x border-border-warm/30">
                                <div className="absolute inset-0 ancient-texture opacity-20 pointer-events-none" />

                                {/* 原文 */}
                                <div className="relative z-10 mb-3 pb-2.5 border-b border-border-warm/20">
                                  <span className="text-[9px] font-chinese text-ink-light/40 tracking-widest block mb-1.5">
                                    · 东京梦华录原文 ·
                                  </span>
                                  <p className="text-[13px] sm:text-sm font-chinese text-scroll-dark/80 leading-relaxed italic pl-2.5 border-l-[2px] border-gold-accent/30">
                                    {act.originalText}
                                  </p>
                                </div>

                                {/* 所属章节 */}
                                <div className="relative z-10 mb-3 pb-2.5 border-b border-border-warm/20">
                                  <span className="text-[9px] font-chinese text-ink-light/40 tracking-widest block mb-1">
                                    · 所属章节 ·
                                  </span>
                                  <p className="text-xs sm:text-sm font-chinese font-bold text-secondary tracking-wider">
                                    {act.chapter}
                                  </p>
                                </div>

                                {/* 证据片段 */}
                                {act.evidence && act.evidence.length > 0 && (
                                  <div className="relative z-10 mb-3 pb-2.5 border-b border-border-warm/20">
                                    <span className="text-[9px] font-chinese text-ink-light/40 tracking-widest block mb-1">
                                      · 证据片段 ·
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {act.evidence.map((ev, ei) => (
                                        <span
                                          key={ei}
                                          className={`text-[10px] sm:text-xs font-chinese px-2 py-0.5 rounded-sm border ${
                                            isActive
                                              ? 'text-gold-accent/70 border-gold-accent/20 bg-gold-accent/5'
                                              : 'text-ink-light border-scroll-dark/10 bg-white/50'
                                          }`}
                                        >
                                          {ev}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 现代对应 */}
                                {act.modern && (
                                  <div className="relative z-10">
                                    <span className="text-[9px] font-chinese text-ink-light/40 tracking-widest block mb-1">
                                      · 现代对应 ·
                                    </span>
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[11px] flex-shrink-0 mt-0.5">🔄</span>
                                      <p className="text-xs sm:text-sm font-chinese text-ink-light leading-relaxed">
                                        {act.modern}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 下卷轴杆 */}
                              <div className="max-w-xs mx-auto">
                                <div className="scroll-rod !h-2" />
                              </div>

                              {/* 收起按钮 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSource(i);
                                }}
                                className={`w-full text-center text-[10px] font-chinese tracking-wider py-1 rounded-sm transition-colors ${
                                  isActive
                                    ? 'text-gold-accent/40 hover:text-gold-accent/60'
                                    : 'text-ink-light/30 hover:text-ink-light/50'
                                }`}
                              >
                                △ 收起原文
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 典籍出处 */}
                      <div
                        className={`
                          rounded-[2px] p-2.5 sm:p-3 transition-colors
                          ${isActive
                            ? 'bg-gold-accent/5 border-l-[2px] border-gold-accent/40'
                            : 'bg-scroll-dark/[0.03] border-l-[2px] border-scroll-dark/10'
                          }
                        `}
                      >
                        <span className="text-[10px] font-chinese text-ink-light/50 tracking-widest block mb-1 flex items-center gap-1.5">
                          <span className="text-[11px]">📜</span>
                          典籍出处
                        </span>
                        <p className="text-xs sm:text-[13px] text-scroll-dark/60 font-chinese italic leading-relaxed">
                          {act.source
                            ? `《${act.source}》`
                            : '出处待考 · 此段为艺术创作，后续将接入 AI 动态生成对应典籍引文。'}
                        </p>
                      </div>

                      {/* 现代对应 */}
                      {act.modern && (
                        <div
                          className={`
                            rounded-[2px] p-2.5 sm:p-3 transition-colors
                            ${isActive
                              ? 'bg-gold-accent/3 border-l-[2px] border-gold-accent/20'
                              : 'bg-scroll-dark/[0.02] border-l-[2px] border-scroll-dark/8'
                            }
                          `}
                        >
                          <span className="text-[10px] font-chinese text-ink-light/50 tracking-widest block mb-1 flex items-center gap-1.5">
                            <span className="text-[11px]">🔄</span>
                            现代对应
                          </span>
                          <p className="text-xs sm:text-[13px] text-scroll-dark/55 font-chinese leading-relaxed">
                            {act.modern}
                          </p>
                        </div>
                      )}

                      {/* 收起按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          expand(i);
                        }}
                        className={`
                          w-full text-center text-[10px] font-chinese tracking-wider py-1.5
                          rounded-sm transition-colors
                          ${isActive
                            ? 'text-gold-accent/50 hover:text-gold-accent/70 hover:bg-gold-accent/5'
                            : 'text-ink-light/30 hover:text-ink-light/50 hover:bg-scroll-dark/5'
                          }
                        `}
                      >
                        △ 收起
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════ 底部装饰 ══════ */}
      <div className="flex items-center gap-2 mt-4 sm:mt-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-accent/25 to-scroll-dark/15" />
        <div className="w-1 h-1 rounded-full bg-gold-accent/60" />
        <span className="text-[10px] font-chinese tracking-[0.2em] text-ink-light/35 select-none">
          日·升·月·落
        </span>
        <div className="w-1 h-1 rounded-full bg-gold-accent/60" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-accent/25 to-scroll-dark/15" />
      </div>
    </div>
  );
}
