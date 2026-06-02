'use client';

import { useEffect, useState, useRef } from 'react';

/* ─────────── 三阶段文案 ─────────── */
const STAGES = [
  { text: '正在翻阅《东京梦华录》……', sub: '孟元老著 · 十卷本 · 东京风物志' },
  { text: '正在寻找东京城踪迹……', sub: '朱雀门 · 州桥 · 潘楼街 · 马行街' },
  { text: '正在重建你的北宋人生……', sub: '身份已定 · 时辰已至 · 故事将启' },
] as const;

/* ─────────── 组件 ─────────── */
export default function GeneratingOverlay() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();
    const DURATION = 3200; // 总时长 ≈ 3.2 秒
    const STAGE_DURATION = DURATION / STAGES.length; // 每段 ~1067ms

    /* ── 阶段切换 ── */
    const stageTimer = setInterval(() => {
      setStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        clearInterval(stageTimer);
        return prev;
      });
    }, STAGE_DURATION);

    /* ── 进度条 ── */
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(progressTimer);
        // 完成后短暂停留再收起
        setTimeout(() => setVisible(false), 400);
      }
    }, 30);

    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="relative w-full animate-fade-in"
      style={{ animation: 'fade-in 0.5s ease-out both' }}
    >
      {/* ══════ 上卷轴杆 ══════ */}
      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8">
        <div className="scroll-rod" />
      </div>

      {/* ══════ 卷轴本体内页 ══════ */}
      <div
        className="relative mx-auto max-w-2xl px-6 sm:px-10 py-10 sm:py-14"
        style={{
          animation: 'scroll-unfold 0.8s cubic-bezier(0.77, 0, 0.18, 1) both',
        }}
      >
        {/* 古籍纹理叠加 */}
        <div className="absolute inset-0 ancient-texture opacity-30 pointer-events-none" />

        {/* 内容 */}
        <div className="relative z-10 text-center space-y-6 sm:space-y-8">
          {/* ── 阶段图标 ── */}
          <div className="flex justify-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16">
              {/* 外圈 */}
              <div className="absolute inset-0 rounded-full border-2 border-gold-accent/30 animate-pulse" />
              {/* 内圈旋转 */}
              <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-gold-accent/70 animate-spin"
                style={{ animationDuration: '1.8s' }}
              />
              {/* 中央图标 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl sm:text-2xl transition-all duration-500"
                  style={{
                    opacity: stage === 0 ? 1 : 0.3,
                    transform: `scale(${stage === 0 ? 1 : 0.8})`,
                    transition: 'all 0.5s ease-out',
                  }}
                >
                  📜
                </span>
                <span className="absolute text-xl sm:text-2xl transition-all duration-500"
                  style={{
                    opacity: stage === 1 ? 1 : 0.3,
                    transform: `scale(${stage === 1 ? 1 : 0.8})`,
                    transition: 'all 0.5s ease-out',
                  }}
                >
                  🏮
                </span>
                <span className="absolute text-xl sm:text-2xl transition-all duration-500"
                  style={{
                    opacity: stage === 2 ? 1 : 0.3,
                    transform: `scale(${stage === 2 ? 1 : 0.8})`,
                    transition: 'all 0.5s ease-out',
                  }}
                >
                  🖌️
                </span>
              </div>
            </div>
          </div>

          {/* ── 主文案 ── */}
          <div className="h-12 sm:h-14 flex items-center justify-center">
            {STAGES.map((s, i) => (
              <p
                key={i}
                className={`
                  absolute font-chinese font-bold text-scroll-dark transition-all duration-500
                  ${i === stage
                    ? 'opacity-100 translate-y-0 text-base sm:text-lg tracking-wider'
                    : i < stage
                      ? 'opacity-0 -translate-y-3 text-sm'
                      : 'opacity-0 translate-y-3 text-sm'
                  }
                `}
              >
                {s.text}
              </p>
            ))}
          </div>

          {/* ── 副文案 ── */}
          <div className="h-4 flex items-center justify-center">
            {STAGES.map((s, i) => (
              <span
                key={i}
                className={`
                  absolute font-chinese text-ink-light/40 transition-all duration-500 text-[11px] sm:text-xs tracking-wider
                  ${i === stage
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                  }
                `}
              >
                {s.sub}
              </span>
            ))}
          </div>

          {/* ── 进度条 ── */}
          <div className="max-w-xs mx-auto pt-2">
            <div className="relative h-[2px] bg-scroll-dark/10 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-accent/40 via-gold-accent to-gold-accent/60 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* 百分比提示 */}
            <p className="text-[10px] font-chinese text-ink-light/25 mt-2 tracking-widest select-none">
              {Math.round(progress * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* ══════ 下卷轴杆 ══════ */}
      <div className="max-w-2xl mx-auto px-4 pb-6 sm:pb-8">
        <div className="scroll-rod" />
      </div>

      {/* ══════ 墨迹装饰：底部浸染 ══════ */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-scroll-dark/5 to-transparent blur-xl rounded-full pointer-events-none" />
    </div>
  );
}
