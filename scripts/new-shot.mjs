/**
 * Scaffold a new shot entry: `npm run new -- <slug> "作品标题"`
 *
 * Creates src/data/shot/<slug>.md with TODO placeholders, formats it with
 * Prettier (CI runs prettier --check on it — this is the step that's easy to
 * forget), and prints the remaining manual steps.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [slug, ...titleParts] = process.argv.slice(2);

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('用法: npm run new -- <slug> "作品标题"   (slug 用小写字母/数字/连字符,如 shape-factory)');
  process.exit(1);
}

const outFile = path.join(root, 'src', 'data', 'shot', `${slug}.md`);
if (fs.existsSync(outFile)) {
  console.error(`已存在: ${outFile}`);
  process.exit(1);
}

const title = titleParts.join(' ') || '作品标题';
const today = new Date().toISOString().slice(0, 10);

const content = `---
publishDate: ${today}T12:00:00Z
title: ${title}
excerpt: 一句话介绍
prompt: |
  TODO: 粘贴开场那条用户原文(原样,一字不改)
mode: one-shot
harness: ZCode
model: GLM-5.3-Flash
turns: 1
html: ${slug}.html
image: '~/assets/images/shots/${slug}.png'
tags: []
featured: false
---

TODO: 备注(生成细节、人工改动说明等,可留空)。

多轮 vibe 时把 mode 改成 vibe,补上 vibe / outcome,并按顺序写 session(role: user | agent)。
turns 记用户开口次数。harness 和 model 不知道就删掉这两行。
`;

fs.writeFileSync(outFile, content);
// Invoke the local Prettier bin directly — spawning `npx` from a nested
// script hangs/fails on Windows.
execFileSync(
  process.execPath,
  [path.join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs'), '--write', path.relative(root, outFile)],
  { cwd: root, stdio: 'inherit' }
);

console.log(`✓ 已创建 ${path.relative(root, outFile)}`);
console.log(`
接下来:
1. 产物放到 public/artifacts/${slug}.html(多文件则 ${slug}/index.html 并改 frontmatter 的 html)
2. 把 TODO 换成真实内容:title / excerpt / prompt / model / tags / 备注
3. npm run screenshots -- ${slug}   生成封面(有动画加 video: true 和 videoKey)
4. npm run audit -- ${slug}          (可选)跑 Lighthouse 分数
5. npm run dev 自测,确认后提交`);
