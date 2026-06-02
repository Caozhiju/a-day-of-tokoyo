import OpenAI from 'openai';

/**
 * OpenAI 客户端实例（兼容 NVIDIA API）
 *
 * - 从环境变量 OPENAI_API_KEY 读取 API 密钥
 * - 从环境变量 OPENAI_BASE_URL 读取 API 地址（默认为 OpenAI 官方）
 * - 仅在服务端使用，不会暴露给前端
 *
 * 注意：使用 Proxy 延迟实例化，避免在 Vercel 构建阶段（"Collecting page data"）
 * 触发 OpenAI SDK 6.x 的 API key 强制校验而构建失败。
 * 真正调用 API 时才读取环境变量。
 */

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return _client;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/**
 * 可用的模型列表
 *
 * 当前配置：NVIDIA 托管的 Qwen3.5-125B
 */
export const MODELS = {
  FAST: 'qwen/qwen3-next-80b-a3b-instruct',
  BALANCED: 'qwen/qwen3-next-80b-a3b-instruct',
  HIGH_QUALITY: 'qwen/qwen3-next-80b-a3b-instruct',
} as const;

export type ModelTier = keyof typeof MODELS;
