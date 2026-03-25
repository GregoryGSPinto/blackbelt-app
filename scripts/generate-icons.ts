import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

for (const size of sizes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#C62828" rx="${Math.round(size * 0.15)}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="800" font-size="${Math.round(size * 0.35)}">BB</text>
  </svg>`;

  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`  icon-${size}.svg`);
}

console.log('\nPara producao: converter SVGs em PNGs e substituir por icone profissional');
