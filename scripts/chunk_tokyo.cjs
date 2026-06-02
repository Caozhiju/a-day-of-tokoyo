const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'clean_tokyo.txt');
const OUTPUT = path.join(__dirname, '..', 'tokyo_chunks.json');
const CHUNK_SIZE = 500;

const raw = fs.readFileSync(INPUT, 'utf-8');
console.log(`📖 读取：${INPUT}`);
console.log(`   大小：${raw.length} 字符`);

const chunks = [];
let start = 0;
let idx = 1;

while (start < raw.length) {
  let end = start + CHUNK_SIZE;

  if (end >= raw.length) {
    end = raw.length;
  } else {
    // 尝试在段落边界断开
    let cut = raw.lastIndexOf('\n', end);
    if (cut > start + CHUNK_SIZE / 2) {
      end = cut;
    } else {
      // 尝试在句号处断开
      cut = raw.lastIndexOf('。', end);
      if (cut > start + CHUNK_SIZE / 2) {
        end = cut + 1;
      }
    }
  }

  const content = raw.slice(start, end).trim();
  if (content) {
    chunks.push({ id: `chunk_${String(idx).padStart(3, '0')}`, content });
    idx++;
  }
  start = end;
}

fs.writeFileSync(OUTPUT, JSON.stringify(chunks, null, 2), 'utf-8');
console.log(`✂️  切片：${chunks.length} 段（目标 ~${CHUNK_SIZE} 字/段）`);
console.log(`✅ 输出：${OUTPUT}`);
console.log(`   大小：${fs.statSync(OUTPUT).size} 字节`);

// 输出样本
console.log(`\n--- 第 1 段 ---`);
console.log(`id: ${chunks[0].id}`);
console.log(`content 前 60 字：${chunks[0].content.slice(0, 60)}...`);
if (chunks.length > 3) {
  console.log(`\n--- 第 4 段 ---`);
  console.log(`id: ${chunks[3].id}`);
  console.log(`content 前 60 字：${chunks[3].content.slice(0, 60)}...`);
}
console.log(`\n--- 尾段 ---`);
console.log(`id: ${chunks[chunks.length - 1].id}`);
console.log(`content 后 60 字：...${chunks[chunks.length - 1].content.slice(-60)}`);
