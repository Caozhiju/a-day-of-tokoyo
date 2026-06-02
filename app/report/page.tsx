'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { studentActivities } from '@/data/activities';
import { matchGenesFromActivities } from '@/data/culture-genes';
import { computeHeritageIndex } from '@/data/heritage-index';
import CultureGeneCard from '@/components/CultureGeneCard';
import HeritageIndex from '@/components/HeritageIndex';
import CivilizationSummary from '@/components/CivilizationSummary';
import LivingGuide from '@/components/LivingGuide';
import { computeRecommendation } from '@/data/recommendation';

/* ─────────── 数据构建 ─────────── */
function buildReportData(role: string) {
  const activities = studentActivities;
  const locationSet = new Set<string>();
  activities.forEach((a) => {
    const locs = extractLocations(a.description);
    locs.forEach((l) => locationSet.add(l));
  });
  const readingActivities = activities.filter(
    (a) => a.title.includes('读') || a.title.includes('书') || a.title.includes('批') || a.title.includes('卷'),
  );
  const start = activities[0]?.time ?? '卯时';
  const end = activities[activities.length - 1]?.time ?? '亥时';
  return {
    role,
    duration: `${start} 至 ${end}`,
    durationDesc: `跨越 ${activities.length} 个时辰 · 约 ${activities.length * 2} 小时`,
    locations: Array.from(locationSet).slice(0, 6),
    totalActivities: activities.length,
    readingCount: readingActivities.length,
    readingTitles: readingActivities.map((a) => a.title),
    allTitles: activities.map((a) => a.title),
  };
}

function extractLocations(desc: string): string[] {
  const keywords = ['州桥', '潘楼街', '朱雀门', '汴河', '瓦舍', '勾栏', '马行街', '东角楼', '茶坊', '酒楼'];
  return keywords.filter((k) => desc.includes(k));
}

const SHICHEN_ICON: Record<string, string> = {
  卯: '🌅', 辰: '☀️', 巳: '🌞', 午: '🍜',
  未: '⛅', 申: '🌆', 酉: '🌇', 戌: '🌙', 亥: '🌃',
  default: '⏳',
};

/* ─────────── 装饰 SVG 组件 ─────────── */
function TokyoSilhouette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <path d="M0 180 L40 120 L55 130 L70 90 L85 95 L100 60 L115 65 L130 30 L145 35 L160 50 L175 55 L190 40 L210 70 L225 75 L240 100 L260 110 L280 130 L300 120 L300 200 L0 200 Z" fill="currentColor" opacity="0.08" />
      <rect x="55" y="130" width="10" height="50" fill="currentColor" opacity="0.05" />
      <rect x="130" y="35" width="8" height="45" fill="currentColor" opacity="0.05" />
      <rect x="210" y="70" width="8" height="50" fill="currentColor" opacity="0.05" />
      <circle cx="100" cy="60" r="3" fill="currentColor" opacity="0.06" />
      <circle cx="175" cy="55" r="3" fill="currentColor" opacity="0.06" />
    </svg>
  );
}

function SundialSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <circle cx="50" cy="45" r="35" stroke="currentColor" strokeWidth="1" opacity="0.06" fill="none" />
      <circle cx="50" cy="45" r="25" stroke="currentColor" strokeWidth="0.5" opacity="0.04" fill="none" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
        <line key={a} x1="50" y1="45" x2={50 + 30 * Math.cos((a * Math.PI) / 180)} y2={45 + 30 * Math.sin((a * Math.PI) / 180)} stroke="currentColor" strokeWidth="0.5" opacity="0.04" />
      ))}
      <line x1="50" y1="45" x2="62" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      <path d="M45 95 L50 80 L55 95 Z" fill="currentColor" opacity="0.06" />
    </svg>
  );
}

