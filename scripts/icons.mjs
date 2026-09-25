// Renders src/art/favicon.svg into every icon the browsers ask for, written to public/:
//   favicon.svg, favicon.ico (16 + 32), apple-touch-icon.png (180), icon-192.png, icon-512.png,
//   site.webmanifest. Run after editing the favicon: npm run icons

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = await readFile(join(root, 'src/art/favicon.svg'), 'utf8');
const config = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'));

// Rasterise at `size`; `padding` shrinks the drawing inside a solid background (home-screen icons).
function png(size, { background, padding = 0 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);
  const framed = background
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
         <rect width="${size}" height="${size}" fill="${background}"/>
         <svg x="${offset}" y="${offset}" width="${inner}" height="${inner}" viewBox="0 0 64 64">${svg.replace(/<\/?svg[^>]*>/g, '').replace('#17120e', '#ece7dc')}</svg>
       </svg>`
    : svg;
  return new Resvg(framed, { fitTo: { mode: 'width', value: size } }).render().asPng();
}

// An .ico is a tiny directory of embedded PNGs.
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

const out = (name) => join(root, 'public', name);
await writeFile(out('favicon.svg'), svg);
await writeFile(out('favicon.ico'), ico([16, 32].map((size) => ({ size, data: png(size) }))));
await writeFile(out('apple-touch-icon.png'), png(180, { background: '#000', padding: 0.12 }));
await writeFile(out('icon-192.png'), png(192, { background: '#000', padding: 0.12 }));
await writeFile(out('icon-512.png'), png(512, { background: '#000', padding: 0.12 }));
await writeFile(
  out('site.webmanifest'),
  JSON.stringify(
    {
      name: config.name,
      short_name: config.name,
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#000000',
      background_color: '#000000',
      display: 'standalone',
    },
    null,
    2,
  ) + '\n',
);
console.log('icons written to public/');
