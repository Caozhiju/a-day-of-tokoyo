'use client';

import { useState } from 'react';
import type { CivilizationChain } from '@/data/civilization-chains';

interface CivilizationChainCardProps {
  chain: CivilizationChain;
  matchedActivities: string[];
  matchScore: number;
  delay?: number;
}

export default function CivilizationChainCard({
  chain,
  matchedActivities,
  matchScore,
  delay = 0,
}: CivilizationChainCardProps) {
  const [expanded, setExpanded] = useState(false);

  const eras = [
    { label: '宋代生活', key: 'song', text: chain.song },
    { label: '明清演化', key: 'mingQing', text: chain.mingQing },
    { label: '近代演化', key: 'republic', text: chain.republic },
    { label: '现代形态', key: 'modern', text: chain.modern },
  ] as const;

  return (
    <div
      className="group h-full"
      style={{ animation: `card-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both` }}
    >
      <div className="relative h-full">
        <div
          className="absolute -inset-[2px] rounded-2xl opacity-0 blur-md transition-all duration-500 group-hover:opacity-40"
          style={{ background: 'linear-gradient(135deg, rgba(184,135,43,0.25), transparent, rgba(184,135,43,0.15))' }}
        />
        <div
          className={`relative h-full rounded-2xl bg-white/80 border transition-all duration-400 group-hover:shadow-md group-hover:-translate-y-1 ${
            expanded ? 'border-gold-accent/40' : 'border-border-warm shadow-sm'
          }`}
        >
          <span className="absolute top-0 right-0 w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20 rounded-tr-2xl" />
          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-gold-accent/20 rounded-bl-2xl" />

          {/* ── 头部 ── */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-chinese font-bold text-secondary tracking-wider">
                传承链 · 匹配 {matchScore}
              </span>
              <span className="text-xs font-chinese text-ink-light/60">
                {matchedActivities.length} 项活动
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{chain.icon}</span>
              <h3 className="text-lg sm:text-xl font-chinese font-bold text-scroll-dark">{chain.element}</h3>
            </div>
            {matchedActivities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {matchedActivities.slice(0, 3).map((m, i) => (
                  <span key={i} className="text-xs font-chinese text-ink-light border border-border-warm px-2 py-0.5 rounded-sm">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── 时间轴 ── */}
          <div className="px-5 pb-4">
            <div className="relative">
              {eras.map((era, i) => (
                <div key={era.key} className="flex gap-3 pb-3 last:pb-0">
                  {/* 时间轴装饰 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors duration-300 ${
                        expanded ? 'bg-gold-accent border-gold-accent' : 'bg-white border-gold-accent/40'
                      }`}
                    />
                    {i < eras.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-gold-accent/30 to-gold-accent/10 min-h-[24px]" />
                    )}
                  </div>
                  {/* 内容 */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-chinese font-bold text-secondary tracking-wider">{era.label}</span>
                    </div>
                    {expanded || i === 0 ? (
                      <p className="text-sm sm:text-base font-chinese text-scroll-dark/65 leading-relaxed font-light">
                        {era.text}
                      </p>
                    ) : (
                      <p className="text-sm font-chinese text-ink-light/40 italic">展开查看</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 展开/收起 ── */}
          <div className="px-5 pb-5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-center text-sm font-chinese tracking-wider text-gold-accent hover:text-scroll-dark transition-colors py-2 rounded-sm border border-gold-accent/20 hover:border-gold-accent/40"
            >
              {expanded ? '收起 ^' : '展开完整传承链 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
