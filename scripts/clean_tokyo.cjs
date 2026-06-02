/**
 * 东京梦华录 · 文本清洗脚本 (Node.js)
 * 功能：删除空行、连续空格、页码、无意义符号
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', '东京梦华录.txt');
const OUTPUT_FILE = path.join(__dirname, '..', 'clean_tokyo.txt');

function cleanText(text) {
  const lines = text.split('\n');
  const cleaned = [];

  for (let raw of lines) {
    let line = raw.trim();

    // 1. 跳过空行
    if (!line) continue;

    // 2. 删除页码行：纯数字、"— 12 —"、"【12】"、"[12]"、"(12)"、"第12页"
    if (/^[—\-−–\s]*\d+[—\-−–\s]*$/.test(line)) continue;
    if (/^[【\[\(（]\d+[】\]\)）]/.test(line)) continue;
    if (/^第\s*\d+\s*页$/.test(line)) continue;

    // 3. 删除行首行尾装饰符号
    line = line.replace(/^[·◆■●※★☆◎○□△▲▼▽◇◆↑↓→←↔]+/, '').trim();
    line = line.replace(/[·◆■●※★☆◎○□△▲▼▽◇◆↑↓→←↔]+$/, '').trim();

    // 4. 压缩连续空格
    line = line.replace(/ {2,}/g, ' ');

    // 5. 压缩连续句号
    line = line.replace(/。{3,}/g, '。');

    if (!line) continue;
    cleaned.push(line);
  }

  return cleaned.join('\n');
}

// 检查源文件
if (!fs.existsSync(INPUT_FILE)) {
  console.error('❌ 未找到源文件：东京梦华录.txt');
  console.error('   请放在：' + INPUT_FILE);
  process.exit(1);
}

const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
console.log('📖 读取：' + INPUT_FILE);
console.log('   原始大小：' + raw.length + ' 字符');
console.log('   原始行数：' + (raw.match(/\n/g) || []).length + ' 行');

const result = cleanText(raw);

console.log('   清洗后大小：' + result.length + ' 字符');
console.log('   清洗后行数：' + (result.match(/\n/g) || []).length + ' 行');

fs.writeFileSync(OUTPUT_FILE, result, 'utf-8');
console.log('✅ 输出：' + OUTPUT_FILE);
