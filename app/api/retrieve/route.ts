import { NextRequest, NextResponse } from 'next/server';
import { retrieve } from '@/lib/retrieve';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.role || !body.location || !body.time) {
      return NextResponse.json(
        { error: '缺少必填参数：role, location, time' },
        { status: 400 },
      );
    }

    const results = await retrieve(
      { role: body.role, location: body.location, time: body.time },
      body.topK || 3,
    );

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '服务器内部错误';
    console.error('[retrieve]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
