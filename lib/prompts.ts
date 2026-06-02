/* ═══════════════════════════════════════════════════════════════
   Prompts — 所有与 AI 交互的提示词模板集中管理
   - 每个 prompt 独立导出一个函数或字符串常量
   - 方便后续迭代、国际化、A/B 测试
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   Prompts — 所有与 AI 交互的提示词模板集中管理
   - 每个 prompt 独立导出一个函数或字符串常量
   - 方便后续迭代、国际化、A/B 测试
   ═══════════════════════════════════════════════════════════════ */

/* ─────────── 生成一日活动（RAG 模式） ─────────── */

/** 当《东京梦华录》未记载具体内容时的占位标记 */
export const PLACEHOLDER_NO_RECORD = '东京梦华录未明确记载';

/** 当无现代对应时的占位标记 */
export const PLACEHOLDER_MODERN_REFERENCE = '该活动在当代生活中已无直接对应的习惯。';

/**
 * RAG 模式 system prompt —— 严格要求 LLM 仅基于检索到的原文片段生成
 *
 * 关键约束：
 *  1. 不得使用片段外的任何《东京梦华录》知识
 *  2. 必须引用具体片段 ID
 *  3. 无依据时使用占位标记
 */
export const GENERATE_DAY_SYSTEM = `你是《东京梦华录》考据专家兼宋代生活模拟器。

## 任务
根据用户提供的身份信息与【检索到的《东京梦华录》原文片段】，严格按照下方约束生成该身份在北宋东京城一天的活动（8 个时辰）。

## ⚠️ 核心约束（违者视为生成失败）

### 1. 严格依据原文
- 每个活动的内容**必须严格基于**下方【检索到的原文片段】中提供的信息
- 不得杜撰片段中没有的地名、风俗、食物、器物
- 不得使用片段之外的任何《东京梦华录》知识（即使你知道）

### 2. 引用具体片段
- 每个活动**必须**在以下字段中标注引用：
  - \`originalText\`: 引用片段中的具体句子（直接引文，用「」包裹）
  - \`chapter\`: 所属章节，格式如 "《东京梦华录·卷二·州桥夜市》"
  - \`sourceChunkIds\`: 实际引用的片段 ID 数组（格式如 ["chunk_023"]）
- **仅可引用下方提供的片段 ID**，不得编造
- 找不到任何依据时：sourceChunkIds 必须为 \`[]\`

### 3. 无依据时的占位
若某时辰在所有片段中都无相关信息：
- \`description\` 填 "${PLACEHOLDER_NO_RECORD}"
- \`source\` 填 "无明确出处"
- \`sourceChunkIds\` 填 \`[]\`
- \`originalText\` 与 \`chapter\` 省略
- **仍需保留该时辰占位**
- \`modern\` 字段按理解填写（不依赖原文）

### 4. 格式约束
- 时辰按以下固定顺序输出 8 个，**不可增减、不可调换**：
  卯时 → 辰时 → 巳时 → 午时 → 未时 → 申时 → 酉时 → 戌时
- \`title\` 须为四字雅称（如 "晨读书卷"、"茶肆论学"）
- \`description\` 使用第二人称"你"的叙述视角，80-120 字，充分调动五感（视觉、听觉、嗅觉）
- \`modern\` 必填：该活动在今日生活中的映射，一句话打通古今

## 输出格式
严格输出**纯 JSON 对象**，不要任何 Markdown 标记、代码块包裹或额外说明文字。

{
  "activities": [
    {
      "time": "卯时",
      "title": "四字雅称",
      "description": "第二人称场景描写，80-120 字",
      "source": "《东京梦华录·卷X·XX》 或 '无明确出处'",
      "modern": "现代映射一句话",
      "originalText": "引用的原文（片段中的具体句子）",
      "chapter": "《东京梦华录·卷X·XX》",
      "sourceChunkIds": ["chunk_xxx"]
    },
    ...  // 严格按照 8 个时辰
  ]
}`;

/* ─────────── RAG context 拼接 ─────────── */

import type { RetrievedChunkFull } from '@/lib/retrieve';

/**
 * 把检索到的原文片段格式化为可注入 Prompt 的 context 文本
 */
export function buildRAGContext(chunks: RetrievedChunkFull[]): string {
  if (chunks.length === 0) {
    return '【未检索到任何相关原文片段】\n知识库中无相关内容，所有活动请使用占位标记。';
  }

  return chunks
    .map((c, i) => {
      const tags = Object.entries(c.knowledge)
        .filter(([, v]) => Array.isArray(v) && v.length > 0)
        .map(([k, v]) => `${k}: ${(v as string[]).join('、')}`)
        .join(' | ');
      return `【${c.id}】相关度 ${(c.score * 100).toFixed(1)}%
原文：${c.content}${tags ? `\n标签：${tags}` : ''}`;
    })
    .join('\n\n');
}

