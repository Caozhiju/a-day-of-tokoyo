const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

/* ════════════════════════════════════════════════════════════
   知识提取脚本
   读取 tokyo_chunks.json → LLM 提取结构化信息 → tokyo_knowledge.json
   用法：node scripts/extract_knowledge.cjs
        node scripts/extract_knowledge.cjs --resume
   ════════════════════════════════════════════════════════════ */

const INPUT = path.join(__dirname, '..', 'tokyo_chunks.json');
const OUTPUT = path.join(__dirname, '..', 'tokyo_knowledge.json');
const TEMP = path.join(__dirname, '..', 'tokyo_knowledge.tmp.json');
const BATCH = 3;
const MODEL = 'qwen/qwen3-next-80b-a3b-instruct';

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const m = line.match(/^\s*(\w+)\s*=\s*(.+?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/["']/g, '');
    }
  }
  for (const k of ['OPENAI_API_KEY', 'OPENAI_BASE_URL']) {
    if (process.env[k]) env[k] = process.env[k];
  }
  return env;
}

const SYSTEM = `你是宋代文献分析专家。你的任务是从《东京梦华录》文本片段中提取结构化知识。

对于每个标注了【片段N】的文本，输出一个对应的JSON对象，包含以下字段（没有则空数组）：
- place: 出现的地点、场所、街巷、建筑名称
- character: 出现的人物、身份、群体名称
- activity: 出现的活动、事件、行为
- food: 出现的饮食、食材、饮品
- festival: 出现的节庆、仪式、祭祀
- commerce: 出现的商业、经济、交易相关内容

规则：
1. 输出必须是JSON数组，数组元素个数必须与输入片段数一致
2. 只提取原文确实提及的内容，不杜撰
3. 使用中文原词
4. 直接输出JSON，不要任何代码块、说明文字`;

function buildUserPrompt(chunks) {
  return chunks.map((c, i) =>
    `【片段${i + 1}】\n${c.content.slice(0, 600)}`
  ).join('\n\n---\n\n');
}

function extractJSON(raw) {
  let s = raw.trim();
  const m = s.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (m) s = m[1].trim();
  const first = s.indexOf('[');
  const last = s.lastIndexOf(']');
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  const parsed = JSON.parse(s);
  return Array.isArray(parsed) ? parsed : [parsed];
}

async function main() {
  const env = loadEnv();
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ 请在 .env.local 中配置 OPENAI_API_KEY');
    process.exit(1);
  }

  const resume = process.argv.includes('--resume');
  let results = [];

  if (resume && fs.existsSync(OUTPUT)) {
    results = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
    console.log(`📂 续写，已有 ${results.length} 条`);
  } else if (resume && fs.existsSync(TEMP)) {
    results = JSON.parse(fs.readFileSync(TEMP, 'utf-8'));
    console.log(`📂 续写（临时文件），已有 ${results.length} 条`);
  }

  const allChunks = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
  console.log(`📖 共 ${allChunks.length} 个片段`);

  const done = new Set(results.map(r => r.id));
  const pending = allChunks.filter(c => !done.has(c.id));
  console.log(`⏳ 待处理 ${pending.length} 个`);

  if (pending.length === 0) {
    console.log('✅ 全部完成');
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf-8');
    return;
  }

  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL || undefined,
  });

  const totalBatches = Math.ceil(pending.length / BATCH);
  let batchIdx = 0;

  for (let i = 0; i < pending.length; i += BATCH) {
    batchIdx++;
    const batch = pending.slice(i, i + BATCH);

    process.stdout.write(
      `[${batchIdx}/${totalBatches}] ${results.length + 1}-${results.length + batch.length}... `
    );

    try {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: buildUserPrompt(batch) },
        ],
        temperature: 0.05,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error('空响应');

      const extracted = extractJSON(raw);

      extracted.forEach((item, idx) => {
        if (idx < batch.length) {
          results.push({
            id: batch[idx].id,
            content: batch[idx].content.slice(0, 60),
            place: item.place || [],
            character: item.character || [],
            activity: item.activity || [],
            food: item.food || [],
            festival: item.festival || [],
            commerce: item.commerce || [],
          });
        }
      });

      console.log('✅');

      if (batchIdx % 20 === 0) {
        fs.writeFileSync(TEMP, JSON.stringify(results, null, 2), 'utf-8');
      }

    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 60)}`);
      fs.writeFileSync(TEMP, JSON.stringify(results, null, 2), 'utf-8');
      console.log(`💾 已保存 ${results.length} 条，使用 --resume 继续`);
      process.exit(1);
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n✅ 完成！共 ${results.length} 条 → ${OUTPUT}`);
  if (fs.existsSync(TEMP)) fs.unlinkSync(TEMP);
}

main().catch(console.error);
