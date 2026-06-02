/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 确保 Vercel 部署时包含知识库数据文件
  //（否则动态 fs.readFile 无法在 Serverless 函数中找到这些文件）
  experimental: {
    outputFileTracingIncludes: {
      '/api/retrieve': [
        './tokyo_embeddings.bin',
        './tokyo_chunks.json',
        './tokyo_knowledge.json',
      ],
    },
  },
}

module.exports = nextConfig
