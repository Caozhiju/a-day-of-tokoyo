import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import {
  GENERATE_DAY_SYSTEM,
  buildGenerateDayUserPrompt,
  buildRAGContext,
  type RAGSource,
  type RAGChunk,
} from '@/lib/prompts';
import { retrieveForRAG, type RetrievedChunkFull } from '@/lib/retrieve';

/* ─────────── 时辰清单 ─────────── */
const SHICHEN_LIST = ['卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时'];

/* ─────────── 请求体类型 ─────────── */
interface GenerateDayRequest {
  role: string;
  location: string;
  dynasty: string;
  identityDescription?: string;
  /** 每次检索返回的片段数，默认 2 */
  topKPerSlot?: number;
}

/* ─────────── 返回的活动类型 ─────────── */
export interface GeneratedActivity {
  time: string;
  title: string;
  description: string;
  source: string;
  modern: string;
  originalText?: string;
  chapter?: string;
  sourceChunkIds?: string[];
}

export interface GenerateDayResponse {
  role: string;
  title: string;
  activities: GeneratedActivity[];
  /** 每个活动引用的原文片段（活动 → 片段） */
  sources: RAGSource[];
  /** 实际检索到的所有原文片段（去重、按相关度排序） */
  retrievedChunks: RAGChunk[];
  /** 调试信息：检索统计 */
  meta?: {
    retrievalSuccess: number;
    retrievalTotal: number;
    uniqueChunks: number;
  };
}

/* ─────────── POST ─────────── */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateDayRequest = await request.json();

    if (!body.role || !body.location || !body.dynasty) {
      return NextResponse.json(
        { error: '缺少必填参数：role, location, dynasty' },
        { status: 400 },
      );
    }

    const topKPerSlot = body.topKPerSlot ?? 2;

    /* ════════════════════════════════════════════════════════════
       Step 1: 多角度并行检索 —— 每个时辰一个 query
       ════════════════════════════════════════════════════════════ */
    console.log(
      `[generate-day] RAG 开始：role=${body.role}, location=${body.location}, topK=${topKPerSlot}/slot`,
    );

    const retrievalResults = await Promise.allSettled(
      SHICHEN_LIST.map((time) =>
        retrieveForRAG(
          { role: body.role, location: body.location, time },
          topKPerSlot,
        ).then((chunks) => ({ time, chunks })),
      ),
    );

    /* ════════════════════════════════════════════════════════════
       Step 2: 合并去重 —— 同一片段被多个时辰命中时保留最高分
       ════════════════════════════════════════════════════════════ */
    const chunkMap = new Map<string, RetrievedChunkFull>();
    let retrievalSuccess = 0;

    retrievalResults.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        retrievalSuccess++;
        result.value.chunks.forEach((c) => {
          const existing = chunkMap.get(c.id);
          if (!existing || existing.score < c.score) {
            chunkMap.set(c.id, c);
          }
        });
      } else {
        console.warn(
          `[generate-day] 时辰 ${SHICHEN_LIST[idx]} 检索失败：${result.reason}`,
        );
      }
    });

    const allChunks = Array.from(chunkMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 16);

    console.log(
      `[generate-day] RAG 检索完成：成功 ${retrievalSuccess}/${SHICHEN_LIST.length} 个时辰，去重后 ${allChunks.length} 个片段`,
    );

    /* ════════════════════════════════════════════════════════════
       Step 3: 构建 context 文本
       ════════════════════════════════════════════════════════════ */
    const context = buildRAGContext(allChunks);

    /* ════════════════════════════════════════════════════════════
       Step 4: 调用 LLM，context 注入 user prompt
       ════════════════════════════════════════════════════════════ */
    const userPrompt = buildGenerateDayUserPrompt({
      role: body.role,
      location: body.location,
      dynasty: body.dynasty,
      context,
    });

    const completion = await openai.chat.completions.create({
      model: MODELS.BALANCED,
      messages: [
        { role: 'system', content: GENERATE_DAY_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('AI 返回内容为空');

    // 解析 JSON
    let jsonStr = raw.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (jsonBlockMatch) jsonStr = jsonBlockMatch[1].trim();
    const firstBrace = jsonStr.search(/[\[{]/);
    if (firstBrace > 0) jsonStr = jsonStr.slice(firstBrace);
    const parsed = JSON.parse(jsonStr);

    const rawActivities: any[] = Array.isArray(parsed)
      ? parsed
      : parsed.activities ?? [];

    if (!Array.isArray(rawActivities) || rawActivities.length !== 8) {
      throw new Error(
        `AI 返回的数据不符合预期：期望 8 个活动，收到 ${rawActivities.length}`,
      );
    }

    /* ════════════════════════════════════════════════════════════
       Step 5: 验证 sourceChunkIds，过滤幻觉引用
       ════════════════════════════════════════════════════════════ */
    const validChunkIds = new Set(allChunks.map((c) => c.id));
    const chunkMapById = new Map(allChunks.map((c) => [c.id, c]));

    const activities: GeneratedActivity[] = rawActivities.map((a) => {
      // 容错：sourceChunkIds 可能是字符串或数组
      let chunkIds: string[] = [];
      if (Array.isArray(a.sourceChunkIds)) {
        chunkIds = a.sourceChunkIds.filter(
          (id: unknown) => typeof id === 'string' && validChunkIds.has(id),
        );
      }
      const hallucinated = Array.isArray(a.sourceChunkIds)
        ? a.sourceChunkIds.filter(
            (id: unknown) => typeof id === 'string' && !validChunkIds.has(id),
          )
        : [];
      if (hallucinated.length > 0) {
        console.warn(
          `[generate-day] 时辰 ${a.time} 引用了无效片段：${hallucinated.join(', ')}`,
        );
      }

      return {
        time: a.time,
        title: a.title,
        description: a.description,
        source: a.source,
        modern: a.modern,
        originalText: a.originalText,
        chapter: a.chapter,
        sourceChunkIds: chunkIds,
      };
    });

    /* ════════════════════════════════════════════════════════════
       Step 6: 构建 sources（活动→片段映射表）
       ════════════════════════════════════════════════════════════ */
    const sources: RAGSource[] = [];
    activities.forEach((act, idx) => {
      (act.sourceChunkIds || []).forEach((cid) => {
        const chunk = chunkMapById.get(cid);
        if (chunk) {
          sources.push({
            activityIndex: idx,
            time: act.time,
            chunkId: cid,
            excerpt:
              chunk.content.slice(0, 100) +
              (chunk.content.length > 100 ? '…' : ''),
            relevance: chunk.score,
          });
        }
      });
    });

    /* ════════════════════════════════════════════════════════════
       Step 7: 构建 retrievedChunks
       ════════════════════════════════════════════════════════════ */
    const retrievedChunks: RAGChunk[] = allChunks.map((c) => ({
      id: c.id,
      content: c.content,
      score: c.score,
      knowledge: c.knowledge,
    }));

    /* ════════════════════════════════════════════════════════════
       Step 8: 返回完整 RAG 结果
       ════════════════════════════════════════════════════════════ */
    const responseBody: GenerateDayResponse = {
      role: body.role,
      title: `一位${body.role.replace('北宋', '').replace('外地', '')}的${body.location}一日`,
      activities,
      sources,
      retrievedChunks,
      meta: {
        retrievalSuccess,
        retrievalTotal: SHICHEN_LIST.length,
        uniqueChunks: allChunks.length,
      },
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '服务器内部错误';
    console.error('[generate-day]', message);

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
