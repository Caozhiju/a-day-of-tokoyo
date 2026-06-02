const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const OPENAI_API_KEY = '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';
const OPENAI_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const BATCH = 3;

const allChunks = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tokyo_chunks.json'), 'utf-8'));
const done = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tokyo_knowledge.json'), 'utf-8'));
const doneIds = new Set(done.map(x => x.id));
const missing = allChunks.filter(c => !doneIds.has(c.id));

console.log(`共 ${allChunks.length} 段，已有 ${done.length} 段，缺失 ${missing.length} 段`);

if (missing.length === 0) { console.log('✅ 全部完成！'); process.exit(0); }

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, baseURL: OPENAI_BASE_URL });
const results = [...done];

const SYSTEM = '你是宋代文献分析专家。从《东京梦华录》片段中提取结构化信息。\n\n对于每个【片段N】，输出对应JSON对象。\n字段：place(地点), character(人物), activity(活动), food(饮食), festival(节庆), commerce(商业)。无则空数组。\n\n输出JSON数组，数组长度等于输入片段数。纯JSON无说明。';

async function run() {
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    const user = batch.map((c, j) => `【片段${j + 1}】\n${c.content.slice(0, 600)}`).join('\n\n---\n\n');
    process.stdout.write(`[${Math.floor(i / BATCH) + 1}/${Math.ceil(missing.length / BATCH)}] ${results.length}-${results.length + batch.length}... `);

    try {
      const comp = await openai.chat.completions.create({ model: 'qwen/qwen3-next-80b-a3b-instruct', messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], temperature: 0.05 });
      let raw = comp.choices[0]?.message?.content || '';
      let s = raw.trim();
      const m = s.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
      if (m) s = m[1].trim();
      const fi = s.indexOf('['), li = s.lastIndexOf(']');
      if (fi >= 0 && li > fi) s = s.slice(fi, li + 1);
      const extracted = JSON.parse(s);
      const arr = Array.isArray(extracted) ? extracted : [extracted];
      arr.forEach((item, idx) => {
        if (idx < batch.length) results.push({ id: batch[idx].id, content: batch[idx].content.slice(0, 60), place: item.place || [], character: item.character || [], activity: item.activity || [], food: item.food || [], festival: item.festival || [], commerce: item.commerce || [] });
      });
      console.log('✅');
    } catch (e) {
      console.log('❌', e.message.slice(0, 60));
    }

    if (i % 30 === 0) fs.writeFileSync(path.join(__dirname, '..', 'tokyo_knowledge.json'), JSON.stringify(results, null, 2), 'utf-8');
  }

  fs.writeFileSync(path.join(__dirname, '..', 'tokyo_knowledge.json'), JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n✅ 最终完成！共 ${results.length} 条 → tokyo_knowledge.json`);
}

run().catch(console.error);
