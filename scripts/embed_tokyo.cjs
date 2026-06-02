const fs = require('fs');
const https = require('https');
const path = require('path');

const API_KEY = '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';
const MODEL = 'nvidia/nv-embedqa-e5-v5';
const BATCH = 3;  // smaller batch for reliability

const INPUT_KNOWLEDGE = path.join(__dirname, '..', 'tokyo_knowledge.json');
const INPUT_CHUNKS = path.join(__dirname, '..', 'tokyo_chunks.json');
const OUTPUT = path.join(__dirname, '..', 'tokyo_embeddings.json');
const TEMP = path.join(__dirname, '..', 'tokyo_embeddings.tmp.json');

function embedBatch(texts) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ input: texts, model: MODEL, input_type: 'passage' });
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 60000,
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(body).data); }
          catch (e) { reject(new Error('JSON parse error')); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 100)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

async function embedWithRetry(texts, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try { return await embedBatch(texts); }
    catch (err) {
      if (i < retries) {
        const wait = 5000 * (i + 1);
        await new Promise(r => setTimeout(r, wait));
      } else { throw err; }
    }
  }
}

async function main() {
  const knowledge = JSON.parse(fs.readFileSync(INPUT_KNOWLEDGE, 'utf-8'));
  const chunks = JSON.parse(fs.readFileSync(INPUT_CHUNKS, 'utf-8'));
  const chunkMap = new Map(chunks.map(c => [c.id, c]));

  console.log(`📖 ${knowledge.length} 个知识条目，使用完整文本嵌入`);

  const resume = process.argv.includes('--resume');
  let results = [];
  if (resume && fs.existsSync(TEMP)) {
    results = JSON.parse(fs.readFileSync(TEMP, 'utf-8'));
    console.log(`📂 续写，已有 ${results.length} 条`);
  } else if (resume && fs.existsSync(OUTPUT)) {
    results = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
    console.log(`📂 续写，已有 ${results.length} 条`);
  }

  const doneIds = new Set(results.map(r => r.id));
  const pending = knowledge.filter(c => !doneIds.has(c.id));
  console.log(`⏳ 待处理 ${pending.length} 条`);

  if (pending.length === 0) {
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf-8');
    console.log('✅ 全部完成');
    return;
  }

  const totalBatches = Math.ceil(pending.length / BATCH);
  let processed = results.length;

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;

    // 使用完整文本（取 content 前 800 字即可用于检索）
    const texts = batch.map(k => {
      const full = chunkMap.get(k.id);
      return (full?.content || k.content || '').slice(0, 800);
    });

    process.stdout.write(`[${batchNum}/${totalBatches}] ${processed + 1}-${processed + batch.length}... `);

    try {
      const embData = await embedWithRetry(texts);
      embData.forEach((item, idx) => {
        if (idx < batch.length) {
          results.push({ id: batch[idx].id, vector: item.embedding });
          processed++;
        }
      });
      console.log('✅');
    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 50)}`);
      fs.writeFileSync(TEMP, JSON.stringify(results, null, 2), 'utf-8');
      console.log(`💾 已保存 ${results.length} 条，用 --resume 继续`);
      process.exit(1);
    }

    // 短暂延迟防止速率限制
    await new Promise(r => setTimeout(r, 1000));

    if (batchNum % 50 === 0) {
      fs.writeFileSync(TEMP, JSON.stringify(results, null, 2), 'utf-8');
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n✅ 完成！共 ${results.length} 条 → ${OUTPUT}`);
  if (fs.existsSync(TEMP)) fs.unlinkSync(TEMP);
}

main().catch(console.error);
