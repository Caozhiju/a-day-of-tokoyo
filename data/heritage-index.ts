/* ═══════════════════════════════════════════════════════════
   文明传承指数 —— 基于活动内容的多维文化评分
   ═══════════════════════════════════════════════════════════ */

/** 单个维度的指数 */
export interface HeritageDimension {
  /** 维度标识 */
  id: string;
  /** 维度名称 */
  label: string;
  /** 维度图标 */
  icon: string;
  /** 得分 (0-100) */
  score: number;
  /** 描述 */
  description: string;
  /** 评估依据 */
  evidence: string;
}

/** 完整指数报告 */
export interface HeritageIndexReport {
  dimensions: HeritageDimension[];
  /** 综合评分 (0-100) */
  comprehensive: number;
  /** 综合评语 */
  summary: string;
}

/* ─── 关键词映射规则 ─── */

interface ScoringRule {
  /** 匹配关键词（任一命中即计分） */
  keywords: string[];
  /** 该维度下的权重细分 */
  weight: number;
}

const DIMENSION_RULES: Record<string, { rules: ScoringRule[]; description: string; icon: string; label: string }> = {
  '商业文明': {
    label: '商业文明',
    icon: '🏪',
    description: '从东京城"彩楼欢门"到现代商圈，宋代商业基因在今日的活跃程度',
    rules: [
      { keywords: ['市', '街', '铺', '买', '卖', '市集', '市场', '摊位'], weight: 35 },
      { keywords: ['夜', '灯', '夜市', '灯笼', '州桥夜市'], weight: 25 },
      { keywords: ['商', '经营', '生意', '招牌', '幌子', '彩楼'], weight: 20 },
      { keywords: ['文房', '笔墨', '纸', '砚', '文具', '书市'], weight: 20 },
    ],
  },
  '饮食文化': {
    label: '饮食文化',
    icon: '🍜',
    description: '宋代"逐时施行"的餐饮传统与当代美食文化的血脉关联',
    rules: [
      { keywords: ['餐', '饭', '食', '午膳', '膳', '晚膳', '饮', '吃', '菜肴', '炊饼'], weight: 30 },
      { keywords: ['茶', '泡', '盏', '煮', '茶坊', '茶馆', '茶肆', '龙凤团'], weight: 30 },
      { keywords: ['菜', '汤', '羹', '饼', '包子', '蜜饯', '果子', '零食'], weight: 20 },
      { keywords: ['酒', '楼', '酒楼', '会仙', '筵席'], weight: 20 },
    ],
  },
  '娱乐文化': {
    label: '娱乐文化',
    icon: '🎭',
    description: '从瓦舍勾栏到现代娱乐场，千年不衰的市民欢娱精神',
    rules: [
      { keywords: ['瓦舍', '勾栏', '戏', '曲', '唱', '傀儡', '说书', '杂剧', '表演'], weight: 35 },
      { keywords: ['夜', '灯', '灯笼', '夜市', '州桥夜市'], weight: 25 },
      { keywords: ['逛', '游', '观', '赏', '玩', '看', '听', '围'], weight: 20 },
      { keywords: ['热闹', '喝彩', '鼓掌', '人群', '人声', '喧闹', '鼎沸'], weight: 20 },
    ],
  },
  '礼仪文化': {
    label: '礼仪文化',
    icon: '📜',
    description: '宋人"焚香点茶、挂画插花"的四雅遗风在当代的延续',
    rules: [
      { keywords: ['读', '书', '卷', '批', '注', '笔记', '抄', '典籍', '册', '诗', '文'], weight: 35 },
      { keywords: ['茶', '点茶', '分茶', '击拂', '建盏', '青瓷', '茶汤', '茶'], weight: 20 },
      { keywords: ['墨', '笔', '砚', '纸', '文房', '书法', '字', '卷'], weight: 20 },
      { keywords: ['礼', '雅', '静', '心', '涵养', '修身', '斋', '香'], weight: 25 },
    ],
  },
};

/* ─── 评分引擎 ─── */

/**
 * 根据活动列表计算文明传承指数
 */
export function computeHeritageIndex(
  activities: { title: string; description: string }[],
): HeritageIndexReport {
  const dimensions: HeritageDimension[] = [];
  let totalScore = 0;

  Object.entries(DIMENSION_RULES).forEach(([key, config]) => {
    let dimensionScore = 0;

    config.rules.forEach((rule) => {
      let hitCount = 0;
      let totalCheckCount = 0;

      activities.forEach((act) => {
        const text = `${act.title} ${act.description}`;
        rule.keywords.forEach((kw) => {
          totalCheckCount++;
          if (text.includes(kw)) hitCount++;
        });
      });

      // 每项活动的每条关键词命中率归一化到 weight 权重
      const maxPossibleHits = activities.length * rule.keywords.length;
      const ratio = maxPossibleHits > 0 ? hitCount / maxPossibleHits : 0;
      dimensionScore += ratio * rule.weight;
    });

    // 归一化到 0-100，加一些基础分让图表更饱满
    const finalScore = Math.min(100, Math.round(dimensionScore * 1.8 + 18));
    totalScore += finalScore;

    // 生成评估依据
    const evidenceParts: string[] = [];
    config.rules.forEach((rule) => {
      const hits = activities.filter((act) => {
        const text = `${act.title} ${act.description}`;
        return rule.keywords.some((kw) => text.includes(kw));
      });
      if (hits.length > 0) {
        evidenceParts.push(
          `${hits.map((h) => h.title).join('、')} 等 ${hits.length} 项活动涉及`,
        );
      }
    });

    dimensions.push({
      id: key,
      label: config.label,
      icon: config.icon,
      score: finalScore,
      description: config.description,
      evidence: evidenceParts.slice(0, 2).join('；'),
    });
  });

  const comprehensive = Math.round(totalScore / dimensions.length);

  const summaries: Record<string, string> = {
    excellent: '你的体验深度触摸了宋代文明的多个维度。从市井烟火到书斋雅趣，千年文脉在你身上延续。',
    good: '你在东京城中度过了一段充实的时光。商业的繁荣、饮食的精致、文化的厚重，皆有触及。',
    moderate: '你初步感受了东京城的魅力，尚有更多文化维度等待探索。不妨换一个身份，体验不同的宋代人生。',
  };

  let summary: string;
  if (comprehensive >= 75) summary = summaries.excellent;
  else if (comprehensive >= 50) summary = summaries.good;
  else summary = summaries.moderate;

  return { dimensions, comprehensive, summary };
}
