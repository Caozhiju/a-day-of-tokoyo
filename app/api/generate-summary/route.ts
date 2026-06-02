import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import { CIVILIZATION_SUMMARY_SYSTEM, buildCivilizationSummaryUserPrompt } from '@/lib/prompts';

/* ─────────── 请求体类型 ─────────── */
interface GenerateSummaryRequest {
  activities: {
    time: string;
    title: string;
    description: string;
    modern: string;
  }[];
}

/* ─────────── 返回类型 ─────────── */
export interface CivilizationSummaryResponse {
  title: string;
  summary: string;
  keyword: string[];
}

/* ─────────── POST ─────────── */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateSummaryRequest = await request.json();

    if (!body.activities || !Array.isArray(body.activities) || body.activities.length === 0) {
      return NextResponse.json(
        { error: '缺少必填参数：activities' },
        { status: 400 },
      );
    }

    const userPrompt = buildCivilizationSummaryUserPrompt(body.activities);

    const completion = await openai.chat.completions.create({
      model: MODELS.FAST,
      messages: [
        { role: 'system', content: CIVILIZATION_SUMMARY_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('AI 返回内容为空');

    // 提取 JSON（兼容 markdown 包裹）
    let jsonStr = raw.trim();
    const blockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (blockMatch) jsonStr = blockMatch[1].trim();
    const firstBrace = jsonStr.search(/{/);
    if (firstBrace > 0) jsonStr = jsonStr.slice(firstBrace);

    const parsed = JSON.parse(jsonStr);

    const responseBody: CivilizationSummaryResponse = {
      title: parsed.title || '日常即传承',
      summary: parsed.summary || parsed.content || '',
      keyword: parsed.keyword || parsed.keywords || [],
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '服务器内部错误';
    console.error('[generate-summary]', message);

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
