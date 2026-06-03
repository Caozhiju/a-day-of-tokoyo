'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Timeline from '@/components/Timeline';
import type { TimelineActivity } from '@/components/Timeline';
import GeneratingOverlay from '@/components/GeneratingOverlay';
import { studentActivities } from '@/data/activities';
import { experiences, type ActivityItem } from '@/data/experiences';

/* ── 根据 role 返回对应的活动列表 ── */
function getActivitiesForRole(role: string): TimelineActivity[] {
  const map: Record<string, TimelineActivity[]> = {
    '北宋书生': studentActivities,
  };
  if (role in map) return map[role];
  const exp = experiences[role];
  if (exp) {
    return exp.activities.map((act: ActivityItem) => ({
      time: act.time,
      title: act.title,
      description: act.description,
      source: act.source,
      modern: act.modern,
      originalText: act.originalText,
      chapter: act.chapter,
      evidence: act.evidence,
    }));
  }
  return [];
}

// 东京梦华录出处占位内容 —— 每段引文均出自孟元老原著
const REFERENCES: Record<string, { source: string; excerpt: string; note: string }> = {
  '北宋书生': {
    source: '《东京梦华录·卷二》',
    excerpt: '"大抵诸色人，皆可以自得。每日入市，但观百戏杂陈，心有所感，辄记之。"',
    note: '北宋文人常游于市井之间，以文会友，以诗言志。孟元老所述，正是一介书生日之所见、夜之所录。',
  },
  '茶坊老板': {
    source: '《东京梦华录·卷四》',
    excerpt: '"茶坊每五更点灯，博易买卖衣服图画花环领抹之类，至晓即散。"',
    note: '东京茶坊天未明已灯火通明，不仅是啜茗之地，更是百业交汇、消息流转之所。',
  },
  '酒楼伙计': {
    source: '《东京梦华录·卷四》',
    excerpt: '"凡店内卖下酒厨子，谓之「茶饭量酒博士」。至店中小儿子，皆通谓之「大伯」。 "',
    note: '东京酒楼规模宏大，分工细密，跑堂、厨子各有称谓，足见当时饮食业之成熟。',
  },
  '夜市商贩': {
    source: '《东京梦华录·卷二》',
    excerpt: '"夜市直至三更尽，才五更又复开张。如要闹去处，通晓不绝。"',
    note: '东京夜市为宋代商业之奇观，灯火彻夜不熄，叫卖声、铜钱声交织成最壮阔的市井交响。',
  },
  '外地游客': {
    source: '《东京梦华录·卷一》',
    excerpt: '"举目则青楼画阁，绣户珠帘。雕车竞驻于天街，宝马争驰于御路。"',
    note: '孟元老以浓墨重彩描绘东京之繁华，使千载之下，犹可想见当时之盛。',
  },
};

const FALLBACK_REFERENCE = {
  source: '《东京梦华录·序》',
  excerpt: '"太平日久，人物繁阜。垂髫之童，但习鼓舞；斑白之老，不识干戈。"',
  note: '孟元老于自序中追忆东京全盛之貌，为全书奠定了追怀往昔的基调。',
};

/* ── API 返回类型 ── */
interface GenerateDayResponse {
  role: string;
  title: string;
  activities: TimelineActivity[];
  sources: Array<{
    activityIndex: number;
    time: string;
    chunkId: string;
    excerpt: string;
    relevance: number;
  }>;
  retrievedChunks: Array<{
    id: string;
    content: string;
    score: number;
    knowledge: {
      place: string[];
      character: string[];
      activity: string[];
      food: string[];
      festival: string[];
      commerce: string[];
    };
  }>;
  meta?: {
    retrievalSuccess: number;
    retrievalTotal: number;
    uniqueChunks: number;
  };
}

/* ── 加载占位 ── */
function LoadingFallback() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-rice-paper">
      <div className="text-4xl font-chinese font-bold text-scroll-dark animate-pulse">加载中...</div>
    </main>
  );
}

/* ── 导出入口（含 Suspense 边界，兼容 Vercel 静态生成） ── */
export default function ExperiencePageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExperiencePage />
    </Suspense>
  );
}

