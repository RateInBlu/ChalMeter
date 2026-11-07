import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, r, g, b, accentR, accentG, accentB) {
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Speedometer curved dial arc
      const outerR = width * 0.44;
      const innerR = width * 0.36;
      const inDialArc = dist >= innerR && dist <= outerR && (y < cy + height * 0.22 || x < cx);

      // Stylized Indian road perspective triangle
      const roadHalfWidth = ((y - cy * 0.4) / (height * 0.6)) * (width * 0.28);
      const inRoad = y > cy * 0.4 && y < height * 0.82 && Math.abs(dx) <= Math.max(2, roadHalfWidth);
      const isRoadStripe = inRoad && Math.abs(dx) <= width * 0.02 && (y % Math.floor(height * 0.12) < height * 0.07);

      // Needle in upper-right quadrant
      const angle = Math.atan2(dy, dx);
      const inNeedle = dist < outerR * 0.85 && Math.abs(angle - (-0.6)) < 0.12 && dist > width * 0.08;

      let pr = r, pg = g, pb = b;
      if (inDialArc || inNeedle) {
        pr = accentR;
        pg = accentG;
        pb = accentB;
      } else if (isRoadStripe) {
        pr = 255;
        pg = 255;
        pb = 255;
      } else if (inRoad) {
        pr = Math.min(255, r + 25);
        pg = Math.min(255, g + 35);
        pb = Math.min(255, b + 45);
      } else if (dist <= width * 0.09) {
        // Center hub
        pr = accentR;
        pg = accentG;
        pb = accentB;
      }

      rawData[pos++] = pr;
      rawData[pos++] = pg;
      rawData[pos++] = pb;
      rawData[pos++] = 255;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);

    return Buffer.concat([len, typeAndData, crc]);
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c ^= buf[n];
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public');
}

// ChalMeter Colors: Dark Navy (#0B1424: 11, 20, 36) + Electric Lime (#A5ED45: 165, 237, 69)
fs.writeFileSync('./public/pwa-48x48.png', createPNG(48, 48, 11, 20, 36, 165, 237, 69));
fs.writeFileSync('./public/pwa-96x96.png', createPNG(96, 96, 11, 20, 36, 165, 237, 69));
fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192, 11, 20, 36, 165, 237, 69));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512, 11, 20, 36, 165, 237, 69));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512, 11, 20, 36, 165, 237, 69));
fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180, 11, 20, 36, 165, 237, 69));
fs.writeFileSync('./public/favicon.ico', createPNG(48, 48, 11, 20, 36, 165, 237, 69));

console.log('Successfully generated ChalMeter PWA icons (48px, 96px, 192px, 512px) in /public!');
