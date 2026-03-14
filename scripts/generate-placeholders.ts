/**
 * Generates procedural fat-pixel splatter paintings as recipe placeholder images.
 * Seeded by slug for deterministic output. 90s BASIC aesthetic.
 *
 * Usage: npx tsx scripts/generate-placeholders.ts
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';

const WIDTH = 400;
const HEIGHT = 300;
const PIXEL_SIZE = 8; // fat pixels

const PALETTE = [
  [238, 108, 77],   // hot
  [224, 251, 252],   // sky
  [152, 193, 217],   // lake
  [61, 90, 128],     // ocean
  [41, 50, 65],      // black
  [32, 95, 30],      // green
  [47, 170, 43],     // green-light
  [226, 191, 182],   // hot-light
  [203, 224, 236],   // lake-light
  [107, 140, 184],   // ocean-light
];

// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return hash;
}

async function generatePlaceholder(slug: string, outDir: string) {
  const rand = mulberry32(hashString(slug));
  const cols = Math.floor(WIDTH / PIXEL_SIZE);
  const rows = Math.floor(HEIGHT / PIXEL_SIZE);

  // Create raw pixel buffer at fat-pixel resolution
  const pixels = Buffer.alloc(cols * rows * 3);

  // Background: dark base
  const bg = PALETTE[4]; // black
  for (let i = 0; i < cols * rows; i++) {
    pixels[i * 3] = bg[0];
    pixels[i * 3 + 1] = bg[1];
    pixels[i * 3 + 2] = bg[2];
  }

  // Splatter: random blobs of color
  const numSplatters = 15 + Math.floor(rand() * 25);
  for (let s = 0; s < numSplatters; s++) {
    const color = PALETTE[Math.floor(rand() * PALETTE.length)];
    const cx = Math.floor(rand() * cols);
    const cy = Math.floor(rand() * rows);
    const radius = 2 + Math.floor(rand() * 8);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius * (0.5 + rand() * 0.5)) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
        const idx = (y * cols + x) * 3;
        pixels[idx] = color[0];
        pixels[idx + 1] = color[1];
        pixels[idx + 2] = color[2];
      }
    }
  }

  // Scale up to full resolution using nearest-neighbor (fat pixels)
  const image = sharp(pixels, { raw: { width: cols, height: rows, channels: 3 } })
    .resize(WIDTH, HEIGHT, { kernel: 'nearest' })
    .png();

  const outPath = join(outDir, `${slug}.png`);
  await image.toFile(outPath);
  console.log(`  Generated: ${outPath}`);
}

async function main() {
  const contentDir = join(import.meta.dirname, '..', 'src', 'content');
  const outDir = join(import.meta.dirname, '..', 'src', 'assets', 'images', 'placeholders');
  await mkdir(outDir, { recursive: true });

  // Collect all slugs from content directories
  const slugs: string[] = [];
  for (const collection of ['recipes', 'techniques']) {
    const dir = join(contentDir, collection);
    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (file.endsWith('.md') && !file.startsWith('_')) {
          slugs.push(file.replace('.md', ''));
        }
      }
    } catch {
      // directory may not exist
    }
  }

  console.log(`Generating ${slugs.length} placeholder images...`);
  for (const slug of slugs) {
    await generatePlaceholder(slug, outDir);
  }
  console.log('Done!');
}

main();
