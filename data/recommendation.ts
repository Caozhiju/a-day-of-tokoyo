/* ═══════════════════════════════════════════════════════════
   东京生活推荐 —— 根据体验内容匹配最适合的身份、地点与活动
   ═══════════════════════════════════════════════════════════ */

export interface TokyoRecommendation {
  /** 最适合职业 */
  bestOccupation: string;
  /** 职业图标 */
  occupationIcon: string;
  /** 原因 */
  reason: string;
  /** 推荐地点 */
  recommendedLocation: string;
  /** 地点图标 */
  locationIcon: string;
  /** 推荐活动 */
  recommendedActivity: string;
  /** 活动图标 */
  activityIcon: string;
  /** 总体推荐理由（一句话） */
  tagline: string;
}

/* ─── 所有可选职业及其关键词匹配规则 ─── */
interface OccupationProfile {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  description: string;
  defaultLocation: string;
  locationIcon: string;
  defaultActivity: string;
  activityIcon: string;
  tagline: string;
}

const OCCUPATION_PROFILES: OccupationProfile[] = [
  {
    id: 'scholar',
    name: '北宋书生',
    icon: '📚',
    keywords: ['读', '书', '卷', '批', '注', '笔', '墨', '纸', '砚', '书房', '论语', '科举', '诗'],
    description: '你的一天充满书卷气息，从晨读到夜批，文脉贯穿始终。东京城的书香之气与你气质相合。',
    defaultLocation: '潘楼街书坊',
    locationIcon: '📖',
    defaultActivity: '去书坊淘旧抄本',
    activityIcon: '📜',
    tagline: '以书为伴，以文会友——东京城中最雅致的活法。',
  },
  {
    id: 'teahouse',
    name: '茶坊老板',
    icon: '🍵',
    keywords: ['茶', '馆', '茶坊', '茶肆', '泡', '盏', '煮', '聊', '聚', '谈', '论', '品', '香'],
    description: '你对茶与社交的敏感度极高，善于在人与人的交流中找到自己的位置。茶坊是你天生的舞台。',
    defaultLocation: '潘楼街茶馆',
    locationIcon: '🏮',
    defaultActivity: '品茶听书',
    activityIcon: '🎵',
    tagline: '一壶茶、一席话——东京城的温度，在你手中传递。',
  },
  {
    id: 'tavern',
    name: '酒楼伙计',
    icon: '🍷',
    keywords: ['酒', '楼', '菜肴', '餐', '饭', '食', '饮', '热闹', '人声', '招呼', '端', '忙碌'],
    description: '你享受市井的热闹与人情往来，手脚麻利且善与人周旋。东京城的酒楼后厨到前堂，都需要你这样的人才。',
    defaultLocation: '会仙酒楼',
    locationIcon: '🏮',
    defaultActivity: '招呼南来北往的食客',
    activityIcon: '🍽️',
    tagline: '最热闹的地方就是你的主场——东京城的美食江湖等你来闯。',
  },
  {
    id: 'vendor',
    name: '夜市商贩',
    icon: '🏪',
    keywords: ['市', '街', '铺', '卖', '买', '摊', '夜', '灯', '夜市', '灯笼', '逛街', '热闹', '熙攘'],
    description: '你对夜晚的灯火和街市的人潮有着天然的亲近感。夜市是你施展才华的最佳舞台。',
    defaultLocation: '州桥夜市',
    locationIcon: '🏮',
    defaultActivity: '摆一盏灯笼，开一间小摊',
    activityIcon: '💡',
    tagline: '当千盏灯火亮起，你的东京故事才刚刚开始。',
  },
  {
    id: 'visitor',
    name: '外地游客',
    icon: '🧳',
    keywords: ['走', '游', '观', '赏', '逛', '看', '城外', '远', '行', '新奇', '初次', '到访'],
    description: '你以好奇的目光打量着这座千年古都的每一个角落。作为游客，东京城处处皆是风景。',
    defaultLocation: '朱雀门',
    locationIcon: '🏛️',
    defaultActivity: '登城楼俯瞰东京全景',
    activityIcon: '👀',
    tagline: '每一次驻足都是一次穿越——东京城的每个转角，都藏着惊喜。',
  },
];

/* ─── 推荐引擎 ─── */

export interface RecommendationScore {
  profile: OccupationProfile;
  score: number;
}

/**
 * 根据活动列表分析最适合的职业、地点和活动
 */
export function computeRecommendation(
  activities: { title: string; description: string }[],
): TokyoRecommendation {
  // 1. 对每个职业打分
  const scores: RecommendationScore[] = OCCUPATION_PROFILES.map((profile) => {
    let score = 0;

    activities.forEach((act) => {
      const text = `${act.title} ${act.description}`;
      profile.keywords.forEach((kw) => {
        if (text.includes(kw)) score += 1;
      });
    });

    return { profile, score };
  });

  // 2. 按得分排序，取最高分
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  // 3. 如果没有命中任何关键词，返回默认（书生）
  if (!best || best.score === 0) {
    const defaultProfile = OCCUPATION_PROFILES[0];
    return {
      bestOccupation: defaultProfile.name,
      occupationIcon: defaultProfile.icon,
      reason: defaultProfile.description,
      recommendedLocation: defaultProfile.defaultLocation,
      locationIcon: defaultProfile.locationIcon,
      recommendedActivity: defaultProfile.defaultActivity,
      activityIcon: defaultProfile.activityIcon,
      tagline: defaultProfile.tagline,
    };
  }

  return {
    bestOccupation: best.profile.name,
    occupationIcon: best.profile.icon,
    reason: best.profile.description,
    recommendedLocation: best.profile.defaultLocation,
    locationIcon: best.profile.locationIcon,
    recommendedActivity: best.profile.defaultActivity,
    activityIcon: best.profile.activityIcon,
    tagline: best.profile.tagline,
  };
}
