'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 z-0">
        {/* 古籍纹理背景 */}
        <div className="absolute inset-0 ancient-texture opacity-40" />
        
        {/* 水墨晕染效果 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-transparent via-transparent to-amber-100 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-transparent via-transparent to-amber-100 opacity-20 blur-3xl" />
      </div>

      {/* 内容容器 */}
      <div className="relative z-10 w-full">
        {/* 导航栏 */}
        <nav className="sticky top-0 z-20 bg-rice-paper bg-opacity-95 backdrop-blur-sm border-b border-scroll-dark border-opacity-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center group cursor-pointer">
                <div className="text-sm font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors duration-300">
                  梦华一日
                </div>
              </div>

              {/* 导航链接 */}
              <div className="hidden md:flex space-x-8 items-center">
                <Link href="/identity" className="text-sm text-scroll-dark hover:text-gold-accent transition-colors font-chinese">
                  体验
                </Link>
                <Link href="/map" className="text-sm text-scroll-dark hover:text-gold-accent transition-colors font-chinese">
                  地图
                </Link>
                <a href="#about" className="text-sm text-scroll-dark hover:text-gold-accent transition-colors font-chinese">
                  关于
                </a>
                <a href="#culture" className="text-sm text-scroll-dark hover:text-gold-accent transition-colors font-chinese">
                  文化
                </a>
              </div>

              {/* 菜单图标 */}
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

        {/* 主内容区 - 卷轴效果 */}
        <div className="relative">
          {/* 上卷轴装饰 */}
          <div className="h-12 bg-gradient-to-b from-amber-200 to-rice-paper relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-3">
                <div className="w-1 h-1 bg-scroll-dark opacity-30 rounded-full" />
                <div className="w-1 h-1 bg-scroll-dark opacity-30 rounded-full" />
                <div className="w-1 h-1 bg-scroll-dark opacity-30 rounded-full" />
              </div>
            </div>
            {/* 卷轴轮廓 */}
            <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-scroll-dark to-transparent opacity-20" />
          </div>

          {/* 主要内容 */}
          <div className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <div className="max-w-4xl mx-auto">
              {/* 装饰线 - 上 */}
              <div className="flex justify-center items-center mb-8 space-x-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-scroll-dark opacity-20" />
                <div className="w-1 h-1 bg-gold-accent rounded-full" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-scroll-dark opacity-20" />
              </div>

              {/* 副标题 */}
              <div className="text-center mb-6 sm:mb-12">
                <p className="text-xs sm:text-sm font-chinese text-ink-light tracking-widest uppercase mb-2">
                  穿越时空的梦幻旅程
                </p>
                <h2 className="text-sm sm:text-base font-chinese text-scroll-dark opacity-75">
                  在文化的蕴藉中寻找诗意
                </h2>
              </div>

              {/* 主标题 */}
              <div className="text-center mb-8 sm:mb-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-chinese font-black text-scroll-dark leading-tight mb-4 ink-brush">
                  梦华一日
                </h1>
                <div className="flex justify-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-gold-accent rounded-full" />
                  <div className="w-2 h-2 bg-gold-accent rounded-full" />
                  <div className="w-2 h-2 bg-gold-accent rounded-full" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-chinese text-ink-light font-light leading-relaxed max-w-3xl mx-auto">
                  在东京梦华录中过一天
                </h3>
              </div>

              {/* 描述文本 */}
              <div className="text-center mb-12 sm:mb-20">
                <p className="text-sm sm:text-base font-chinese text-scroll-dark opacity-70 leading-relaxed max-w-2xl mx-auto mb-4">
                  穿越北宋东京城，体验普通人的一天
                </p>
                <p className="text-xs sm:text-sm text-ink-light opacity-60 font-light max-w-2xl mx-auto">
                  漫步在古都的街道，感受传统文化的魅力，在历史的烟火中寻找心灵的安宁
                </p>
              </div>

              {/* 装饰线 - 中 */}
              <div className="flex justify-center items-center mb-12 space-x-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-scroll-dark opacity-20" />
                <div className="w-1 h-1 bg-gold-accent rounded-full" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-scroll-dark opacity-20" />
              </div>

              {/* 按钮组 */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                {/* 主按钮 - 开始体验 */}
                <Link href="/identity" className="group relative px-8 sm:px-12 py-3 sm:py-4 bg-scroll-dark text-rice-paper font-chinese font-bold text-sm sm:text-base rounded-none overflow-hidden transition-all duration-300 hover:bg-gold-accent hover:text-scroll-dark shadow-lg hover:shadow-2xl inline-block">
                  {/* 背景动画 */}
                  <span className="absolute inset-0 bg-gold-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ zIndex: -1 }} />
                  
                  <span className="relative flex items-center gap-2">
                    <span>开始体验</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>

                {/* 副按钮 - 了解更多 */}
                <Link href="#" className="group relative px-8 sm:px-12 py-3 sm:py-4 bg-transparent text-scroll-dark font-chinese font-bold text-sm sm:text-base border-2 border-scroll-dark rounded-none transition-all duration-300 hover:bg-scroll-dark hover:text-rice-paper inline-block">
                  <span className="relative">
                    了解更多
                  </span>
                </Link>
              </div>

              {/* 装饰线 - 下 */}
              <div className="flex justify-center items-center mt-12 sm:mt-20 space-x-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-scroll-dark opacity-20" />
                <div className="w-1 h-1 bg-gold-accent rounded-full" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-scroll-dark opacity-20" />
              </div>
            </div>
          </div>

          {/* 下卷轴装饰 */}
          <div className="h-12 bg-gradient-to-t from-amber-200 to-rice-paper relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-3">
                <div className="w-1 h-1 bg-scroll-dark opacity-30 rounded-full" />
                <div className="w-1 h-1 bg-scroll-dark opacity-30 rounded-full" />
                <div className="w-1 h-1 bg-scroll-dark opacity-30 rounded-full" />
              </div>
            </div>
            {/* 卷轴轮廓 */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-scroll-dark to-transparent opacity-20" />
          </div>
        </div>

        {/* 页脚 */}
        <footer className="relative bg-rice-paper border-t border-scroll-dark border-opacity-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-scroll-dark opacity-60 font-chinese mb-4">
                梦华一日 © 2024 | 在东京梦华录中过一天
              </p>
              <div className="flex justify-center gap-6 text-xs sm:text-sm">
                <a href="#" className="text-scroll-dark opacity-60 hover:opacity-100 hover:text-gold-accent transition-colors">
                  隐私政策
                </a>
                <span className="text-scroll-dark opacity-30">|</span>
                <a href="#" className="text-scroll-dark opacity-60 hover:opacity-100 hover:text-gold-accent transition-colors">
                  使用条款
                </a>
                <span className="text-scroll-dark opacity-30">|</span>
                <a href="#" className="text-scroll-dark opacity-60 hover:opacity-100 hover:text-gold-accent transition-colors">
                  联系我们
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
