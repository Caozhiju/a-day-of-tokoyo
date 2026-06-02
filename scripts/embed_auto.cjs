const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPT = path.join(__dirname, 'embed_tokyo.cjs');
const TEMP = path.join(__dirname, '..', 'tokyo_embeddings.tmp.json');
const OUTPUT = path.join(__dirname, '..', 'tokyo_embeddings.json');

let attempts = 0;

function getCount() {
  try { return JSON.parse(fs.readFileSync(OUTPUT, 'utf-8')).length; } catch(e) {}
  try { return JSON.parse(fs.readFileSync(TEMP, 'utf-8')).length; } catch(e) {}
  return 0;
}

function run() {
  return new Promise((resolve) => {
    const proc = spawn('node', [SCRIPT, '--resume'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => out += d.toString());
    proc.on('close', (code) => {
      resolve({ code, out });
    });
  });
}

async function main() {
  let count = getCount();
  console.log(`起始: ${count}/1182`);

  while (count < 1182) {
    attempts++;
    const { code, out } = await run();
    count = getCount();
    console.log(`[${attempts}] code=${code} | ${count}/1182 (${Math.round(count/1182*100)}%)`);

    if (count >= 1182) break;

    // 找到错误原因
    const errLine = out.split('\n').filter(l => l.includes('❌'));
    if (errLine.length > 0) console.log('  原因:', errLine[0].slice(0, 80));

    // 暂停 2 秒后重试
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`✅ 完成! 共 ${count} 条`);
  process.exit(0);
}

main().catch(console.error);
