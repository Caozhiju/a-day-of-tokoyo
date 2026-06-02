'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { identities } from '@/data/identities';
import IdentityCard from '@/components/IdentityCard';

export default function IdentityPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectIdentity = (id: string) => {
    setSelectedId(id);
    setIsLoading(true);

    const identity = identities.find((i) => i.id === id);
    if (identity) {
      setTimeout(() => {
        router.push(`/experience?role=${encodeURIComponent(identity.name)}`);
      }, 300);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* ==================== 背景层 ==================== */}
      <div className="fixed inset-0 z-0">
        {/* 古籍纹理 */}
        <div className="absolute inset-0 ancient-texture opacity-40" />

        {/* 大型水墨晕染 */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-gradient-to-b from-transparent via-amber-100 to-transparent opacity-[0.07] blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-t from-transparent via-amber-200 to-transparent opacity-[0.06] blur-3xl rounded-full" />

        {/* 中心微光 */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-gold-accent/5 via-transparent to-transparent blur-2xl" />
      </div>

      {/* ==================== 宋代人物剪影（背景氛围） ==================== */}

      {/* 左：文人剪影 */}
      <div
        className={`hidden lg:block fixed left-6 xl:left-10 top-1/2 -translate-y-1/2 z-[1] pointer-events-none select-none transition-opacity duration-1000 ${
          mounted ? 'opacity-[0.06]' : 'opacity-0'
        }`}
        style={{ animation: 'silhouette-float 6s ease-in-out infinite' }}
      >
        <svg width="95" height="360" viewBox="0 0 95 360" fill="currentColor" className="text-scroll-dark">
          {/* 东坡巾 */}
          <path d="M22,4 L68,4 L68,10 L74,12 L74,18 L60,20 L28,20 L16,18 L16,12 Z" />
          {/* 首 */}
          <circle cx="45" cy="34" r="12" />
          {/* 肩 */}
          <path d="M16,46 Q45,42 74,46 L72,52 Q45,48 18,52 Z" />
          {/* 袍 */}
          <path d="M20,54 L16,84 L6,352 L84,352 L74,84 L70,54 Z" />
          {/* 左袖 */}
          <path d="M20,68 C8,96 2,118 8,130 C14,140 24,132 28,110 L32,86 Z" />
          {/* 右袖 */}
          <path d="M70,68 C82,96 88,118 82,130 C76,140 66,132 62,110 L58,86 Z" />
        </svg>
      </div>

      {/* 右：仕女剪影 */}
      <div
        className={`hidden lg:block fixed right-6 xl:right-10 top-1/3 z-[1] pointer-events-none select-none transition-opacity duration-1000 delay-300 ${
          mounted ? 'opacity-[0.05]' : 'opacity-0'
        }`}
        style={{ animation: 'silhouette-float-2 7s ease-in-out infinite 1s' }}
      >
        <svg width="80" height="340" viewBox="0 0 80 340" fill="currentColor" className="text-scroll-dark">
          {/* 高髻 */}
          <ellipse cx="40" cy="16" rx="12" ry="10" />
          <ellipse cx="36" cy="8" rx="8" ry="6" />
          <ellipse cx="46" cy="10" rx="6" ry="5" />
          {/* 首 */}
          <circle cx="40" cy="32" r="10" />
          {/* 肩 */}
          <path d="M18,43 Q40,40 62,43 L60,48 Q40,45 20,48 Z" />
          {/* 长裙 */}
          <path d="M22,50 L18,80 L8,332 L72,332 L62,80 L58,50 Z" />
          {/* 披帛 */}
          <path d="M22,66 C10,96 4,120 10,132 C16,140 26,130 30,108 L34,82 Z" />
          <path d="M58,66 C70,96 76,118 70,130 C64,138 54,128 50,108 L46,82 Z" />
          {/* 裙带 */}
          <path d="M34,82 L32,160 L36,162 L38,82 Z" opacity="0.3" />
          <path d="M46,82 L48,160 L44,162 L42,82 Z" opacity="0.3" />
        </svg>
      </div>

      {/* 右下方：侍者/茶人剪影（较小） */}
      <div
        className={`hidden xl:block fixed right-16 bottom-[15%] z-[1] pointer-events-none select-none transition-opacity duration-1000 delay-500 ${
          mounted ? 'opacity-[0.04]' : 'opacity-0'
        }`}
        style={{ animation: 'silhouette-float 8s ease-in-out infinite 2s' }}
      >
        <svg width="65" height="260" viewBox="0 0 65 260" fill="currentColor" className="text-scroll-dark">
          {/* 小帽 */}
          <ellipse cx="32" cy="14" rx="14" ry="5" />
          <rect x="22" y="8" width="20" height="7" rx="2" />
          {/* 首 */}
          <circle cx="32" cy="28" r="9" />
          {/* 肩 */}
          <path d="M16,37 Q32,35 48,37 L46,41 Q32,39 18,41 Z" />
          {/* 袍 */}
          <path d="M20,43 L18,66 L8,252 L56,252 L46,66 L44,43 Z" />
          {/* 左袖 */}
          <path d="M20,54 C12,74 8,90 12,98 C16,104 22,98 24,84 L26,66 Z" />
          {/* 右袖（捧物） */}
          <path d="M44,54 C52,72 56,86 52,92 C48,96 42,90 40,78 L38,66 Z" />
          {/* 茶盏 */}
          <rect x="50" y="88" width="10" height="8" rx="1" />
          <ellipse cx="55" cy="88" rx="5" ry="1.5" />
        </svg>
      </div>

      {/* ==================== 祥云装饰 ==================== */}
      {mounted && (
        <>
          <div
            className="hidden md:block fixed top-[18%] left-[8%] z-[1] pointer-events-none select-none"
            style={{ animation: 'cloud-drift 12s ease-in-out infinite' }}
          >
            <svg width="160" height="40" viewBox="0 0 200 50" fill="currentColor" className="text-gold-accent opacity-[0.06]">
              <path d="M30,35 Q30,22 45,22 Q55,10 70,18 Q80,8 95,18 Q110,8 120,18 Q135,12 145,22 Q160,22 160,35 Q160,44 145,44 L45,44 Q30,44 30,35 Z" />
            </svg>
          </div>
          <div
            className="hidden md:block fixed bottom-[22%] right-[10%] z-[1] pointer-events-none select-none"
            style={{ animation: 'cloud-drift 15s ease-in-out infinite 4s' }}
          >
            <svg width="120" height="30" viewBox="0 0 200 50" fill="currentColor" className="text-gold-accent opacity-[0.04]">
              <path d="M30,35 Q30,22 45,22 Q55,10 70,18 Q80,8 95,18 Q110,8 120,18 Q135,12 145,22 Q160,22 160,35 Q160,44 145,44 L45,44 Q30,44 30,35 Z" />
            </svg>
          </div>
        </>
      )}

      {/* ==================== 内容容器 ==================== */}
      <div className="relative z-10 w-full">
        {/* ===== 导航栏 ===== */}
        <nav
          className="sticky top-0 z-20 bg-rice-paper/90 backdrop-blur-md border-b border-scroll-dark border-opacity-10"
          style={{
            animation: mounted ? 'fade-slide-down 0.5s ease-out both' : 'none',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="text-sm font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors duration-300"
                >
                  ← 梦华一日
                </a>
              </div>
              <div className="hidden md:flex space-x-8 items-center">
                <a
                  href="/"
                  className="text-sm text-scroll-dark hover:text-gold-accent transition-colors font-chinese"
                >
                  首页
                </a>
                <a
                  href="#identities"
                  className="text-sm text-scroll-dark hover:text-gold-accent transition-colors font-chinese"
                >
                  身份
                </a>
              </div>
              <div className="md:hidden">
                <button className="inline-flex items-center justify-center p-2 rounded-md text-scroll-dark hover:text-gold-accent">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* ===== 主内容（卷轴展开效果） ===== */}
        <div
          className="relative"
          style={{
            animation: mounted ? 'scroll-unfold 1.2s cubic-bezier(0.77, 0, 0.18, 1) 0.1s both' : 'none',
          }}
        >
          {/* ---- 上卷轴杆 ---- */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
            <div className="scroll-rod" />
          </div>

          {/* ---- 卷轴本体内页 ---- */}
          <div className="relative bg-rice-paper/40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            {/* 标题区 */}
            <div
              className="max-w-4xl mx-auto"
              style={{
                animation: mounted ? 'fade-slide-up 0.8s ease-out 0.3s both' : 'none',
              }}
            >
              {/* 装饰线 */}
              <div className="flex justify-center items-center mb-8 space-x-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-scroll-dark/20 to-scroll-dark/20" />
                <div className="relative">
                  <div className="w-2 h-2 bg-gold-accent rounded-full animate-pulse" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-scroll-dark/20 to-scroll-dark/20" />
              </div>

              {/* 主标题 */}
              <div className="text-center mb-4">
                <p
                  className="text-xs sm:text-sm font-chinese text-ink-light tracking-[0.3em] uppercase mb-3"
                  style={{
                    animation: mounted ? 'fade-slide-up 0.6s ease-out 0.4s both' : 'none',
                  }}
                >
                  穿越千年的角色选择
                </p>
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-chinese font-black text-scroll-dark mb-4 leading-tight"
                  style={{
                    animation: mounted ? 'ink-spread 1s ease-out 0.5s both' : 'none',
                  }}
                >
                  <span className="ink-brush inline-block">请选择你的东京身份</span>
                </h1>
                <div className="flex justify-center gap-2 mb-5">
                  <span className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                  <span className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                  <span className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                  <span className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                  <span className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                </div>
                <h2
                  className="text-base sm:text-lg md:text-xl font-chinese text-ink-light font-light tracking-wide"
                  style={{
                    animation: mounted ? 'fade-slide-up 0.6s ease-out 0.6s both' : 'none',
                  }}
                >
                  每一种身份，都有不同的一天
                </h2>
              </div>

              {/* 装饰分隔 */}
              <div className="flex justify-center items-center mt-8 mb-4 space-x-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-scroll-dark/20 to-scroll-dark/20" />
                <div className="w-1 h-1 bg-gold-accent rounded-full" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-scroll-dark/20 to-scroll-dark/20" />
              </div>
            </div>

            {/* 身份卡片网格 */}
            <div
              id="identities"
              className="relative mt-6 sm:mt-8"
              style={{
                animation: mounted ? 'fade-slide-up 0.8s ease-out 0.5s both' : 'none',
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-4">
                {identities.map((identity, idx) => (
                  <IdentityCard
                    key={identity.id}
                    name={identity.name}
                    description={identity.description}
                    icon={identity.icon}
                    color={identity.color}
                    isSelected={selectedId === identity.id}
                    isDisabled={isLoading && selectedId !== identity.id}
                    onSelect={() => handleSelectIdentity(identity.id)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ---- 下卷轴杆 ---- */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
            <div className="scroll-rod" />
          </div>
        </div>

        {/* ===== 页脚 ===== */}
        <footer
          className="relative bg-rice-paper/90 backdrop-blur-sm border-t border-scroll-dark border-opacity-10"
          style={{
            animation: mounted ? 'fade-slide-up 0.6s ease-out 0.9s both' : 'none',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-scroll-dark opacity-60 font-chinese mb-4">
                梦华一日 © 2024 | 选择你的身份，开启属于你的东京故事
              </p>
              <div className="flex justify-center gap-6 text-xs sm:text-sm flex-wrap">
                <a
                  href="/"
                  className="text-scroll-dark opacity-60 hover:opacity-100 hover:text-gold-accent transition-colors"
                >
                  首页
                </a>
                <span className="text-scroll-dark opacity-30">|</span>
                <a
                  href="#"
                  className="text-scroll-dark opacity-60 hover:opacity-100 hover:text-gold-accent transition-colors"
                >
                  关于
                </a>
                <span className="text-scroll-dark opacity-30">|</span>
                <a
                  href="#"
                  className="text-scroll-dark opacity-60 hover:opacity-100 hover:text-gold-accent transition-colors"
                >
                  联系
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
