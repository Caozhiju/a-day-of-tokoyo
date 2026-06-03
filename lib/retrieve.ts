/* ─────────── 类型 ─────────── */

export interface RetrieveInput {
  role: string;
  location: string;
  time: string;
}

export interface Knowledge {
  place: string[];
  character: string[];
  activity: string[];
  food: string[];
  festival: string[];
  commerce: string[];
}

export interface RetrievedChunk {
  id: string;
  content: string;
  /** 综合相关度 0-1（混合分: 向量 * 0.4 + 角色匹配 * 0.6） */
  score: number;
  /** 向量相似度 0-1 */
  vectorScore?: number;
  /** 角色匹配度 0-1 */
  charScore?: number;
  knowledge: Knowledge;
}

/* ═══════════════════════════════════════════════════════════
   角色匹配规则
   每项定义：
   - keywords: 要匹配的关键词列表
   - fields:   在 knowledge 的哪些字段中搜索
   （实际数据中 character 以历史人名为主，social role 标签偏少，
     因此联合 activity / commerce / place / food 一起检索）
   - 未知角色自动降级为纯向量检索
   ═══════════════════════════════════════════════════════════ */
interface RoleMatchRule {
  keywords: string[];
  fields: (keyof Knowledge)[];
}

const ROLE_MATCH_RULES: Record<string, RoleMatchRule> = {
  '北宋书生': { keywords: ['士', '学', '书'], fields: ['character', 'activity'] },
  '茶坊老板': { keywords: ['茶'], fields: ['character', 'commerce', 'activity', 'food', 'place'] },
  '酒楼伙计': { keywords: ['酒', '食', '厨'], fields: ['character', 'commerce', 'activity', 'food', 'place'] },
  '夜市商贩': { keywords: ['商', '市', '贩', '卖', '夜', '铺'], fields: ['character', 'commerce', 'activity'] },
  '外地游客': { keywords: ['客', '游'], fields: ['character', 'commerce', 'activity', 'place'] },
};

function getRoleRule(role: string): RoleMatchRule | null {
  return ROLE_MATCH_RULES[role] ?? null;
}

/* ═══════════════════════════════════════════════════════════
   角色匹配评分 —— 0~1
   对每个 keyword，在规则的 fields 中遍历，任一个 tags 命中即算该 keyword 命中
   命中率 = 命中关键词数 / 关键词总数（封顶 1）
   ═══════════════════════════════════════════════════════════ */
function characterMatchScore(
  knowledge: Knowledge,
  rule: RoleMatchRule | null,
): number {
  if (!rule || !rule.keywords.length) return 0;
  let matches = 0;
  for (const kw of rule.keywords) {
    let kwHit = false;
    for (const field of rule.fields) {
      const tags = knowledge[field];
      if (Array.isArray(tags) && tags.some((t) => t.includes(kw))) {
        kwHit = true;
        break;
      }
    }
    if (kwHit) matches++;
  }
  return Math.min(1, matches / rule.keywords.length);
}

/* ═══════════════════════════════════════════════════════════
   混合检索权重
   - 角色优先：角色匹配 0.6，向量相似度 0.4
   - 任意 charScore ≥ 0.4 的 chunk 将压制无匹配的 chunk
   - charScore = 1 时混合分下限 0.6，charScore = 0 时按纯向量排序
   ═══════════════════════════════════════════════════════════ */
const VECTOR_WEIGHT = 0.4;
const CHARACTER_WEIGHT = 0.6;

const DEFAULT_KNOWLEDGE: Knowledge = {
  place: [], character: [], activity: [],
  food: [], festival: [], commerce: [],
};

/* ─────────── 余弦相似度 ─────────── */

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/* ─────────── 服务端数据加载 ─────────── */

interface CacheData {
  ids: string[];
  vectors: Float32Array[];
  knowledge: Map<string, Knowledge>;
  chunks: Map<string, string>;
}

let cache: CacheData | null = null;

async function loadCache(): Promise<CacheData> {
  if (cache) return cache;

  const fs = await import('fs');
  const path = await import('path');
  const root = process.cwd();

  // 读取二进制 embeddings（约 4.6MB 替代原来的 30MB JSON）
  const binBuf = await fs.promises.readFile(path.join(root, 'tokyo_embeddings.bin'));
  const VEC_DIM = 1024;
  const VEC_BYTES = VEC_DIM * 4; // Float32 = 4 字节
  let offset = 0;
  const count = binBuf.readUInt32LE(offset);
  offset += 4;

  const ids: string[] = [];
  const vectors: Float32Array[] = [];

  for (let i = 0; i < count; i++) {
    const idLen = binBuf.readUInt32LE(offset);
    offset += 4;
    const id = binBuf.toString('utf-8', offset, offset + idLen);
    offset += idLen;
    const vec = new Float32Array(VEC_DIM);
    for (let d = 0; d < VEC_DIM; d++) {
      vec[d] = binBuf.readFloatLE(offset + d * 4);
    }
    offset += VEC_BYTES;
    ids.push(id);
    vectors.push(vec);
  }

  // 读取知识库和文本片段
  const [knowRaw, chunkRaw] = await Promise.all([
    fs.promises.readFile(path.join(root, 'tokyo_knowledge.json'), 'utf-8').then(JSON.parse),
    fs.promises.readFile(path.join(root, 'tokyo_chunks.json'), 'utf-8').then(JSON.parse),
  ]);

  const knowledge = new Map<string, Knowledge>();
  knowRaw.forEach((item: any) => {
    knowledge.set(item.id, {
      place: item.place || [],
      character: item.character || [],
      activity: item.activity || [],
      food: item.food || [],
      festival: item.festival || [],
      commerce: item.commerce || [],
    });
  });

  const chunks = new Map<string, string>();
  chunkRaw.forEach((item: any) => {
    chunks.set(item.id, item.content || '');
  });

  cache = { ids, vectors, knowledge, chunks };
  return cache;
}

