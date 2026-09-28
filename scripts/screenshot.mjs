/**
 * Batch-generate first-screen screenshots for every artifact in public/artifacts/.
 * Supports both top-level single files (foo.html) and subfolder artifacts
 * (foo/index.html) — the screenshot lands at the mirrored path:
 *   public/artifacts/foo/index.html  →  src/assets/images/shots/foo/index.png
 *
 * Usage:
 *   npm run screenshots            # all artifacts
 *   npm run screenshots -- foo bar # only paths starting with "foo"
 *
 * Output paths are referenced from shot frontmatter as
 * `~/assets/images/shots/<name>.png`.
 */
import { chromium } from 'playwright';
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(root, 'public', 'artifacts');
const outDir = path.join(root, 'src', 'assets', 'images', 'shots');

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

const browser = await chromium.launch();

for (const rel of targets) {
  const name = rel.replace(/\.html$/i, '').replaceAll('\\', '/');
  const out = path.join(outDir, `${name}.png`);
  mkdirSync(path.dirname(out), { recursive: true });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  await page.goto('file://' + path.join(srcDir, rel), { waitUntil: 'networkidle' });
  // Give entrance animations / fonts / canvas init a moment to settle.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: out });
  await page.close();

  console.log(`✓ ${name}.png`);
}

await browser.close();
console.log(`\n${targets.length} screenshot(s) saved to ${path.relative(root, outDir)}`);
