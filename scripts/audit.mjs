/**
 * Run Lighthouse against every artifact (served over HTTP from public/) and
 * commit the four category scores to src/data/shot-metrics/<slug>.json, which
 * the shot detail page renders in the 生成信息 area.
 *
 * Usage: npm run audit            # all artifacts
 *        npm run audit -- foo bar # only paths starting with "foo"
 *
 * Chrome is reused from the Playwright installation (no separate download).
 */
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import http from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// MUST be async: the static server lives in THIS process's event loop, and a
// synchronous spawn would block it — Lighthouse's page requests could never
// be answered and every run would time out.
const run = promisify(execFile);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(root, 'public', 'artifacts');
const outDir = path.join(root, 'src', 'data', 'shot-metrics');
const CATEGORIES = 'performance,accessibility,best-practices,seo';

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

const only = process.argv.slice(2);
const files = walk(srcDir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => path.relative(srcDir, f));
const targets = only.length ? files.filter((f) => only.some((o) => f.replaceAll('\\', '/').startsWith(o))) : files;

if (targets.length === 0) {
  console.error('No artifact HTML files matched in public/artifacts/.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(srcDir, rel);
  try {
    const data = readFileSync(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

// Lighthouse launches its own Chrome via chrome-launcher; CHROME_PATH points
// it at the Playwright-installed Chromium (no separate download). On Windows
// chrome-launcher often dies with EPERM while cleaning its temp dir AFTER the
// run — the report is already written by then, so success is judged by the
// report file existing, not the exit code.
const chromePath = chromium.executablePath();
mkdirSync(outDir, { recursive: true });
const tmpReport = path.join(mkdtempSync(path.join(root, '.lh-')), 'report.json');

const slugOf = (relPosix) => relPosix.replace(/\.html$/i, '').split('/')[0];

for (const rel of targets) {
  const relPosix = rel.replaceAll('\\', '/');
  const slug = slugOf(relPosix);
  rmSync(tmpReport, { force: true });

  const result = await run(
    process.execPath,
    [
      path.join(root, 'node_modules', 'lighthouse', 'cli', 'index.js'),
      `${origin}/${relPosix}`,
      '--output=json',
      `--output-path=${tmpReport}`,
      `--only-categories=${CATEGORIES}`,
      '--chrome-flags=--headless=new',
      '--quiet',
    ],
    {
      cwd: root,
      env: { ...process.env, CHROME_PATH: chromePath },
      maxBuffer: 1e9,
      timeout: 180000,
    }
  ).catch((e) => ({ status: null, stdout: '', stderr: String(e.message) }));

  if (!existsSync(tmpReport)) {
    console.error(
      `✗ ${slug}: Lighthouse failed — no report written (status ${result.status}, error ${result.error})\nSTDOUT: ${String(result.stdout).slice(-500)}\nSTDERR: ${String(result.stderr).slice(-500)}`
    );
    continue;
  }

  const report = JSON.parse(readFileSync(tmpReport, 'utf8'));
  const cat = report.categories;
  const scores = {
    performance: Math.round(cat.performance.score * 100),
    accessibility: Math.round(cat.accessibility.score * 100),
    bestPractices: Math.round(cat['best-practices'].score * 100),
    seo: Math.round(cat.seo.score * 100),
  };
  writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(scores, null, 2) + '\n');
  console.log(`✓ ${slug}: P${scores.performance} A${scores.accessibility} BP${scores.bestPractices} SEO${scores.seo}`);
}

server.close();
console.log(`\nScores saved to ${path.relative(root, outDir)}`);