/* ─────────── 查询向量化 ─────────── */

async function embedQuery(text: string): Promise<number[]> {
  const baseURL = process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) throw new Error('OPENAI_API_KEY 未配置');

  const resp = await fetch(`${baseURL}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      input: [text],
      model: 'nvidia/nv-embedqa-e5-v5',
      input_type: 'query',
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '');
    throw new Error(`Embedding API 错误 (${resp.status}): ${errBody.slice(0, 100)}`);
  }

  const data = await resp.json();
  return data.data[0].embedding;
}

/* ─────────── 共享：混合检索内部实现 ─────────── */

interface HybridScored {
  id: string;
  vectorScore: number;
  charScore: number;
  hybridScore: number;
  knowledge: Knowledge;
}

/**
 * 计算每个 chunk 的 (向量分, 角色匹配分, 混合分) 并按混合分排序
 * - 角色匹配的 chunk 会获得 0.6 的稳定加权，与纯向量相比具有决定性优势
 * - 角色关键词为空（未知身份）时，charScore 全 0，退化为纯向量排序
 */
async function hybridRetrieve(
  input: RetrieveInput,
  topK: number,
): Promise<HybridScored[]> {
  const { ids, vectors, knowledge } = await loadCache();
  const roleRule = getRoleRule(input.role);

  const queryText = [
    `身份：${input.role}`,
    `地点：${input.location}`,
    `时间：${input.time}`,
    `在北宋东京城中，${input.role}在${input.time}来到${input.location}。`,
  ].join('。');

  const queryVec = await embedQuery(queryText);
  const queryArr = new Float32Array(queryVec);

  const scored: HybridScored[] = vectors.map((vec, i) => {
    const id = ids[i];
    const vectorScore = cosineSimilarity(queryArr, vec);
    const kn = knowledge.get(id) ?? DEFAULT_KNOWLEDGE;
    const charScore = characterMatchScore(kn, roleRule);
    const hybridScore = vectorScore * VECTOR_WEIGHT + charScore * CHARACTER_WEIGHT;
    return { id, vectorScore, charScore, hybridScore, knowledge: kn };
  });

  scored.sort((a, b) => b.hybridScore - a.hybridScore);
  return scored.slice(0, topK);
}

/* ─────────── 主函数：retrieve（/api/retrieve 入口） ─────────── */

/**
 * 混合检索：角色匹配 + 向量相似度
 * - 角色匹配：chunk.knowledge.character 与角色关键词命中 → +0.6 加权
 * - 向量相似度：cosine × 0.4 加权
 * - 排序：按混合分降序，取 topK
 * - 若角色关键词未匹配（输入未知身份），自动降级为纯向量检索
 *
 * @param input  检索条件（role / location / time）
 * @param topK   返回条数，默认 3
 * @returns      按混合相关度降序排列的片段
 */
export async function retrieve(
  input: RetrieveInput,
  topK: number = 3,
): Promise<RetrievedChunk[]> {
  const { chunks } = await loadCache();
  const top = await hybridRetrieve(input, topK);

  return top.map((item) => ({
    id: item.id,
    content: (chunks.get(item.id) || '').slice(0, 120),
    score: Math.round(item.hybridScore * 10000) / 10000,
    vectorScore: Math.round(item.vectorScore * 10000) / 10000,
    charScore: Math.round(item.charScore * 10000) / 10000,
    knowledge: item.knowledge,
  }));
}

/* ─────────── RAG 专用：返回完整原文 ─────────── */

/** RAG 检索返回的完整片段（content 不过截断、便于喂给 LLM） */
export interface RetrievedChunkFull {
  id: string;
  /** 完整原文（无截断） */
  content: string;
  score: number;
  vectorScore?: number;
  charScore?: number;
  knowledge: Knowledge;
}

/**
 * RAG 检索：与 retrieve() 相同逻辑（混合排序），但返回完整原文不截断
 * 用于把检索结果直接拼入 Prompt
 */
export async function retrieveForRAG(
  input: RetrieveInput,
  topK: number = 3,
): Promise<RetrievedChunkFull[]> {
  const { chunks } = await loadCache();
  const top = await hybridRetrieve(input, topK);

  return top.map((item) => ({
    id: item.id,
    content: chunks.get(item.id) || '',
    score: Math.round(item.hybridScore * 10000) / 10000,
    vectorScore: Math.round(item.vectorScore * 10000) / 10000,
    charScore: Math.round(item.charScore * 10000) / 10000,
    knowledge: item.knowledge,
  }));
}
