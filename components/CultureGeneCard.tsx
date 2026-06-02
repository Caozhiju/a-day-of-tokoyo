'use client';

import { useState } from 'react';
import type { CultureGene } from '@/data/culture-genes';

interface CultureGeneCardProps {
  gene: CultureGene;
  matchedActivities: string[];
  matchScore: number;
  delay?: number;
}

export default function CultureGeneCard({ gene, matchedActivities, matchScore, delay = 0 }: CultureGeneCardProps) {
  const [flipped, setFlipped] = useState(false);
  const topMatches = matchedActivities.slice(0, 2);

  return (
    <div
      className="group h-full"
      style={{ animation: `card-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both` }}
    >
      <div className="relative h-full">
        <div className="absolute -inset-[2px] rounded-2xl opacity-0 blur-md transition-all duration-500 group-hover:opacity-40"
          style={{ background: 'linear-gradient(135deg, rgba(184,135,43,0.25), transparent, rgba(184,135,43,0.15))' }}
        />
        <div className={`relative h-full rounded-2xl bg-white/80 border border-border-warm shadow-sm transition-all duration-400 group-hover:shadow-md group-hover:-translate-y-1 ${flipped ? 'border-gold-accent/40' : ''}`}>
          <span className="absolute top-0 right-0 w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20 rounded-tr-2xl" />
          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-gold-accent/20 rounded-bl-2xl" />

          {/* ── 正面 ── */}
          <div className={flipped ? 'hidden' : 'block'}>
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-chinese font-bold text-secondary tracking-wider">
                  {gene.domain}
                </span>
                <span className="text-sm font-chinese text-ink-light/60">匹配 {matchScore}</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{gene.icon}</span>
                <h3 className="text-lg sm:text-xl font-chinese font-bold text-scroll-dark">{gene.element}</h3>
              </div>
              {topMatches.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {topMatches.map((m, i) => (
                    <span key={i} className="text-sm font-chinese text-ink-light border border-border-warm px-2 py-0.5 rounded-sm">
                      ↑ {m}
                    </span>
                  ))}
                  {matchedActivities.length > 2 && (
                    <span className="text-sm font-chinese text-ink-light/40">+{matchedActivities.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 pb-2">
              <p className="text-sm font-chinese text-ink-light/60 tracking-widest mb-1">宋代形态</p>
              <p className="text-sm sm:text-base font-chinese text-scroll-dark/65 leading-relaxed font-light line-clamp-3">{gene.songForm}</p>
            </div>

            <div className="mx-5 h-px bg-gradient-to-r from-border-warm/50 via-gold-accent/15 to-border-warm/50" />

            <div className="px-5 py-2">
              <p className="text-sm font-chinese text-ink-light/60 tracking-widest mb-1 flex items-center gap-1">→ 现代形态</p>
              <p className="text-sm sm:text-base font-chinese text-ink-light leading-relaxed font-light line-clamp-2">{gene.modernForm}</p>
            </div>

            <div className="px-5 pb-5 pt-2">
              <button
                onClick={() => setFlipped(true)}
                className="w-full text-center text-sm font-chinese tracking-wider text-gold-accent hover:text-scroll-dark transition-colors py-2 rounded-sm border border-gold-accent/20 hover:border-gold-accent/40"
              >
                查看传承 →
              </button>
            </div>
          </div>

          {/* ── 背面 ── */}
          <div className={flipped ? 'block' : 'hidden'}>
            <div className="px-5 pt-6 pb-5 min-h-[260px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{gene.icon}</span>
                <button onClick={() => setFlipped(false)} className="text-sm font-chinese text-ink-light/50 hover:text-scroll-dark transition-colors">
                  ← 返回
                </button>
              </div>
              <h3 className="text-lg sm:text-xl font-chinese font-bold text-scroll-dark mb-1">{gene.element}</h3>

              <div className="flex items-center gap-2 my-4">
                <div className="w-2 h-2 rounded-full bg-scroll-dark/15" />
                <div className="h-px flex-1 bg-gradient-to-r from-scroll-dark/10 to-gold-accent/25" />
                <span className="text-sm font-chinese tracking-[0.3em] text-gold-accent/50">传·承</span>
                <div className="h-px flex-1 bg-gradient-to-l from-scroll-dark/10 to-gold-accent/25" />
                <div className="w-2 h-2 rounded-full bg-scroll-dark/15" />
              </div>

              <div className="flex-1 flex items-center justify-center py-3">
                <div className="relative">
                  <span className="absolute -top-4 -left-3 text-5xl text-gold-accent/10 font-serif leading-none">"</span>
                  <p className="text-base sm:text-lg font-chinese text-scroll-dark/70 leading-relaxed text-center italic px-6">
                    {gene.heritage}
                  </p>
                  <span className="absolute -bottom-5 -right-3 text-5xl text-gold-accent/10 font-serif leading-none">"</span>
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-accent/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-gold-accent/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-gold-accent/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
