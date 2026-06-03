'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LOCATIONS, CATEGORY_STYLE, type LocationData } from '@/data/locations';
import { getActivitiesByRole } from '@/data/activities';
import { generateRoute, buildRoutePath, type RoutePoint } from '@/data/route-generator';

/* ── 加载占位 ── */
function LoadingFallback() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-rice-paper">
      <div className="text-4xl font-chinese font-bold text-scroll-dark animate-pulse">加载中...</div>
    </main>
  );
}

/* ── 导出入口（Suspense 边界） ── */
export default function MapPageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MapPage />
    </Suspense>
  );
}

function MapPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<LocationData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [role, setRole] = useState('北宋书生');
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routePath, setRoutePath] = useState('');
  const [drawDone, setDrawDone] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    setMounted(true);
    const roleParam = searchParams.get('role');
    if (roleParam) setRole(decodeURIComponent(roleParam));
  }, [searchParams]);

  // 生成本日路线：RAG 数据优先，无则用对应身份静态活动
  useEffect(() => {
    if (!mounted) return;

    let activities: { time: string; title: string; description: string }[];
    try {
      const raw = sessionStorage.getItem(`menghua:${role}`);
      if (raw) {
        const ragData = JSON.parse(raw);
        if (ragData.activities?.length > 0) {
          activities = ragData.activities;
        } else {
          activities = getActivitiesByRole(role);
        }
      } else {
        activities = getActivitiesByRole(role);
      }
    } catch {
      activities = getActivitiesByRole(role);
    }

    const route = generateRoute(activities);
    const path = buildRoutePath(route.points);
    setRoutePoints(route.points);
    setRoutePath(path);
  }, [mounted, role]);

  // 路径绘制完成后标记
  useEffect(() => {
    if (!mounted || !pathRef.current || routePoints.length === 0) return;
    const timer = setTimeout(() => setDrawDone(true), 2500 + routePoints.length * 600);
    return () => clearTimeout(timer);
  }, [mounted, routePoints]);

  const hasRoute = routePoints.length > 0;

  useEffect(() => {
    if (selected && infoRef.current) {
      setTimeout(() => infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
  }, [selected]);

  if (!mounted) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center bg-rice-paper">
        <div className="text-4xl font-chinese font-bold text-scroll-dark animate-pulse">加载中...</div>
      </main>
    );
  }

  const routeWaypointIds = new Set(routePoints.map((p) => p.location.id));

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-rice-paper">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 ancient-texture opacity-15" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-gold-accent/5 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full">
        {/* ===== 导航 ===== */}
        <nav className="sticky top-0 z-30 bg-rice-paper/95 backdrop-blur-md border-b border-border-warm/60">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex justify-between items-center h-18 sm:h-20">
              <Link href="/" className="text-base sm:text-lg font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors">
                ← 首页
              </Link>
              <div className="flex items-center gap-4">
                <Link href={`/experience?role=${encodeURIComponent(role)}`} className="text-base sm:text-lg font-chinese font-bold text-scroll-dark hover:text-gold-accent transition-colors">
                  体验
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* ===== 标题区 ===== */}
        <div className="relative pt-12 sm:pt-20 pb-8 sm:pb-12"
          style={{ animation: mounted ? 'scroll-unfold 1s cubic-bezier(0.77,0,0.18,1) 0.1s both' : 'none' }}
        >
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <div className="scroll-rod" />
          </div>
          <div className="relative bg-rice-paper/60 mx-auto max-w-6xl px-6 sm:px-8 py-10 sm:py-14">
            <div className="flex justify-center items-center mb-6 space-x-4">
              <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
              <div className="w-2.5 h-2.5 bg-gold-accent rounded-full" />
              <div className="flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent via-border-warm to-transparent" />
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-chinese font-bold text-secondary tracking-[0.3em] mb-4"
                style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.3s both' : 'none' }}>
                {role} · 今日路线
              </p>
              <h1 className="title-hero text-center ink-brush"
                style={{ animation: mounted ? 'ink-spread 1s ease-out 0.4s both' : 'none' }}>
                东京城生活地图
              </h1>
              <div className="flex justify-center gap-3 mt-5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="w-2 h-2 bg-gold-accent rounded-full" />
                ))}
              </div>
              <p className="text-body tracking-wider max-w-xl mx-auto"
                style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.5s both' : 'none' }}>
                {hasRoute ? `今日途径 ${routePoints.length} 处 · 点击地标探寻详情` : '点击地标，探寻千年前的市井繁华'}
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <div className="scroll-rod" />
          </div>
        </div>

        {/* ===== 路线概要 ===== */}
        {hasRoute && (
          <div className="relative px-6 sm:px-8 lg:px-10 -mt-4 mb-8"
            style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.6s both' : 'none' }}>
            <div className="max-w-5xl mx-auto">
              <div className="bg-white/70 border border-border-warm rounded-xl px-5 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 shadow-sm">
                <span className="text-sm font-chinese font-bold text-secondary tracking-wider">今日路线</span>
                {routePoints.map((p, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="text-base">{p.location.icon}</span>
                    <span className="text-sm font-chinese font-medium text-scroll-dark">{p.location.name}</span>
                    {i < routePoints.length - 1 && (
                      <span className="text-sm text-gold-accent/50 ml-1">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== 地图主体 ===== */}
        <div className="relative px-6 sm:px-8 lg:px-10 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 px-4"
              style={{ animation: mounted ? 'fade-slide-up 0.6s ease-out 0.6s both' : 'none' }}>
              {Object.entries(CATEGORY_STYLE).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: val.color }} />
                  <span className="text-sm font-chinese text-ink-light tracking-wider">{key}</span>
                </div>
              ))}
              {hasRoute && (
                <div className="flex items-center gap-2">
                  <span className="w-6 h-[3px] rounded-full bg-gold-accent" />
                  <span className="text-sm font-chinese text-ink-light tracking-wider">今日路线</span>
                </div>
              )}
            </div>

            <div className="card-premium p-4 sm:p-6 md:p-8 relative"
              style={{ animation: mounted ? 'stat-appear 0.6s ease-out 0.7s both' : 'none' }}>
              <div className="absolute inset-4 sm:inset-6 md:inset-8 border border-border-warm/40 pointer-events-none rounded-xl" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-accent/25" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-accent/25" />

              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10]">
                <svg
                  viewBox="0 0 800 550"
                  className="w-full h-full select-none"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  <defs>
                    <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="#F8F2E8" />
                      <rect x="0" y="0" width="1" height="40" fill="rgba(216,200,168,0.15)" />
                      <rect x="0" y="0" width="40" height="1" fill="rgba(216,200,168,0.15)" />
                    </pattern>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(184,135,43,0.12)" />
                      <stop offset="100%" stopColor="rgba(184,135,43,0)" />
                    </radialGradient>
                    <filter id="soft-shadow">
                      <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.12)" />
                    </filter>
                    {/* 路线辉光渐变 */}
                    <filter id="route-glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* 光点渐变 */}
                    <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(184,135,43,0.8)" />
                      <stop offset="100%" stopColor="rgba(184,135,43,0)" />
                    </radialGradient>
                  </defs>

                  <rect width="800" height="550" fill="url(#map-grid)" rx="12" />
                  <rect width="800" height="550" fill="url(#glow)" rx="12" />

                  {/* ===== 城墙 ===== */}
                  <path d="M120,80 L680,80 L720,140 L740,260 L740,380 L700,480 L640,520 L400,540 L160,520 L100,480 L60,380 L60,260 L80,140 Z" fill="none" stroke="#8B6B2E" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.4" />
                  {[
                    { x: 400, y: 80, label: '新曹门' },
                    { x: 740, y: 300, label: '新宋门' },
                    { x: 400, y: 540, label: '南薰门' },
                    { x: 60, y: 300, label: '万胜门' },
                  ].map((gate) => (
                    <g key={gate.label}>
                      <rect x={gate.x - 14} y={gate.y - 6} width="28" height="12" rx="2" fill="#F8F2E8" stroke="#8B6B2E" strokeWidth="1.5" opacity="0.6" />
                      <text x={gate.x} y={gate.y + 20} textAnchor="middle" fill="#8B6B2E" fontSize="11" opacity="0.5">{gate.label}</text>
                    </g>
                  ))}
                  <text x="400" y="42" textAnchor="middle" fill="#8B6B2E" fontSize="18" fontWeight="700" opacity="0.12" letterSpacing="8">东 · 京 · 城</text>

                  {/* ===== 御街 ===== */}
                  <line x1="400" y1="80" x2="400" y2="530" stroke="#D8C8A8" strokeWidth="2" opacity="0.3" strokeDasharray="6,3" />
                  <text x="400" y="480" textAnchor="middle" fill="#D8C8A8" fontSize="10" opacity="0.3">御 街</text>

                  {/* ===== 汴河 ===== */}
                  <path d="M60,340 Q200,290 320,300 Q440,310 520,280 Q620,250 740,260" fill="none" stroke="#4A7C7C" strokeWidth="12" opacity="0.18" />
                  <path d="M60,340 Q200,290 320,300 Q440,310 520,280 Q620,250 740,260" fill="none" stroke="#4A7C7C" strokeWidth="3" opacity="0.30" />
                  {[[180, 308], [280, 302], [380, 304], [480, 295], [580, 272], [680, 258]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3" fill="none" stroke="#4A7C7C" strokeWidth="0.8" opacity="0.2" />
                  ))}
                  <text x="140" y="295" textAnchor="middle" fill="#4A7C7C" fontSize="13" fontWeight="600" opacity="0.40">汴 河</text>

                  {/* ===== 街道网格 ===== */}
                  <g stroke="#D8C8A8" strokeWidth="1" opacity="0.15">
                    <line x1="160" y1="140" x2="160" y2="480" />
                    <line x1="280" y1="100" x2="280" y2="520" />
                    <line x1="520" y1="100" x2="520" y2="520" />
                    <line x1="640" y1="140" x2="640" y2="480" />
                    <line x1="180" y1="200" x2="660" y2="200" />
                    <line x1="140" y1="360" x2="700" y2="360" />
                    <line x1="200" y1="440" x2="640" y2="440" />
                  </g>

                  {/* ===== 坊区 ===== */}
                  <g opacity="0.06">
                    <rect x="170" y="110" width="100" height="70" fill="#8B6B2E" rx="2" />
                    <rect x="290" y="110" width="100" height="70" fill="#8B6B2E" rx="2" />
                    <rect x="520" y="110" width="90" height="70" fill="#8B6B2E" rx="2" />
                    <rect x="170" y="310" width="110" height="70" fill="#8B6B2E" rx="2" />
                    <rect x="520" y="310" width="110" height="70" fill="#8B6B2E" rx="2" />
                    <rect x="280" y="400" width="220" height="80" fill="#8B6B2E" rx="2" />
                  </g>

                  {/* ══════ 金色轨迹线（逐步绘制动画） ══════ */}
                  {hasRoute && routePath && (
                    <g filter="url(#route-glow)">
                      <path
                        ref={pathRef}
                        d={routePath}
                        fill="none"
                        stroke="#B8872B"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                        opacity="0.9"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="2000"
                          to="0"
                          dur={`${Math.max(2, routePoints.length * 0.8)}s`}
                          begin="0.5s"
                          fill="freeze"
                          calcMode="spline"
                          keySplines="0.25 0.1 0.25 1"
                          keyTimes="0;1"
                        />
                      </path>
                      {/* 外发光描边 */}
                      <path
                        d={routePath}
                        fill="none"
                        stroke="#B8872B"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.15"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="2000"
                          to="0"
                          dur={`${Math.max(2, routePoints.length * 0.8)}s`}
                          begin="0.5s"
                          fill="freeze"
                        />
                      </path>
                    </g>
                  )}

                  {/* 路线节点间的连接光点 */}
                  {hasRoute && routePoints.map((p, i) => {
                    const px = (p.location.x / 100) * 800;
                    const py = (p.location.y / 100) * 550;
                    return (
                      <circle key={`route-dot-${i}`}
                        cx={px} cy={py}
                        r="8" fill="url(#dotGlow)"
                        opacity="0.6"
                      >
                        <animate attributeName="opacity" from="0.6" to="1" dur="1.2s" begin={`${i * 0.4 + 0.8}s`} fill="freeze" />
                      </circle>
                    );
                  })}

                  {/* 路线起点标记 */}
                  {hasRoute && routePoints.length > 0 && (
                    <g>
                      <circle
                        cx={(routePoints[0].location.x / 100) * 800}
                        cy={(routePoints[0].location.y / 100) * 550}
                        r="14" fill="none" stroke="#B8872B" strokeWidth="2" opacity="0"
                      >
                        <animate attributeName="opacity" from="0" to="0.5" dur="1s" begin="0.5s" fill="freeze" />
                        <animate attributeName="r" from="10" to="20" dur="2s" begin="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="1s" repeatCount="indefinite" />
                      </circle>
                      <text
                        x={(routePoints[0].location.x / 100) * 800}
                        y={(routePoints[0].location.y / 100) * 550 - 18}
                        textAnchor="middle" fill="#B8872B" fontSize="10" fontWeight="700" opacity="0"
                      >
                        起点
                        <animate attributeName="opacity" from="0" to="0.7" dur="0.5s" begin="1s" fill="freeze" />
                      </text>
                    </g>
                  )}

                  {/* 路线终点标记 */}
                  {hasRoute && routePoints.length > 1 && (
                    <g>
                      <circle
                        cx={(routePoints[routePoints.length - 1].location.x / 100) * 800}
                        cy={(routePoints[routePoints.length - 1].location.y / 100) * 550}
                        r="14" fill="none" stroke="#B8872B" strokeWidth="2" opacity="0"
                      >
                        <animate attributeName="opacity" from="0" to="0.5" dur="1s" begin={`${routePoints.length * 0.6 + 0.5}s`} fill="freeze" />
                        <animate attributeName="r" from="10" to="20" dur="2s" begin={`${routePoints.length * 0.6 + 1}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin={`${routePoints.length * 0.6 + 1}s`} repeatCount="indefinite" />
                      </circle>
                      <text
                        x={(routePoints[routePoints.length - 1].location.x / 100) * 800}
                        y={(routePoints[routePoints.length - 1].location.y / 100) * 550 - 18}
                        textAnchor="middle" fill="#B8872B" fontSize="10" fontWeight="700" opacity="0"
                      >
                        终点
                        <animate attributeName="opacity" from="0" to="0.7" dur="0.5s" begin={`${routePoints.length * 0.6 + 1}s`} fill="freeze" />
                      </text>
                    </g>
                  )}

                  {/* ══════ 地标标记 ══════ */}
                  {LOCATIONS.map((loc) => {
                    const cat = CATEGORY_STYLE[loc.category] ?? { color: '#B8872B' };
                    const isHovered = hovered === loc.id;
                    const isSelected = selected?.id === loc.id;
                    const pulse = isHovered || isSelected;
                    const onRoute = routeWaypointIds.has(loc.id);
                    const routeIndex = routePoints.findIndex((p) => p.location.id === loc.id);
                    const isRouteStart = routeIndex === 0;
                    const isRouteEnd = routeIndex === routePoints.length - 1 && routePoints.length > 1;

                    return (
                      <g key={loc.id}
                        className="cursor-pointer"
                        onMouseEnter={() => setHovered(loc.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setSelected(loc)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* 路线辉光 */}
                        {onRoute && drawDone && (
                          <circle cx={loc.x * 8} cy={loc.y * 8} r="26" fill="none" stroke="#B8872B" strokeWidth="1.5" opacity="0.2">
                            <animate attributeName="r" from="20" to="32" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.3" to="0" dur="2.5s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {/* 底座 */}
                        <circle cx={loc.x * 8} cy={loc.y * 8}
                          r={pulse ? 17 : onRoute ? 15 : 13}
                          fill={pulse ? '#FFFCF5' : onRoute ? '#FFFCF5' : '#F8F2E8'}
                          stroke={onRoute && !pulse ? '#B8872B' : pulse ? '#B8872B' : cat.color}
                          strokeWidth={pulse ? 3 : onRoute ? 2.5 : 2}
                          filter={pulse ? 'url(#soft-shadow)' : undefined}
                          style={{ transition: 'all 0.3s ease' }}
                        />
                        {/* 序号（路线上） */}
                        {onRoute && !pulse && (
                          <text x={loc.x * 8 + 16} y={loc.y * 8 - 12}
                            textAnchor="middle" fill="#B8872B" fontSize="9" fontWeight="700" opacity="0.5">
                            {routeIndex + 1}
                          </text>
                        )}
                        {/* 起点/终点标签 */}
                        {isRouteStart && drawDone && !pulse && (
                          <text x={loc.x * 8} y={loc.y * 8 - 20}
                            textAnchor="middle" fill="#B8872B" fontSize="9" fontWeight="700" opacity="0.6">
                            始
                          </text>
                        )}
                        {isRouteEnd && drawDone && !pulse && (
                          <text x={loc.x * 8} y={loc.y * 8 - 20}
                            textAnchor="middle" fill="#B8872B" fontSize="9" fontWeight="700" opacity="0.6">
                            终
                          </text>
                        )}
                        {/* 内圈 */}
                        <circle cx={loc.x * 8} cy={loc.y * 8} r="8" fill={cat.color} opacity={pulse ? 0.3 : onRoute ? 0.2 : 0.12} />
                        {/* 图标 */}
                        <text x={loc.x * 8} y={loc.y * 8 + 5} textAnchor="middle" fontSize={pulse ? 17 : onRoute ? 14 : 13} style={{ transition: 'all 0.3s ease' }}>
                          {loc.icon}
                        </text>
                        {/* 名称 */}
                        <text x={loc.x * 8} y={loc.y * 8 + 26} textAnchor="middle"
                          fill={pulse ? '#1A1A1A' : onRoute ? '#1A1A1A' : '#5C5C5C'}
                          fontSize={pulse ? 14 : onRoute ? 12 : 11}
                          fontWeight={pulse ? 700 : onRoute ? 600 : 500}
                          fontFamily="'Noto Serif SC',serif"
                          style={{ transition: 'all 0.3s ease' }}>
                          {loc.name}
                        </text>
                        {/* 类别标签 */}
                        <rect x={loc.x * 8 - 12} y={loc.y * 8 + 30} width="24" height="14" rx="2"
                          fill={cat.color} opacity={pulse ? 0.2 : onRoute ? 0.12 : 0.06}
                          style={{ transition: 'all 0.3s ease' }} />
                        <text x={loc.x * 8} y={loc.y * 8 + 40} textAnchor="middle"
                          fill={cat.color} fontSize="8" opacity={pulse ? 0.8 : onRoute ? 0.5 : 0.3}
                          fontFamily="'Noto Serif SC',serif"
                          style={{ transition: 'all 0.3s ease' }}>
                          {cat.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* ===== 图注 ===== */}
                  <g opacity="0.12">
                    <rect x="680" y="500" width="100" height="36" rx="2" fill="none" stroke="#8B6B2E" strokeWidth="0.5" />
                    <text x="730" y="513" textAnchor="middle" fill="#8B6B2E" fontSize="8">城周五里</text>
                    <text x="730" y="525" textAnchor="middle" fill="#8B6B2E" fontSize="8">人口百万余</text>
                  </g>
                </svg>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center md:hidden">
                  <span className="text-xs font-chinese text-ink-light/40 tracking-wider animate-pulse">点击地标查看详情</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 路线详情 ===== */}
        {hasRoute && drawDone && (
          <div className="relative px-6 sm:px-8 lg:px-10 pb-8 -mt-4"
            style={{ animation: 'fade-slide-up 0.5s ease-out both' }}>
            <div className="max-w-5xl mx-auto">
              <div className="card-premium p-5 sm:p-6 md:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-gold-accent rounded-full animate-ink-dot-pulse" />
                  <span className="title-section text-lg sm:text-xl">路线详情</span>
                  <span className="text-sm font-chinese text-ink-light ml-auto">{routePoints.length} 站</span>
                </div>
                <div className="space-y-0">
                  {routePoints.map((p, i) => (
                    <div key={i}
                      className="flex items-start gap-4 py-3 border-b border-border-warm/40 last:border-b-0 hover:bg-white/40 px-3 -mx-3 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setSelected(p.location)}
                    >
                      {/* 序号 */}
                      <div className="flex flex-col items-center gap-1 min-w-[32px]">
                        <span className="w-7 h-7 rounded-full bg-gold-accent/15 border border-gold-accent/30 flex items-center justify-center text-xs font-bold text-gold-accent">
                          {i + 1}
                        </span>
                      </div>
                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.location.icon}</span>
                          <h4 className="text-base sm:text-lg font-chinese font-bold text-scroll-dark">{p.location.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-chinese text-secondary tracking-wider">{p.time}</span>
                          <span className="text-xs text-ink-light/40">·</span>
                          <span className="text-xs font-chinese text-ink-light">{p.activityTitle}</span>
                        </div>
                      </div>
                      <span className="text-sm text-ink-light/30 self-center">→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 地标详情弹窗 ===== */}
        {selected && (
          <div className="relative px-6 sm:px-8 lg:px-10 pb-20 -mt-4" ref={infoRef}>
            <div className="max-w-5xl mx-auto">
              <div className="card-premium p-6 sm:p-8 md:p-10 relative overflow-hidden"
                style={{ animation: 'fade-slide-up 0.5s ease-out both' }}>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold-accent/6 to-transparent rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/10 to-transparent rounded-full blur-xl" />
                </div>
                <button onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-border-warm text-ink-light hover:text-scroll-dark hover:border-gold-accent transition-colors text-lg">
                  ✕
                </button>
                <div className="relative z-10">
                  <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="text-4xl sm:text-5xl flex-shrink-0 mt-1">{selected.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-chinese font-bold text-rice-paper px-3 py-1 rounded-sm"
                          style={{ backgroundColor: CATEGORY_STYLE[selected.category]?.color ?? '#B8872B' }}>
                          {selected.category}
                        </span>
                        {routeWaypointIds.has(selected.id) && (
                          <span className="text-xs font-chinese text-gold-accent border border-gold-accent/30 px-2 py-0.5 rounded-sm">
                            今日途经
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-chinese font-black text-scroll-dark ink-brush">
                        {selected.name}
                      </h2>
                    </div>
                  </div>
                  {/* 古籍卡片：东京梦华录原文 */}
                  <div
                    className="relative mb-6"
                    style={{ animation: 'scroll-unfold 0.8s cubic-bezier(0.77, 0, 0.18, 1) 0.2s both' }}
                  >
                    {/* 上卷轴杆 */}
                    <div className="max-w-md mx-auto px-4">
                      <div className="scroll-rod !h-3" />
                    </div>
                    {/* 内页 */}
                    <div className="relative bg-gradient-to-b from-amber-50/80 to-amber-100/30 mx-auto max-w-lg px-5 sm:px-7 py-5 sm:py-6 border-x border-border-warm/30">
                      <div className="absolute inset-0 ancient-texture opacity-30 pointer-events-none" />

                      {/* 出处标头 */}
                      <div className="relative z-10 flex items-center gap-2 mb-4 pb-3 border-b border-border-warm/30">
                        <span className="text-base flex-shrink-0">📜</span>
                        <span className="text-sm font-chinese font-bold text-secondary tracking-wider">
                          {selected.source}
                        </span>
                      </div>

                      {/* 原文 */}
                      <div className="relative z-10 mb-4">
                        <p className="text-[10px] font-chinese text-ink-light/40 tracking-widest mb-1.5">
                          · 原文 ·
                        </p>
                        <p className="text-[15px] sm:text-base font-chinese text-scroll-dark/80 leading-relaxed italic pl-3 border-l-2 border-gold-accent/30">
                          {selected.originalText}
                        </p>
                      </div>

                      {/* 释义 */}
                      <div className="relative z-10">
                        <p className="text-[10px] font-chinese text-ink-light/40 tracking-widest mb-1.5">
                          · 释义 ·
                        </p>
                        <p className="text-[16px] sm:text-lg font-chinese text-ink-light leading-relaxed">
                          {selected.explanation}
                        </p>
                      </div>

                      {/* 装饰角 */}
                      <span className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-gold-accent/20" />
                      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-gold-accent/20" />
                    </div>
                    {/* 下卷轴杆 */}
                    <div className="max-w-md mx-auto px-4">
                      <div className="scroll-rod !h-3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div className="bg-white/50 border border-border-warm rounded-xl p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
                        <span className="text-base font-chinese font-bold text-secondary tracking-wider">历史简介</span>
                      </div>
                      <p className="text-sm sm:text-base font-chinese text-scroll-dark/70 leading-relaxed">{selected.history}</p>
                    </div>
                    <div className="bg-white/50 border border-border-warm rounded-xl p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
                        <span className="text-base font-chinese font-bold text-secondary tracking-wider">现代对应</span>
                      </div>
                      <p className="text-sm sm:text-base font-chinese text-scroll-dark/70 leading-relaxed">{selected.modern}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-6 pt-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                    <span className="text-xs font-chinese text-ink-light/30 tracking-widest select-none">《东京梦华录》· {selected.source}</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-warm to-transparent" />
                  </div>
                </div>
                <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-accent/25" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-accent/25" />
              </div>
            </div>
          </div>
        )}

        {/* ===== 底部 ===== */}
        <div className="relative px-6 sm:px-8 lg:px-10 py-12 sm:py-16">
          <div className="flex justify-center items-center mb-6 space-x-4">
            <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
            <div className="w-2 h-2 bg-gold-accent rounded-full" />
            <div className="flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent via-border-warm to-transparent" />
          </div>
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <Link href="/identity"
              className="group relative px-10 sm:px-14 py-4 sm:py-5 bg-scroll-dark text-rice-paper font-chinese font-bold text-base sm:text-lg rounded-none overflow-hidden transition-all duration-300 hover:bg-gold-accent hover:text-scroll-dark shadow-lg hover:shadow-2xl inline-flex items-center gap-3">
              <span className="absolute inset-0 bg-gold-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="relative flex items-center gap-2">
                <span>选择身份 开始体验</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <div className="flex justify-center gap-6 text-base sm:text-lg">
              <Link href="/" className="font-chinese font-bold text-secondary hover:text-scroll-dark transition-colors">← 首页</Link>
              <span className="text-border-warm">|</span>
              <Link href={`/experience?role=${encodeURIComponent(role)}`} className="font-chinese font-bold text-secondary hover:text-scroll-dark transition-colors">查看完整体验</Link>
              <span className="text-border-warm">|</span>
              <Link href={`/report?role=${encodeURIComponent(role)}`} className="font-chinese font-bold text-secondary hover:text-scroll-dark transition-colors">查看报告</Link>
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
              <p className="text-base font-chinese text-ink-light">梦华一日 © 2024 · 路线由体验活动自动生成</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
