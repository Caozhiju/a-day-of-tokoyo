/* ═══════════════════════════════════════════════════════════
   路线生成 —— 根据活动内容自动生成今日路线
   ═══════════════════════════════════════════════════════════ */

import { LOCATIONS, type LocationData } from './locations';

/** 活动 → 地点关键词映射规则 */
const LOCATION_KEYWORDS: Record<string, string[]> = {
  'zhou-qiao': ['州桥'],
  'bian-he': ['汴河'],
  'panlou-street': ['潘楼街'],
  'xiangguo-temple': ['相国寺'],
  'washe-goulan': ['瓦舍', '勾栏'],
};

/** 活动 → 地点名称映射（支持从活动描述中提取） */
function findLocationIds(text: string): string[] {
  const found: string[] = [];
  for (const [id, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      found.push(id);
    }
  }
  return found;
}

export interface RoutePoint {
  location: LocationData;
  /** 该地点对应的活动标题 */
  activityTitle: string;
  /** 对应时辰 */
  time: string;
}

export interface GeneratedRoute {
  /** 路线上的地点（按活动时间顺序，含重复） */
  points: RoutePoint[];
  /** 去重后的唯一地点列表 */
  uniqueLocations: LocationData[];
  /** 路线总步数 */
  steps: number;
}

/**
 * 根据活动列表自动生成路线
 */
export function generateRoute(
  activities: { time: string; title: string; description: string }[],
): GeneratedRoute {
  const points: RoutePoint[] = [];

  activities.forEach((act) => {
    const text = `${act.title} ${act.description}`;
    const ids = findLocationIds(text);

    ids.forEach((id) => {
      const loc = LOCATIONS.find((l) => l.id === id);
      if (loc) {
        // 避免同一活动反复添加同一个地点
        const alreadyInActivity = points.some(
          (p) => p.location.id === id && p.time === act.time,
        );
        if (!alreadyInActivity) {
          points.push({
            location: loc,
            activityTitle: act.title,
            time: act.time,
          });
        }
      }
    });
  });

  // 去重唯一地点（保持首次出现顺序）
  const seen = new Set<string>();
  const uniqueLocations: LocationData[] = [];
  points.forEach((p) => {
    if (!seen.has(p.location.id)) {
      seen.add(p.location.id);
      uniqueLocations.push(p.location);
    }
  });

  return {
    points,
    uniqueLocations,
    steps: points.length,
  };
}

/**
 * 构建 SVG path 的 d 属性
 * 将路线点坐标映射到 SVG 800×550 视口
 */
export function buildRoutePath(points: RoutePoint[]): string {
  if (points.length === 0) return '';

  const parts = points.map((p, i) => {
    // 坐标从百分比映射到 800×550 视口
    const px = (p.location.x / 100) * 800;
    const py = (p.location.y / 100) * 550;
    if (i === 0) return `M${px},${py}`;
    return `L${px},${py}`;
  });

  return parts.join(' ');
}
