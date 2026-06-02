'use client';

import { useState, useCallback } from 'react';
import type { CivilizationSummaryResponse } from '@/app/api/generate-summary/route';

interface CivilizationSummaryProps {
  activities: { time: string; title: string; description: string; modern: string }[];
  mounted: boolean;
}

export default function CivilizationSummary({ activities, mounted }: CivilizationSummaryProps) {
  const [summary, setSummary] = useState<CivilizationSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (loading || generated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '请求失败' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data: CivilizationSummaryResponse = await res.json();
      setSummary(data);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络异常');
    } finally {
      setLoading(false);
    }
  }, [activities, loading, generated]);

  if (!mounted) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-warm to-transparent" />
        <div className="flex items-center gap-3 px-2">
          <span className="w-2.5 h-2.5 bg-gold-accent rounded-full" />
          <span className="title-section">文明传承总结</span>
          <span className="text-base sm:text-lg font-chinese text-ink-light/40 tracking-wider">· AI 生成</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-warm to-transparent" />
      </div>

      <div className="card-premium overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-gold-accent/5 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/15 to-transparent rounded-full blur-xl" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 py-8 sm:py-10">
          {/* 未生成 */}
          {!generated && !loading && !error && (
            <div className="text-center py-10">
              <div className="text-5xl mb-5">✍️</div>
              <p className="text-body mb-5 leading-relaxed max-w-lg mx-auto">
                让 AI 为你的东京一日撰写一篇文明传承总结——
                <br />从晨读到夜市，从一盏茶到一页书，看见千年文明如何在日常中延续。
              </p>
              <button
                onClick={handleGenerate}
                className="group relative px-10 py-4 bg-scroll-dark text-rice-paper font-chinese font-bold text-base rounded-none overflow-hidden transition-all duration-300 hover:bg-gold-accent hover:text-scroll-dark shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <span className="absolute inset-0 bg-gold-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <span className="relative flex items-center gap-2">
                  <span>生成文明总结</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </span>
              </button>
            </div>
          )}

          {/* 加载 */}
          {loading && (
            <div className="text-center py-12">
              <div className="flex justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-gold-accent rounded-full" style={{ animation: `fade-in 0.6s ease-out ${i * 0.12}s infinite alternate` }} />
                ))}
              </div>
              <p className="text-xl font-chinese text-ink-light tracking-wider animate-pulse">正在梳理千年文脉……</p>
              <p className="text-base font-chinese text-ink-light/60 mt-2">从你的一日活动中提炼文明传承的脉络</p>
            </div>
          )}

          {/* 错误 */}
          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-base font-chinese text-red-400/80 mb-4">{error}</p>
              <button onClick={handleGenerate} className="text-base font-chinese text-gold-accent hover:text-scroll-dark transition-colors underline underline-offset-4">点击重试</button>
            </div>
          )}

          {/* 结果 */}
          {summary && !loading && (
            <div className="space-y-6" style={{ animation: 'fade-slide-up 0.6s ease-out both' }}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-10 bg-gradient-to-r from-transparent via-gold-accent/50 to-transparent" />
                  <span className="text-base font-chinese font-bold text-secondary tracking-[0.3em]">传承</span>
                  <div className="h-px w-10 bg-gradient-to-l from-transparent via-gold-accent/50 to-transparent" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-scroll-dark ink-brush">{summary.title}</h2>
              </div>

              <div className="relative max-w-3xl mx-auto">
                <span className="absolute -top-4 -left-2 text-6xl text-gold-accent/12 font-serif leading-none select-none">&ldquo;</span>
                <p className="text-lg sm:text-xl font-chinese text-scroll-dark/75 leading-relaxed sm:leading-loose text-center px-6 sm:px-10 whitespace-pre-line">{summary.summary}</p>
                <span className="absolute -bottom-8 -right-2 text-6xl text-gold-accent/12 font-serif leading-none select-none">&rdquo;</span>
              </div>

              {summary.keyword && summary.keyword.length > 0 && (
                <div className="flex justify-center gap-3 pt-3">
                  {summary.keyword.map((kw, i) => (
                    <span key={i} className="text-base font-chinese text-ink-light tracking-wider border border-border-warm px-4 py-1.5 rounded-full bg-white/50">
                      # {kw}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-center pt-2">
                <span className="text-sm font-chinese text-ink-light/40 tracking-[0.2em] select-none">由 AI 根据你的体验生成 · 文明在每一个日常中延续</span>
              </div>
            </div>
          )}
        </div>

        <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-accent/25" />
        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-accent/25" />
      </div>
    </div>
  );
}
