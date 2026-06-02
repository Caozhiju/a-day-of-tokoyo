const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const done = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tokyo_knowledge.json'), 'utf-8'));
const doneIds = new Set(done.map(x => x.id));
const allChunks = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tokyo_chunks.json'), 'utf-8'));
const missing = allChunks.filter(c => !doneIds.has(c.id));
console.log(`缺失 ${missing.length} 段`);
if (missing.length === 0) { console.log('✅ 全部完成'); process.exit(0); }

const results = [...done];
const SYSTEM = '你是宋代文献分析专家。提取结构化知识。字段：place, character, activity, food, festival, commerce。无则空数组。输出JSON数组。';

async function run() {
  for (let i = 0; i < missing.length; i += 2) {
    const batch = missing.slice(i, i + 2);
    const user = batch.map((c, j) => `【${j + 1}】${c.content.slice(0, 400)}`).join('\n\n');
    try {
      const comp = await openai.chat.completions.create({ model: 'qwen/qwen3-next-80b-a3b-instruct', messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], temperature: 0.05, timeout: 30000 });
      let s = (comp.choices[0]?.message?.content || '').trim();
      const m = s.match(/```json\s*([\s\S]*?)```/);
      if (m) s = m[1].trim();
      const fi = s.indexOf('['), li = s.lastIndexOf(']');
      if (fi >= 0 && li > fi) s = s.slice(fi, li + 1);
      const arr = Array.isArray(JSON.parse(s)) ? JSON.parse(s) : [JSON.parse(s)];
      arr.forEach((item, idx) => { if (idx < batch.length) results.push({ id: batch[idx].id, content: batch[idx].content.slice(0, 60), place: item.place || [], character: item.character || [], activity: item.activity || [], food: item.food || [], festival: item.festival || [], commerce: item.commerce || [] }); });
      console.log(`✅ ${batch.map(b => b.id).join(', ')}`);
    } catch (e) { console.log(`❌ ${batch.map(b => b.id).join(', ')}: ${e.message.slice(0, 50)}`); }
  }
  fs.writeFileSync(path.join(__dirname, '..', 'tokyo_knowledge.json'), JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n最终: ${results.length} 条`);
}
run();
