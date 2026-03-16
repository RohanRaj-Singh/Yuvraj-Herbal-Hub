import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const buildDir = path.join(publicDir, 'build');

const imageExtensions = new Set([
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
]);

if (!fs.existsSync(buildDir)) {
  process.exit(0);
}

for (const entry of fs.readdirSync(buildDir, { withFileTypes: true })) {
  if (!entry.isFile()) {
    continue;
  }

  const ext = path.extname(entry.name).toLowerCase();
  if (!imageExtensions.has(ext)) {
    continue;
  }

  const sourcePath = path.join(buildDir, entry.name);
  const targetPath = path.join(publicDir, entry.name);

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
    continue;
  }

  const sourceStat = fs.statSync(sourcePath);
  const targetStat = fs.statSync(targetPath);

  if (sourceStat.mtimeMs > targetStat.mtimeMs) {
    fs.copyFileSync(sourcePath, targetPath);
  }
}
