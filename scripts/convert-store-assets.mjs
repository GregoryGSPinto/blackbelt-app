/**
 * Convert store asset SVGs to PNGs using sharp.
 * Usage: node scripts/convert-store-assets.mjs
 */
import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'docs', 'store-assets');

const conversions = [
  { svg: 'feature-graphic.svg', png: 'feature-graphic.png', width: 1024, height: 500 },
  { svg: 'app-icon.svg', png: 'app-icon.png', width: 1024, height: 1024 },
];

async function convert() {
  for (const { svg, png, width, height } of conversions) {
    const svgPath = join(assetsDir, svg);
    const pngPath = join(assetsDir, png);

    if (!existsSync(svgPath)) {
      console.log(`⏭  Skipping ${svg} (not found)`);
      continue;
    }

    const svgBuffer = readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toFile(pngPath);

    console.log(`✅ ${svg} → ${png} (${width}x${height})`);
  }
}

convert().catch((err) => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
