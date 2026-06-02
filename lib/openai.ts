import OpenAI from 'openai';

/**
 * OpenAI 客户端实例（兼容 NVIDIA API）
 *
 * - 从环境变量 OPENAI_API_KEY 读取 API 密钥
 * - 从环境变量 OPENAI_BASE_URL 读取 API 地址（默认为 OpenAI 官方）
 * - 仅在服务端使用，不会暴露给前端
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
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
