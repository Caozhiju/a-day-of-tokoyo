/* ─────────── 类型 ─────────── */

export interface RetrieveInput {
  role: string;
  location: string;
  time: string;
}

export interface RetrievedChunk {
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

/* ─────────── 余弦相似度 ─────────── */

function cosineSimilarity(a: number[], b: number[]): number {
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
  embeddings: { id: string; vector: number[] }[];
  knowledge: Map<string, RetrievedChunk['knowledge']>;
  chunks: Map<string, string>;
}

let cache: CacheData | null = null;

async function loadCache(): Promise<CacheData> {
  if (cache) return cache;

  const fs = await import('fs');
  const path = await import('path');
  const root = path.resolve(process.cwd());

  const [embRaw, knowRaw, chunkRaw] = await Promise.all([
    fs.promises.readFile(path.join(root, 'tokyo_embeddings.json'), 'utf-8').then(JSON.parse),
    fs.promises.readFile(path.join(root, 'tokyo_knowledge.json'), 'utf-8').then(JSON.parse),
    fs.promises.readFile(path.join(root, 'tokyo_chunks.json'), 'utf-8').then(JSON.parse),
  ]);

  const knowledge = new Map<string, RetrievedChunk['knowledge']>();
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

  cache = { embeddings: embRaw, knowledge, chunks };
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

/* ─────────── 主函数 ─────────── */

/**
 * 根据身份、地点、时间检索最相关的《东京梦华录》片段
 *
 * @param input  检索条件（role / location / time）
 * @param topK   返回条数，默认 3
 * @returns      按余弦相似度降序排列的片段
 */
export async function retrieve(
  input: RetrieveInput,
  topK: number = 3,
): Promise<RetrievedChunk[]> {
  const { embeddings, knowledge, chunks } = await loadCache();

  // 组装查询文本
  const queryText = [
    `身份：${input.role}`,
    `地点：${input.location}`,
    `时间：${input.time}`,
    `在北宋东京城中，${input.role}在${input.time}来到${input.location}。`,
  ].join('。');

  const queryVec = await embedQuery(queryText);

  // 计算余弦相似度
  const scored = embeddings.map((emb) => ({
    id: emb.id,
    score: cosineSimilarity(queryVec, emb.vector),
  }));

  // 取 topK
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);

  return top.map((item) => ({
    id: item.id,
    content: (chunks.get(item.id) || '').slice(0, 120),
    score: Math.round(item.score * 10000) / 10000,
    knowledge: knowledge.get(item.id) || {
      place: [], character: [], activity: [],
      food: [], festival: [], commerce: [],
    },
  }));
}
