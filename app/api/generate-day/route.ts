import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import { GENERATE_DAY_SYSTEM, buildGenerateDayUserPrompt } from '@/lib/prompts';

/* ─────────── 请求体类型 ─────────── */
interface GenerateDayRequest {
  role: string;                // 身份，如 "北宋书生"
  location: string;            // 地点，如 "东京城"
  dynasty: string;             // 朝代，如 "北宋"
  identityDescription?: string; // 身份描述（可选）
}

/* ─────────── 返回的活动类型 ─────────── */
/** AI 原始返回的单条活动格式 */
interface RawActivity {
  time: string;
  title: string;
  description: string;
  source: string;
  modern: string;
}

export interface GeneratedActivity {
  time: string;
  title: string;
  description: string;
  source: string;
  modern: string;
}

export interface GenerateDayResponse {
  role: string;
  title: string;
  activities: GeneratedActivity[];
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

    const userPrompt = buildGenerateDayUserPrompt({
      role: body.role,
      location: body.location,
      dynasty: body.dynasty,
      identityDescription: body.identityDescription,
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

    // 提取 JSON（兼容 markdown 包裹、代码块等意外格式）
    let jsonStr = raw.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }
    // 尝试找到第一个 [ 或 { 并截取
    const firstBracket = jsonStr.search(/[[{]/);
    if (firstBracket > 0) jsonStr = jsonStr.slice(firstBracket);
    const parsed = JSON.parse(jsonStr);
    const rawActivities: RawActivity[] = Array.isArray(parsed)
      ? parsed
      : parsed.activities ?? parsed;

    if (!Array.isArray(rawActivities) || rawActivities.length !== 8) {
      throw new Error(`AI 返回的数据不符合预期：期望 8 个活动，收到 ${rawActivities.length}`);
    }

    const activities: GeneratedActivity[] = rawActivities.map((a) => ({
      time: a.time,
      title: a.title,
      description: a.description,
      source: a.source,
      modern: a.modern,
    }));

    const responseBody: GenerateDayResponse = {
      role: body.role,
      title: `一位${body.role.replace('北宋', '').replace('外地', '')}的${body.location}一日`,
      activities,
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
