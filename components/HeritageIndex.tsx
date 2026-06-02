'use client';

import { useEffect, useState } from 'react';
import type { HeritageDimension, HeritageIndexReport } from '@/data/heritage-index';

/* ─────────── 单维度环形图 ─────────── */
function SingleRing({ dimension, delay }: { dimension: HeritageDimension; delay: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(dimension.score), delay * 1000 + 300);
    return () => clearTimeout(timer);
  }, [dimension.score, delay]);

  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animatedScore / 100) * circumference;

  const hue = 42 - (animatedScore / 100) * 8;
  const saturation = 60 + (animatedScore / 100) * 20;
  const lightness = 35 + (animatedScore / 100) * 20;
  const strokeColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return (
    <div className="flex flex-col items-center text-center" style={{ animation: `fade-slide-up 0.5s ease-out ${delay}s both` }}>
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#D8C8A8" strokeWidth="6" opacity="0.3" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', opacity: 0.85 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-black text-scroll-dark leading-none">{animatedScore}</span>
          <span className="text-sm font-chinese font-bold text-ink-light">分</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xl">{dimension.icon}</span>
        <span className="text-base sm:text-lg font-chinese font-bold text-scroll-dark">{dimension.label}</span>
      </div>
      {dimension.evidence && (
        <p className="text-sm font-chinese text-ink-light leading-relaxed max-w-[160px] line-clamp-2">{dimension.evidence}</p>
      )}
    </div>
  );
}

/* ─────────── 综合环形图 ─────────── */
function ComprehensiveRing({ report, delay }: { report: HeritageIndexReport; delay: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(report.comprehensive), delay * 1000 + 300);
    return () => clearTimeout(timer);
  }, [report.comprehensive, delay]);

  const r = 56;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animatedScore / 100) * circumference;
  const goldFrom = '#8B6B2E';
  const goldTo = '#B8872B';

  return (
    <div className="flex flex-col items-center text-center" style={{ animation: `stat-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both` }}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ background: `radial-gradient(circle, ${goldFrom}30, transparent 70%)` }} />
        <div className="relative w-36 h-36 sm:w-40 sm:h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={r} fill="none" stroke="#D8C8A8" strokeWidth="8" opacity="0.25" />
            <circle
              cx="65" cy="65" r={r} fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: 'drop-shadow(0 0 8px rgba(184,135,43,0.4))' }}
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={goldFrom} />
                <stop offset="100%" stopColor={goldTo} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-chinese font-bold text-secondary tracking-widest">综合</span>
            <span className="text-4xl sm:text-5xl font-black text-scroll-dark leading-none mt-1">{animatedScore}</span>
            <span className="text-sm font-chinese font-bold text-ink-light">分</span>
          </div>
        </div>
      </div>
      <div className="mt-4 max-w-sm">
        <div className="flex items-center gap-3 mb-2 justify-center">
          <div className="h-px w-10 bg-gradient-to-r from-transparent via-gold-accent/40 to-transparent" />
          <span className="text-sm font-chinese font-bold text-secondary tracking-widest">传承评语</span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent via-gold-accent/40 to-transparent" />
        </div>
        <p className="text-base sm:text-lg font-chinese text-scroll-dark/75 leading-relaxed italic">{report.summary}</p>
      </div>
    </div>
  );
}

/* ─────────── 主组件 ─────────── */
interface HeritageIndexProps { report: HeritageIndexReport; mounted: boolean; }

export default function HeritageIndex({ report, mounted }: HeritageIndexProps) {
  if (!mounted) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-warm to-transparent" />
        <div className="flex items-center gap-3 px-2">
          <span className="w-2.5 h-2.5 bg-gold-accent rounded-full" />
          <span className="title-section">文明传承指数</span>
          <span className="text-base sm:text-lg font-chinese text-ink-light/40 tracking-wider">· 多维评估</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-warm to-transparent" />
      </div>

      <div className="text-center mb-7">
        <p className="text-body italic max-w-2xl mx-auto">
          从市井烟火到书斋雅趣——你的每一步体验，都在为这份文明的传承增添温度。
        </p>
      </div>

      <div className="card-premium p-6 sm:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {report.dimensions.map((dim, i) => (
            <SingleRing key={dim.id} dimension={dim} delay={i * 0.15} />
          ))}
        </div>

        <div className="flex items-center gap-3 my-6 sm:my-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-warm to-transparent" />
          <span className="text-base font-chinese font-bold text-secondary tracking-[0.3em]">综合评定</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-warm to-transparent" />
        </div>

        <ComprehensiveRing report={report} delay={0.6} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-5">
        {report.dimensions.map((dim, i) => (
          <div key={dim.id} className="text-center" style={{ animation: `fade-slide-up 0.4s ease-out ${0.8 + i * 0.1}s both` }}>
            <p className="text-sm sm:text-base font-chinese text-ink-light leading-relaxed">{dim.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
