/**
 * Batch-generate covers for every artifact in public/artifacts/.
 * Supports top-level single files (foo.html) and subfolder artifacts
 * (foo/index.html) — outputs mirror the path:
 *   public/artifacts/foo/index.html  →  src/assets/images/shots/foo/index.png
 *
 * Entries with `video: true` frontmatter additionally get a ~6s looping
 * WebM cover (src/assets/covers/<slug>.webm). The recorder "kicks" the
 * artifact first: presses `videoKey` (e.g. "Enter"/"Space") or clicks the
 * viewport center, so animations/games actually start on camera. Recording
 * happens in a --mute-audio browser instance.
 *
 * Artifacts are served over HTTP (not file://) so Web Audio / fetch-based
 * artifacts behave exactly like on the deployed site.
 *
 * Usage:
 *   npm run screenshots            # all artifacts
 *   npm run screenshots -- foo bar # only paths starting with "foo"
 */
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(root, 'public', 'artifacts');
const outDir = path.join(root, 'src', 'assets', 'images', 'shots');
const coverDir = path.join(root, 'src', 'assets', 'covers');

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

// Frontmatter metadata per artifact: html rel path → { slug, video, videoKey }.
const dataDir = path.join(root, 'src', 'data', 'shot');
const shotMeta = {};
for (const f of readdirSync(dataDir)) {
  if (!f.endsWith('.md')) continue;
  const frontmatter = readFileSync(path.join(dataDir, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!frontmatter) continue;
  const html = frontmatter.match(/^html:\s*["']?(\S+?)["']?\s*$/m)?.[1];
  if (!html) continue;
  shotMeta[html] = {
    slug: f.replace(/\.md$/, ''),
    video: /^video:\s*true/m.test(frontmatter),
    videoKey: frontmatter.match(/^videoKey:\s*["']?(\S+?)["']?\s*$/m)?.[1],
  };
}

const only = process.argv.slice(2);
const files = walk(srcDir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => path.relative(srcDir, f));
const targets = only.length ? files.filter((f) => only.some((o) => f.replaceAll('\\', '/').startsWith(o))) : files;

if (targets.length === 0) {
  console.error('No artifact HTML files matched in public/artifacts/.');
  process.exit(1);
}

// Minimal static server so artifacts run over HTTP (audio analysis, fetch, etc.).
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

const browser = await chromium.launch();
// Separate instance for video entries: recording must not blast audio.
const mutedBrowser = await chromium.launch({ args: ['--mute-audio'] });
const tmpVideoDir = path.join(root, '.playwright-video');
mkdirSync(tmpVideoDir, { recursive: true });
mkdirSync(coverDir, { recursive: true });

let recorded = 0;

for (const rel of targets) {
  const relPosix = rel.replaceAll('\\', '/');
  const name = relPosix.replace(/\.html$/i, '');
  const out = path.join(outDir, `${name}.png`);
  mkdirSync(path.dirname(out), { recursive: true });

  const meta = shotMeta[relPosix] ?? {};
  const url = `${origin}/${relPosix}`;
  const kick = async (page) => {
    if (meta.videoKey) await page.keyboard.press(meta.videoKey);
    else await page.mouse.click(640, 360);
  };

  if (meta.video) {
    const context = await mutedBrowser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: tmpVideoDir, size: { width: 1280, height: 720 } },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await kick(page);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: out });
    const video = page.video();
    await context.close();
    const webmPath = await video.path();
    const webm = path.join(coverDir, `${meta.slug}.webm`);
    rmSync(webm, { force: true });
    renameSync(webmPath, webm);
    recorded += 1;
    console.log(`✓ ${name}.png + ${meta.slug}.webm`);
  } else {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    // Give entrance animations / fonts / canvas init a moment to settle.
    await page.waitForTimeout(1500);
    await page.screenshot({ path: out });
    await page.close();
    console.log(`✓ ${name}.png`);
  }
}

await browser.close();
await mutedBrowser.close();
server.close();
rmSync(tmpVideoDir, { recursive: true, force: true });
console.log(`\n${targets.length} cover(s) saved to ${path.relative(root, outDir)} (${recorded} video)`);
