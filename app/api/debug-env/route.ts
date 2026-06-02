import { NextResponse } from 'next/server';

/**
 * 诊断端点：返回服务端环境变量读取情况（不暴露密钥明文）
 *
 * 访问路径：GET /api/debug-env
 */
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  const mask = (s: string | undefined) => {
    if (!s) return null;
    if (s.length <= 8) return '***';
    return `${s.slice(0, 6)}...${s.slice(-4)} (长度 ${s.length})`;
  };

  const related = Object.keys(process.env)
    .filter((k) => /OPENAI|API|BASE_URL|VERCEL_ENV|NODE_ENV/i.test(k))
    .sort();

  return NextResponse.json({
    OPENAI_API_KEY: {
      exists: Boolean(apiKey),
      preview: mask(apiKey),
    },
    OPENAI_BASE_URL: baseURL || null,
    VERCEL_ENV: process.env.VERCEL_ENV || null,
    NODE_ENV: process.env.NODE_ENV || null,
    VERCEL_REGION: process.env.VERCEL_REGION || null,
    relatedEnvKeys: related,
  });
}