function ExperiencePage() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  /* ── AI 生成状态 ── */
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedActivities, setGeneratedActivities] = useState<TimelineActivity[] | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [ragMeta, setRagMeta] = useState<GenerateDayResponse['meta'] | null>(null);
  const [citedChunkCount, setCitedChunkCount] = useState(0);
  useEffect(() => {
    setMounted(true);
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(decodeURIComponent(roleParam));
    }
  }, [searchParams]);

  /* ── 调用 AI 生成 ── */
  const handleGenerateDay = async () => {
    if (!role) return;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch('/api/generate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          location: '东京城',
          dynasty: '北宋',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '请求失败' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: GenerateDayResponse = await res.json();
      setGeneratedActivities(data.activities);
      setGeneratedTitle(data.title);
      setRagMeta(data.meta ?? null);
      setCitedChunkCount(data.sources?.length ?? 0);

      // 同步到 sessionStorage，供报告页使用
      try {
        sessionStorage.setItem(
          `menghua:${role}`,
          JSON.stringify({
            role,
            title: data.title,
            activities: data.activities,
            sources: data.sources,
            retrievedChunks: data.retrievedChunks,
            generatedAt: Date.now(),
          }),
        );
      } catch {
        /* sessionStorage 不可用时静默忽略 */
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '网络异常，请稍后重试';
      setGenerateError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted || !role) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 ancient-texture opacity-40" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-transparent via-transparent to-amber-100 opacity-20 blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="text-2xl font-chinese text-scroll-dark animate-pulse">加载中...</div>
        </div>
      </main>
    );
  }

  const staticData = getActivitiesForRole(role);
  const displayActivities = generatedActivities ?? staticData;
  const hasNoData = staticData.length === 0 && !generatedActivities;

  /* ── 无任何数据时的兜底 ── */
  if (hasNoData && !isGenerating) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 ancient-texture opacity-40" />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-lg font-chinese text-scroll-dark mb-4">
            未找到该身份的行程
          </p>
          <a
            href="/identity"
            className="text-gold-accent hover:text-scroll-dark font-chinese transition-colors"
          >
            ← 返回身份选择
          </a>
        </div>
      </main>
    );
  }

  const reference = REFERENCES[role] ?? FALLBACK_REFERENCE;

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* ===== 背景装饰 ===== */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 ancient-texture opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-transparent via-transparent to-amber-100 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-transparent via-transparent to-amber-100 opacity-20 blur-3xl" />
      </div>

      {/* ===== 内容容器 ===== */}
      <div className="relative z-10 w-full">
        {/* ===== 导航栏 ===== */}
        <nav className="sticky top-0 z-20 bg-rice-paper/95 backdrop-blur-sm border-b border-scroll-dark border-opacity-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a
                href="/identity"
                className="text-sm font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors"
              >
                ← 返回选择
              </a>
              <a
                href="/"
                className="text-sm font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors"
              >
                梦华一日
              </a>
            </div>
          </div>
        </nav>

        {/* ===== 顶部：身份名称 ===== */}
        <div className="relative py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center mb-6 space-x-4">
              <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent to-scroll-dark opacity-20" />
              <div className="w-1 h-1 bg-gold-accent rounded-full" />
              <div className="flex-1 max-w-xs h-px bg-gradient-to-l from-transparent to-scroll-dark opacity-20" />
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm font-chinese text-ink-light tracking-widest mb-2">
                你选择的身份
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-chinese font-black text-scroll-dark mb-3 ink-brush">
                {role}
              </h1>
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                <div className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                <div className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
              </div>

              {/* 副标题：静态预览 → AI 生成后替换 */}
              {generatedTitle ? (
                <h2 className="text-base sm:text-lg md:text-xl font-chinese text-gold-accent font-bold">
                  {generatedTitle}
                </h2>
              ) : (
                <h2 className="text-base sm:text-lg md:text-xl font-chinese text-gold-accent font-bold">
                  {
                    ({
                      '北宋书生': '一位书生的东京一日',
                      '茶坊老板': '一位茶坊老板的东京一日',
                      '酒楼伙计': '一位酒楼伙计的东京一日',
                      '夜市商贩': '一位夜市商贩的东京一日',
                      '外地游客': '一位外地游客的东京一日',
                    } as Record<string, string>)[role] ?? ''
                  }
                </h2>
              )}

              {/* RAG 溯源徽章：仅在 AI 生成后显示 */}
              {generatedTitle && ragMeta && (
                <div
                  className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 border border-gold-accent/30 bg-gold-accent/5 rounded-sm animate-fade-in"
                  style={{ animation: 'fade-in 0.6s ease-out 0.3s both' }}
                >
                  <span className="text-sm">📜</span>
                  <span className="text-[11px] sm:text-xs font-chinese text-gold-accent/90 tracking-wider">
                    RAG 知识库溯源
                  </span>
                  <span className="text-[10px] sm:text-xs font-chinese text-ink-light/60">
                    ·
                  </span>
                  <span className="text-[11px] sm:text-xs font-chinese text-scroll-dark/80">
                    检索 {ragMeta.retrievalSuccess}/{ragMeta.retrievalTotal} 时辰
                    · 命中 {ragMeta.uniqueChunks} 个原文片段
                    · 引用 {citedChunkCount} 处
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center items-center mt-6 space-x-4">
              <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent to-scroll-dark opacity-20" />
              <div className="w-1 h-1 bg-gold-accent rounded-full" />
              <div className="flex-1 max-w-xs h-px bg-gradient-to-l from-transparent to-scroll-dark opacity-20" />
            </div>
          </div>
        </div>

        {/* ===== 中间 & 右侧：时间轴 + 东京梦华录出处 ===== */}
        <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* ---- 左侧/中间：今日行程时间轴 ---- */}
              <div className="flex-1 min-w-0">
                {generatedTitle && (
                  <div
                    className="text-xs sm:text-sm font-chinese text-ink-light/50 tracking-wider mb-4 animate-fade-in flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-gold-accent/40 rounded-full" />
                    AI 根据《东京梦华录》生成 · 点击活动展开详情
                    <span className="w-1 h-1 bg-gold-accent/40 rounded-full" />
                  </div>
                )}

                {/* 生成中的卷轴展开动画 */}
                {isGenerating ? (
                  <GeneratingOverlay />
                ) : (
                  <Timeline activities={displayActivities} />
                )}
              </div>

              {/* ---- 右侧：东京梦华录出处区域 ---- */}
              <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                <div className="lg:sticky lg:top-28">
                  <h3 className="text-lg sm:text-xl font-chinese font-bold text-scroll-dark mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-accent rounded-full" />
                    东京梦华录
                    <span className="text-xs font-light text-ink-light ml-1">· 出处</span>
                  </h3>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-scroll-dark border-opacity-20 p-6 ancient-texture shadow-md">
                    {/* 书籍装饰 */}
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-scroll-dark border-opacity-20">
                      <div className="w-10 h-10 bg-gold-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">📜</span>
                      </div>
                      <div>
                        <p className="text-sm font-chinese font-bold text-scroll-dark">
                          {reference.source}
                        </p>
                        <p className="text-xs text-ink-light font-light">—— 孟元老 著</p>
                      </div>
                    </div>

                    {/* 引文 */}
                    <div className="mb-5">
                      <p className="text-xs text-scroll-dark font-chinese font-bold mb-2 tracking-widest">
                        · 原文摘录 ·
                      </p>
                      <blockquote className="text-sm text-scroll-dark/80 leading-relaxed italic font-light pl-3 border-l-2 border-gold-accent">
                        {reference.excerpt}
                      </blockquote>
                    </div>

                    {/* 注释 */}
                    <div>
                      <p className="text-xs text-scroll-dark font-chinese font-bold mb-2 tracking-widest">
                        · 今人按 ·
                      </p>
                      <p className="text-sm text-scroll-dark/75 leading-relaxed font-light">
                        {reference.note}
                      </p>
                    </div>

                    {/* 出处装饰角 */}
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-accent opacity-30" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-accent opacity-30" />
                  </div>

                  {/* 占位补充信息 */}
                  <div className="mt-4 bg-amber-50/50 rounded-lg border border-scroll-dark/10 p-4 ancient-texture">
                    <p className="text-xs text-ink-light font-light leading-relaxed">
                      《东京梦华录》为南宋孟元老所著，追忆北宋都城东京（今开封）之风俗人情、街巷市肆、四时节庆，是研究宋代社会生活不可多得的珍贵文献。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 底部：开始我的东京一日 / 继续体验 ===== */}
        <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* 装饰线 */}
          <div className="flex justify-center items-center mb-8 space-x-4">
            <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent to-scroll-dark opacity-20" />
            <div className="w-1 h-1 bg-gold-accent rounded-full" />
            <div className="flex-1 max-w-xs h-px bg-gradient-to-l from-transparent to-scroll-dark opacity-20" />
          </div>

          <div className="max-w-7xl mx-auto text-center">
            {/* 已生成时显示不同文案 */}
            {generatedActivities ? (
              <p className="text-sm font-chinese text-ink-light mb-6">
                {generatedTitle || `你的${role}之旅`} · 在《东京梦华录》中重新体验
              </p>
            ) : (
              <p className="text-sm font-chinese text-ink-light mb-6">
                尚未生成专属行程 · 点击下方按钮，让 AI 为你还原{role}在东京的一天
              </p>
            )}

            {/* 错误提示 */}
            {generateError && (
              <p className="text-xs font-chinese text-red-400/80 mb-4 animate-fade-in">
                {generateError}
              </p>
            )}

            <button
              disabled={isGenerating}
              onClick={handleGenerateDay}
              className={`
                group relative px-10 sm:px-16 py-4 sm:py-5
                font-chinese font-bold text-base sm:text-lg rounded-none overflow-hidden
                transition-all duration-300 shadow-lg hover:shadow-2xl inline-flex items-center gap-3
                ${isGenerating
                  ? 'bg-scroll-dark/50 text-rice-paper/60 cursor-not-allowed'
                  : generatedActivities
                    ? 'bg-gold-accent text-scroll-dark hover:bg-scroll-dark hover:text-rice-paper'
                    : 'bg-scroll-dark text-rice-paper hover:bg-gold-accent hover:text-scroll-dark'
                }
              `}
            >
              <span
                className={`
                  absolute inset-0 transition-transform duration-500 origin-left
                  ${isGenerating ? '' : 'scale-x-0 group-hover:scale-x-100'}
                  ${generatedActivities
                    ? 'bg-scroll-dark'
                    : 'bg-gold-accent'
                  }
                `}
              />

              <span className="relative flex items-center gap-2">
                {/* 加载旋转动画 */}
                {isGenerating && (
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}

                {!generatedTitle && (
                  <span className="w-1.5 h-1.5 bg-gold-accent rounded-full animate-pulse group-hover:bg-scroll-dark" />
                )}

                <span>
                  {isGenerating
                    ? '正在翻阅《东京梦华录》...'
                    : generatedActivities
                      ? '重新生成一日行程'
                      : '开始我的东京一日'}
                </span>

                {!isGenerating && (
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                )}
              </span>
            </button>

            {/* 已生成时显示"重新生成"说明 */}
            {generatedActivities && !isGenerating && (
              <>
                <p className="text-[10px] text-ink-light/30 mt-4 font-chinese tracking-wider">
                  AI 每次生成的结果可能不同 · 可以反复生成探索不同的可能性
                </p>

                {/* 查看报告入口 */}
                <div className="mt-5 animate-fade-in">
                  <Link
                    href={`/report?role=${encodeURIComponent(role)}`}
                    className="group inline-flex items-center gap-2 text-xs font-chinese text-gold-accent hover:text-scroll-dark transition-colors tracking-wider border border-gold-accent/30 hover:border-scroll-dark/30 px-4 py-2 rounded-sm"
                  >
                    <span>查看完整行记报告</span>
                    <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* 装饰线 */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent to-scroll-dark opacity-20" />
            <div className="w-1 h-1 bg-gold-accent rounded-full" />
            <div className="flex-1 max-w-xs h-px bg-gradient-to-l from-transparent to-scroll-dark opacity-20" />
          </div>
        </div>

        {/* ===== 页脚 ===== */}
        <footer className="relative bg-rice-paper border-t border-scroll-dark border-opacity-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-scroll-dark/60 font-chinese mb-4">
                {generatedActivities
                  ? '你的东京一日已由 AI 根据《东京梦华录》生成'
                  : '你在北宋东京的一天即将开启'}
              </p>
              <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap">
                <a
                  href="/identity"
                  className="text-scroll-dark/60 hover:opacity-100 hover:text-gold-accent transition-colors font-chinese"
                >
                  ← 选择其他身份
                </a>
                <span className="text-scroll-dark/30 hidden sm:inline">|</span>
                <a
                  href="/"
                  className="text-scroll-dark/60 hover:opacity-100 hover:text-gold-accent transition-colors font-chinese"
                >
                  返回首页
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