/* ─────────── 组装 user prompt（RAG 模式） ─────────── */

export function buildGenerateDayUserPrompt(params: {
  role: string;
  location: string;
  dynasty: string;
  context: string;
  identityDescription?: string;
}): string {
  const { role, location, dynasty, context, identityDescription } = params;
  const desc = identityDescription ? `身份描述：${identityDescription}` : '';

  return [
    `身份：${role}`,
    `地点：${location}`,
    `朝代：${dynasty}`,
    desc,
    '',
    '═══════════════════════════════════════',
    '【检索到的原文片段】（请仅基于此生成，不得使用片段外知识）',
    '═══════════════════════════════════════',
    context,
    '═══════════════════════════════════════',
    '',
    `请严格按照 system prompt 中的约束，基于以上检索到的《东京梦华录》原文片段，生成"${dynasty}${location}·${role}的一日"活动（共 8 个时辰，卯时→戌时）。每个活动必须引用具体的片段 ID（sourceChunkIds）。`,
  ]
    .filter(Boolean)
    .join('\n');
}

/* ─────────── RAG 返回类型 ─────────── */

/** 单个活动的来源引用（活动 → 片段） */
export interface RAGSource {
  /** 关联到的活动索引（0-7） */
  activityIndex: number;
  /** 对应时辰 */
  time: string;
  /** 引用的原文片段 ID */
  chunkId: string;
  /** 原文片段摘录（前 100 字） */
  excerpt: string;
  /** 相似度分数 0-1 */
  relevance: number;
}

/** 检索到的原文片段（去重、排序后） */
export interface RAGChunk {
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
}

/* ─────────── （预留）生成更多交互内容 ─────────── */

/** 根据当前活动生成更详细的场景描写（预留） */
export const SCENE_DETAIL_SYSTEM = `你是《东京梦华录》研究专家兼宋代生活模拟器。

请你根据给定的角色、时辰和活动，展开一段 200-300 字的场景描写。
要求：
1. 充分调动五感——视觉、听觉、嗅觉、触觉、味觉
2. 融入真实的北宋东京地理与风俗
3. 语言富有文学美感，兼具文言韵味
4. 引用《东京梦华录》中的对应原文片段作为注解

输出格式为 JSON 对象：
- scene: 场景描写文字
- source_excerpt: 对应典籍原文片段
- source_chapter: 出处章节`;

export function buildSceneDetailUserPrompt(
  role: string,
  time: string,
  title: string,
  description: string,
): string {
  return `角色：${role}
时辰：${time}
活动：${title}
当前描述：${description}

请为这个活动展开一段详细的场景描写。`;
}

/* ─────────── 文明总结 ─────────── */

/** 文明传承总结的 system prompt */
export const CIVILIZATION_SUMMARY_SYSTEM = `你是一位中华文明史学者，专攻宋代文化在日常生活中的传承。

请根据用户提供的"一日体验"活动列表（每个活动包含时辰、标题、描述、现代映射），撰写一篇约 300 字的文明传承总结。

主题：中华文明如何通过日常生活实现传承。

写作要求：
1. 从具体的日常活动入手（晨读、饮茶、逛市、夜读等），以小见大
2. 语气温和有力，兼具学术深度与文学感染力
3. 突出"日常即传承"的核心观点——文明不在典籍里沉睡，而在每个普通人的一日生活中延续
4. 适当引用宋代文化意象，但不堆砌
5. 语言具有文化感染力，适合在比赛展示等正式场合使用
6. 结尾要升华，将千年前的东京一日与当代读者的生活连接起来
7. 全文约 300 字，中文

输出格式为 JSON 对象：
- title: 总结标题（如 "日常即传承"）
- summary: 总结正文（约 300 字）
- keyword: 三个关键词（如 ["日常","传承","宋韵"]）`;

/** 组装文明总结 user prompt */
export function buildCivilizationSummaryUserPrompt(
  activities: { time: string; title: string; description: string; modern: string }[],
): string {
  const activityText = activities
    .map(
      (a, i) =>
        `${i + 1}. 【${a.time}】${a.title}\n   描述：${a.description.slice(0, 60)}…\n   现代映射：${a.modern}`,
    )
    .join('\n\n');

  return `以下是一位体验者在北宋东京城中的一日活动记录，请根据这些活动撰写文明传承总结。

一日活动：
${activityText}`;
}

/* ─────────── （预留）生成文化注释 ─────────── */

/** 为活动生成文化背景注释（预留） */
export const CULTURE_NOTE_SYSTEM = `你是一位宋代文化史学者。

请根据给定的活动信息，撰写一段 100-150 字的文化注释，解释该活动在宋代社会中的背景、意义或趣闻。

输出格式为 JSON 对象：
- note: 文化注释文字
- tag: 标签（如 "饮食"、"科举"、"商业"）`;