/* ═══════════════════════════════════════ */
export default function ReportPage() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const roleParam = searchParams.get('role');
    if (roleParam) setRole(decodeURIComponent(roleParam));
  }, [searchParams]);

  if (!mounted || !role) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center bg-rice-paper">
        <div className="text-4xl font-chinese font-bold text-scroll-dark animate-pulse">加载中...</div>
      </main>
    );
  }

  const data = buildReportData(role);
  const geneResults = matchGenesFromActivities(studentActivities);
  const heritageReport = computeHeritageIndex(studentActivities);
  const livingRecommendation = computeRecommendation(studentActivities);
  const hasData = data.totalActivities > 0;

  const mainContent = (
    <div className="max-w-6xl mx-auto space-y-10 sm:space-y-16">
      {/* ═══════════════════════════════════════
          行1：身份 + 核心指标 (40/60 双栏)
      ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* —— 身份卡片 40% —— */}
        <div
          className="lg:col-span-2 card-premium p-6 sm:p-8 relative overflow-hidden"
          style={{ animation: mounted ? 'stat-appear 0.6s ease-out 0.3s both' : 'none' }}
        >
          {/* 背景装饰：淡墨东京城剪影 */}
          <TokyoSilhouette className="absolute inset-0 w-full h-full text-scroll-dark pointer-events-none select-none" />

          <div className="relative z-10">
            <p className="text-lg sm:text-xl font-chinese font-bold text-secondary tracking-wider mb-2">
              体验身份
            </p>
            <h1 className="title-hero mb-2">
              {data.role}
            </h1>
            <p className="text-body mt-2">
              北宋东京城 · 一日体验
            </p>
            <div className="h-px bg-gradient-to-r from-border-warm to-transparent my-5" />

            {/* 时辰迷你轴 */}
            <div className="flex items-center gap-1.5">
              {data.allTitles.map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-1 rounded-full transition-all duration-500 ${
                      i < data.totalActivities
                        ? 'bg-gold-accent'
                        : 'bg-scroll-dark/10'
                    }`}
                  />
                  <span className="text-[10px] font-chinese font-bold text-scroll-dark/40">
                    {['卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i] ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-accent/30" />
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-accent/30" />
        </div>

        {/* —— 核心指标区 60% —— */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* 时长 */}
          <div
            className="card-premium p-6 sm:p-7 relative overflow-hidden"
            style={{ animation: mounted ? 'stat-appear 0.6s ease-out 0.4s both' : 'none' }}
          >
            <SundialSVG className="absolute right-2 bottom-0 w-24 h-28 text-scroll-dark pointer-events-none select-none" />
            <div className="relative z-10">
              <p className="title-section mb-2">体验时长</p>
              <div className="stat-number">{data.totalActivities * 2}</div>
              <p className="text-caption mt-2">时辰 · {data.duration}</p>
            </div>
            <span className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20" />
          </div>

          {/* 地点 */}
          <div
            className="card-premium p-6 sm:p-7 relative overflow-hidden"
            style={{ animation: mounted ? 'stat-appear 0.6s ease-out 0.5s both' : 'none' }}
          >
            {/* 装饰：鸟瞰地标点 */}
            <div className="absolute right-2 top-4 text-scroll-dark/10 pointer-events-none select-none text-xs leading-tight text-right">
              <div>州桥</div>
              <div>汴河</div>
              <div>潘楼街</div>
              <div>瓦舍</div>
              <div>勾栏</div>
            </div>
            <div className="relative z-10">
              <p className="title-section mb-2">经过地点</p>
              <div className="stat-number">{data.locations.length}</div>
              <p className="text-caption mt-2">
                {data.locations.length > 0 ? data.locations.slice(0, 4).join(' · ') : '无记录'}
              </p>
            </div>
            <span className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20" />
          </div>

          {/* 活动 + 阅读 */}
          <div
            className="card-premium p-6 sm:p-7 relative overflow-hidden"
            style={{ animation: mounted ? 'stat-appear 0.6s ease-out 0.6s both' : 'none' }}
          >
            {/* 水墨装饰 */}
            <div className="absolute right-3 bottom-2 text-scroll-dark/8 pointer-events-none select-none text-2xl leading-none">
              📜 🍵 🎵
            </div>
            <div className="relative z-10">
              <p className="title-section mb-2">参与活动</p>
              <div className="stat-number mb-3">{data.totalActivities}</div>
              <div className="h-px bg-gradient-to-r from-border-warm to-transparent my-2" />
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-body">阅读典籍</span>
                <span className="text-4xl sm:text-5xl font-black text-scroll-dark leading-none">
                  {data.readingCount}
                  <span className="text-lg font-chinese font-bold text-secondary ml-1">次</span>
                </span>
              </div>
            </div>
            <span className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          行2：完整活动一览
      ════════════════════════════════════════ */}
      <div
        className="card-premium overflow-hidden"
        style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.7s both' : 'none' }}
      >
        <div className="px-6 sm:px-8 py-5 border-b border-border-warm flex items-center gap-3">
          <span className="w-2 h-2 bg-gold-accent rounded-full" />
          <span className="title-section text-xl sm:text-2xl tracking-wider">完整活动一览</span>
          <span className="text-caption ml-auto">{data.totalActivities} 项</span>
        </div>

        <div className="divide-y divide-border-warm/50">
          {studentActivities.map((act, i) => {
            const icon = SHICHEN_ICON[act.time.charAt(0)] ?? SHICHEN_ICON.default;
            return (
              <div
                key={i}
                className="flex items-start gap-4 sm:gap-6 px-6 sm:px-8 py-4 sm:py-5 hover:bg-white/40 transition-colors duration-200"
              >
                <div className="flex flex-col items-center gap-1 min-w-[48px] sm:min-w-[56px]">
                  <span className="text-xl sm:text-2xl">{icon}</span>
                  <span className="text-xs font-chinese font-bold text-secondary tracking-wider">
                    {act.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-chinese font-bold text-scroll-dark">
                    {act.title}
                  </h4>
                  <p className="text-sm sm:text-base font-chinese text-ink-light/80 leading-relaxed mt-1 line-clamp-1">
                    {act.description.slice(0, 60)}……
                  </p>
                </div>
                <span className="text-xs font-chinese font-bold text-gold-accent self-center flex-shrink-0 border border-gold-accent/20 px-2 py-1 rounded-sm">
                  录
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          行3：东京足迹
      ════════════════════════════════════════ */}
      {data.locations.length > 0 && (
        <div
          className="card-premium overflow-hidden"
          style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.9s both' : 'none' }}
        >
          <div className="px-6 sm:px-8 py-5 border-b border-border-warm flex items-center gap-3">
            <span className="w-2 h-2 bg-gold-accent rounded-full" />
            <span className="title-section text-xl sm:text-2xl tracking-wider">东京足迹</span>
            <span className="text-caption ml-auto">{data.locations.length} 处</span>
          </div>

          <div className="px-6 sm:px-8 py-5 sm:py-6">
            <div className="flex flex-wrap gap-3">
              {data.locations.map((loc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 border border-border-warm rounded-sm text-sm font-chinese font-medium text-scroll-dark hover:bg-gold-accent/10 hover:border-gold-accent/30 transition-all duration-200"
                >
                  <span className="text-base">📍</span>
                  {loc}
                </span>
              ))}
            </div>

            <div className="flex items-center flex-wrap gap-1.5 mt-5 pt-4 border-t border-border-warm/50">
              <span className="text-sm font-chinese font-bold text-secondary tracking-wider mr-2">行程：</span>
              {data.locations.map((loc, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-sm font-chinese text-scroll-dark/80">{loc}</span>
                  {i < data.locations.length - 1 && (
                    <span className="text-sm text-gold-accent/40">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          行4：如果你生活在东京城
      ════════════════════════════════════════ */}
      <div style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 1.1s both' : 'none' }}>
        <LivingGuide recommendation={livingRecommendation} mounted={mounted} />
      </div>

      {/* ═══════════════════════════════════════
          行5：文明传承指数
      ════════════════════════════════════════ */}
      <div style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 1.3s both' : 'none' }}>
        <HeritageIndex report={heritageReport} mounted={mounted} />
      </div>

      {/* ═══════════════════════════════════════
          行6：宋代基因分析
      ════════════════════════════════════════ */}
      {geneResults.length > 0 && (
        <div style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 1.5s both' : 'none' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-warm to-transparent" />
            <div className="flex items-center gap-3 px-2">
              <span className="w-2.5 h-2.5 bg-gold-accent rounded-full" />
              <span className="title-section">宋代基因分析</span>
              <span className="text-base sm:text-lg font-chinese text-ink-light/40 tracking-wider">· 文明传承图谱</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-warm to-transparent" />
          </div>

          <div className="text-center mb-7">
            <p className="text-body italic max-w-2xl mx-auto">
              你今日所体验的每一个日常，都埋藏着一条穿越千年的文化基因。
              它们从宋代遗传至今，在当代生活中以新的形态继续生长。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {geneResults.map((result, i) => (
              <CultureGeneCard
                key={result.gene.id}
                gene={result.gene}
                matchedActivities={result.matchedActivities}
                matchScore={result.score}
                delay={i * 0.08}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-accent/20 to-transparent" />
            <span className="text-xs font-chinese text-ink-light/30 tracking-widest select-none">基·因·图·谱</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-accent/20 to-transparent" />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          行7：文明传承总结
      ════════════════════════════════════════ */}
      <div style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 1.7s both' : 'none' }}>
        <CivilizationSummary activities={studentActivities} mounted={mounted} />
      </div>
    </div>
  );

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-rice-paper">
      {/* 背景 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 ancient-texture opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-b from-gold-accent/4 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-amber-200/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full">
        {/* 导航 */}
        <nav className="sticky top-0 z-20 bg-rice-paper/95 backdrop-blur-md border-b border-border-warm/60">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex justify-between items-center h-18 sm:h-20">
              <Link href="/experience" className="text-base sm:text-lg font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors">
                ← 返回体验
              </Link>
              <Link href="/" className="text-base sm:text-lg font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors">
                梦华一日
              </Link>
            </div>
          </div>
        </nav>

        {/* 标题区 */}
        <div
          className="relative pt-10 sm:pt-16 pb-6 sm:pb-10"
          style={{ animation: mounted ? 'scroll-unfold 1s cubic-bezier(0.77, 0, 0.18, 1) 0.1s both' : 'none' }}
        >
          <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <div className="scroll-rod" />
          </div>
          <div className="relative bg-rice-paper/60 mx-auto max-w-6xl px-6 sm:px-8 py-10 sm:py-14">
            <div className="flex justify-center items-center mb-6 space-x-4">
              <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
              <div className="w-2 h-2 bg-gold-accent rounded-full" />
              <div className="flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent via-border-warm to-transparent" />
            </div>
            <div className="text-center">
              <p
                className="text-lg sm:text-xl font-chinese font-bold text-secondary tracking-[0.3em] mb-4"
                style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.3s both' : 'none' }}
              >
                梦华录 · 行记
              </p>
              <h1
                className="title-hero text-center ink-brush"
                style={{ animation: mounted ? 'ink-spread 1s ease-out 0.4s both' : 'none' }}
              >
                {role}的一日
              </h1>
              <div className="flex justify-center gap-3 mt-5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="w-2 h-2 bg-gold-accent rounded-full" />
                ))}
              </div>
              <p
                className="text-body tracking-wider"
                style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.5s both' : 'none' }}
              >
                东京一日 · 尽录于此
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <div className="scroll-rod" />
          </div>
        </div>

        {/* 主体内容 */}
        {hasData ? (
          <div className="relative px-6 sm:px-8 lg:px-10 pb-20 -mt-4">
            {mainContent}
          </div>
        ) : (
          <div className="relative px-6 py-24 text-center">
            <p className="text-2xl font-chinese font-bold text-scroll-dark">暂无行程记录</p>
            <Link href="/experience" className="title-section mt-6 inline-block hover:text-scroll-dark transition-colors">
              ← 去体验
            </Link>
          </div>
        )}

        {/* 底部 */}
        <div className="relative px-6 sm:px-8 lg:px-10 py-14 sm:py-20">
          <div className="flex justify-center items-center mb-6 space-x-4">
            <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
            <div className="w-2 h-2 bg-gold-accent rounded-full" />
            <div className="flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent via-border-warm to-transparent" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-5">
            <button
              onClick={() => {
                const text = `我在「梦华一日」中体验了「${role}」的一天，${data.duration}，途经${data.locations.length}处胜迹，参与${data.totalActivities}项活动，阅读典籍${data.readingCount}次。`;
                navigator.clipboard?.writeText(text).catch(() => {});
                alert('行记文案已复制到剪贴板，可分享给好友。');
              }}
              className="group relative px-10 sm:px-14 py-4 sm:py-5 bg-scroll-dark text-rice-paper font-chinese font-bold text-base sm:text-lg rounded-none overflow-hidden transition-all duration-300 hover:bg-gold-accent hover:text-scroll-dark shadow-lg hover:shadow-2xl inline-flex items-center gap-3"
            >
              <span className="absolute inset-0 bg-gold-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="relative flex items-center gap-2">
                <span>分享行记</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </span>
            </button>

            <div className="flex justify-center gap-6 text-base sm:text-lg">
              <Link href={`/experience?role=${encodeURIComponent(role)}`} className="font-chinese font-bold text-secondary hover:text-scroll-dark transition-colors">
                ← 重新体验
              </Link>
              <span className="text-border-warm">|</span>
              <Link href="/identity" className="font-chinese font-bold text-secondary hover:text-scroll-dark transition-colors">
                选择其他身份
              </Link>
            </div>
          </div>

          <div className="flex justify-center items-center mt-6 space-x-4">
            <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
            <div className="w-2 h-2 bg-gold-accent rounded-full" />
            <div className="flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent via-border-warm to-transparent" />
          </div>
        </div>

        <footer className="relative bg-rice-paper/90 border-t border-border-warm/60">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
            <div className="text-center">
              <p className="text-base font-chinese text-ink-light">
                梦华一日 © 2024 · 此报告由 AI 根据《东京梦华录》生成
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
