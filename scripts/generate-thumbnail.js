/*
 Programmatic YouTube thumbnail generator (1280x720)
 - Uses a base portrait (default: public/keith.jpg)
 - Blurred background from same image
 - Foreground portrait large, left-of-center
 - Minimal Amazon-like orange swoosh mark and keyword blocks on right
 - Dotted connector path
 - No text, neutral tones with subtle Amazon orange accents
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_W = 1280;
const OUTPUT_H = 720;

async function main() {
  const inputPath = process.argv[2] || path.join('public', 'keith.jpg');
  const outPath = process.argv[3] || path.join('public', 'thumbnail.png');

  if (!fs.existsSync(inputPath)) {
    console.error(`Base image not found: ${inputPath}`);
    process.exit(1);
  }

  // Background: cover + blur
  const bgBuffer = await sharp(inputPath)
    .resize(OUTPUT_W, OUTPUT_H, { fit: 'cover', position: 'centre' })
    .blur(20)
    .toBuffer();

  // Foreground portrait: large and left-of-center, no distortion
  // Choose a target width so the face fills more of the frame; tuneable.
  // Ensure portrait fits within canvas height to avoid out-of-bounds
  const portraitBuffer = await sharp(inputPath)
    .resize({ height: OUTPUT_H, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const pMeta = await sharp(portraitBuffer).metadata();
  const portraitW = pMeta.width || Math.round(OUTPUT_H * 1.2);
  const portraitH = pMeta.height || OUTPUT_H;

  const portraitLeft = 60; // left padding
  const portraitTop = Math.round((OUTPUT_H - portraitH) / 2);

  // SVG overlay: dotted connector, orange swoosh (Amazon-like), keyword blocks with soft shadows
  const amazonCx = 960; // right side position
  const amazonCy = 330;

  const blocks = [
    { x: 980, y: 420, w: 180, h: 26, r: 13, fill: '#f3f4f6' },
    { x: 1040, y: 460, w: 120, h: 22, r: 11, fill: '#eef2f7' },
    { x: 900, y: 470, w: 120, h: 26, r: 13, fill: '#f3f4f6' },
  ];

  // Connector path from near the face area to logo, then to blocks (minimal, dotted)
  const startX = portraitLeft + Math.min(portraitW - 80, 680);
  const startY = portraitTop + Math.round(portraitH * 0.38);

  const connectorPath1 = `M ${startX},${startY} C ${startX+120},${startY-40} ${amazonCx-140},${amazonCy-40} ${amazonCx},${amazonCy}`;
  const connectorPath2 = `M ${amazonCx},${amazonCy} C ${amazonCx+40},${amazonCy+40} ${blocks[0].x-40},${blocks[0].y-20} ${blocks[0].x},${blocks[0].y}`;

  // Amazon-like swoosh (orange curve) — minimal, symbolic
  const swoosh = `M ${amazonCx-90},${amazonCy+28} C ${amazonCx-10},${amazonCy+70} ${amazonCx+80},${amazonCy+10} ${amazonCx+120},${amazonCy+8}`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OUTPUT_W}" height="${OUTPUT_H}" viewBox="0 0 ${OUTPUT_W} ${OUTPUT_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Dotted connector lines -->
  <path d="${connectorPath1}" fill="none" stroke="#9aa3af" stroke-width="2" stroke-dasharray="4 6" opacity="0.9"/>
  <path d="${connectorPath2}" fill="none" stroke="#9aa3af" stroke-width="2" stroke-dasharray="4 6" opacity="0.9"/>

  <!-- Amazon-like orange swoosh (no text) -->
  <path d="${swoosh}" fill="none" stroke="#FF9900" stroke-width="10" stroke-linecap="round" filter="url(#shadow)"/>

  <!-- Keyword-style rounded rectangles with subtle shadows -->
  ${blocks.map(b => `
    <rect x="${b.x+2}" y="${b.y+3}" rx="${b.r}" ry="${b.r}" width="${b.w}" height="${b.h}" fill="rgba(0,0,0,0.12)"/>
    <rect x="${b.x}" y="${b.y}" rx="${b.r}" ry="${b.r}" width="${b.w}" height="${b.h}" fill="${b.fill}" filter="url(#shadow)"/>
  `).join('')}

  <!-- Small accent chip in Amazon orange -->
  <rect x="${amazonCx+90}" y="${amazonCy+40}" rx="10" ry="10" width="80" height="20" fill="#FFE8CC" stroke="#FF9900" stroke-width="1"/>
</svg>`;

  const svgBuffer = Buffer.from(svg);

  // Compose final
  const final = await sharp(bgBuffer)
    .composite([
      { input: portraitBuffer, left: portraitLeft, top: portraitTop },
      { input: svgBuffer, left: 0, top: 0 },
    ])
    .png({ quality: 95 })
    .toBuffer();

  await sharp(final)
    .resize(OUTPUT_W, OUTPUT_H, { fit: 'cover' })
    .toFile(outPath);

  console.log(`Thumbnail written to: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
