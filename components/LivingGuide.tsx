'use client';

import type { TokyoRecommendation } from '@/data/recommendation';

interface LivingGuideProps {
  recommendation: TokyoRecommendation;
  mounted: boolean;
}

export default function LivingGuide({ recommendation, mounted }: LivingGuideProps) {
  if (!mounted) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-warm to-transparent" />
        <div className="flex items-center gap-3 px-2">
          <span className="w-2.5 h-2.5 bg-gold-accent rounded-full" />
          <span className="title-section">如果你生活在东京城</span>
          <span className="text-base sm:text-lg font-chinese text-ink-light/40 tracking-wider">· 专属建议</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-warm to-transparent" />
      </div>

      <div className="card-premium p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-bl from-gold-accent/8 to-transparent rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full blur-xl" />
        </div>

        <div className="relative z-10">
          {/* 引语 */}
          <div className="text-center mb-7">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent via-gold-accent/30 to-transparent" />
              <span className="text-sm font-chinese font-bold text-secondary tracking-[0.25em]">如·果·穿·越</span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent via-gold-accent/30 to-transparent" />
            </div>
            <p className="text-body italic max-w-xl mx-auto">
              根据你今日的体验轨迹，我们为你勾勒了最适合的东京生活方式
            </p>
          </div>

          {/* 三卡 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            <div
              className="relative bg-white/70 border border-border-warm rounded-xl p-5 sm:p-6 text-center group hover:shadow-md transition-all duration-300"
              style={{ animation: 'stat-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}
            >
              <span className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-gold-accent/20" />
              <div className="text-4xl sm:text-5xl mb-3">{recommendation.occupationIcon}</div>
              <p className="text-sm font-chinese font-bold text-secondary tracking-widest mb-1.5">最适合职业</p>
              <h3 className="text-xl sm:text-2xl font-chinese font-bold text-scroll-dark">{recommendation.bestOccupation}</h3>
            </div>
            <div
              className="relative bg-white/70 border border-border-warm rounded-xl p-5 sm:p-6 text-center group hover:shadow-md transition-all duration-300"
              style={{ animation: 'stat-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both' }}
            >
              <span className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-gold-accent/20" />
              <div className="text-4xl sm:text-5xl mb-3">{recommendation.locationIcon}</div>
              <p className="text-sm font-chinese font-bold text-secondary tracking-widest mb-1.5">推荐地点</p>
              <h3 className="text-xl sm:text-2xl font-chinese font-bold text-scroll-dark">{recommendation.recommendedLocation}</h3>
            </div>
            <div
              className="relative bg-white/70 border border-border-warm rounded-xl p-5 sm:p-6 text-center group hover:shadow-md transition-all duration-300"
              style={{ animation: 'stat-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both' }}
            >
              <span className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-gold-accent/20" />
              <div className="text-4xl sm:text-5xl mb-3">{recommendation.activityIcon}</div>
              <p className="text-sm font-chinese font-bold text-secondary tracking-widest mb-1.5">推荐活动</p>
              <h3 className="text-xl sm:text-2xl font-chinese font-bold text-scroll-dark">{recommendation.recommendedActivity}</h3>
            </div>
          </div>

          {/* 原因 */}
          <div className="mt-6" style={{ animation: 'fade-slide-up 0.5s ease-out 0.4s both' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-warm to-transparent" />
              <span className="text-sm font-chinese font-bold text-secondary tracking-widest">推·荐·原·因</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-warm to-transparent" />
            </div>
            <div className="bg-white/60 border border-border-warm rounded-xl p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-[3px] self-stretch bg-gradient-to-b from-gold-accent/50 via-gold-accent/20 to-transparent rounded-full flex-shrink-0" />
                <p className="text-base sm:text-lg font-chinese text-scroll-dark/75 leading-relaxed">{recommendation.reason}</p>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="text-center mt-5" style={{ animation: 'fade-slide-up 0.5s ease-out 0.5s both' }}>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent via-gold-accent/30 to-transparent" />
              <span className="text-base sm:text-lg font-chinese italic text-gold-accent/70 tracking-wider">{recommendation.tagline}</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent via-gold-accent/30 to-transparent" />
            </div>
          </div>
        </div>

        <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-accent/20" />
        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-accent/20" />
      </div>
    </div>
  );
}
