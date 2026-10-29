const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Standard CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPng(width, height, pixelFn) {
  const rowBytes = 1 + width * 4;
  const buffer = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    buffer[rowOffset] = 0; // Filter type 0: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      buffer[pxOffset] = r;
      buffer[pxOffset + 1] = g;
      buffer[pxOffset + 2] = b;
      buffer[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(buffer);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

// Draw FleetFlow Icon: Rounded Squircle with Indigo->Purple Gradient and White 'FF' Monogram
function fleetFlowIconShader(x, y, width, height) {
  const nx = x / width;
  const ny = y / height;

  // Squircle distance formula: (|2nx-1|^4 + |2ny-1|^4)^(1/4)
  const cx = 2 * nx - 1;
  const cy = 2 * ny - 1;
  const r = Math.pow(Math.pow(Math.abs(cx), 3.2) + Math.pow(Math.abs(cy), 3.2), 1 / 3.2);

  // Outside rounded squircle
  if (r > 0.94) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Smooth edge antialiasing
  let alpha = 255;
  if (r > 0.88) {
    alpha = Math.round(255 * (0.94 - r) / 0.06);
  }

  // Background Gradient: #4F46E5 (79, 70, 229) to #7C3AED (124, 58, 237)
  const gradT = (nx + ny) / 2;
  let bgR = Math.round(79 + (124 - 79) * gradT);
  let bgG = Math.round(70 + (58 - 70) * gradT);
  let bgB = Math.round(229 + (237 - 229) * gradT);

  // Subtle border highlight
  if (r > 0.82 && r <= 0.88) {
    bgR = Math.min(255, bgR + 40);
    bgG = Math.min(255, bgG + 40);
    bgB = Math.min(255, bgB + 30);
  }

  // Monogram geometry (normalized 0..1 inside the icon)
  // Vertical stem: nx in [0.25, 0.35], ny in [0.24, 0.76]
  const inStem = nx >= 0.25 && nx <= 0.35 && ny >= 0.24 && ny <= 0.76;
  // Top bar: nx in [0.25, 0.72], ny in [0.24, 0.34]
  const inTopBar = nx >= 0.25 && nx <= 0.72 && ny >= 0.24 && ny <= 0.34;
  // Mid bar: nx in [0.25, 0.62], ny in [0.45, 0.54]
  const inMidBar = nx >= 0.25 && nx <= 0.62 && ny >= 0.45 && ny <= 0.54;
  // Chevron forward arrow: diagonal path in bottom right
  const inChevron = (nx + ny >= 1.05 && nx + ny <= 1.25 && ny - nx >= -0.05 && ny - nx <= 0.22);
  // Live pulse dot at top right: (0.75, 0.29)
  const dotDist = Math.sqrt(Math.pow(nx - 0.76, 2) + Math.pow(ny - 0.29, 2));
  const inDot = dotDist < 0.055;

  if (inStem || inTopBar) {
    return [255, 255, 255, alpha]; // Pure white
  }
  if (inMidBar || inChevron) {
    return [221, 214, 254, alpha]; // Soft lavender #DDD6FE
  }
  if (inDot) {
    return [167, 243, 208, alpha]; // Mint emerald telematics dot #A7F3D0
  }

  return [bgR, bgG, bgB, alpha];
}

// Generate ICO file containing multiple PNG images
function createIco(images) {
  // images: array of { width, height, buffer }
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];
  const buffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry[0] = img.width >= 256 ? 0 : img.width;
    entry[1] = img.height >= 256 ? 0 : img.height;
    entry[2] = 0; // color palette
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset

    entries.push(entry);
    buffers.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...buffers]);
}

// Generate Assets
console.log('Generating FleetFlow high-resolution icons...');

const png16 = createPng(16, 16, fleetFlowIconShader);
const png32 = createPng(32, 32, fleetFlowIconShader);
const png48 = createPng(48, 48, fleetFlowIconShader);
const png192 = createPng(192, 192, fleetFlowIconShader);
const png512 = createPng(512, 512, fleetFlowIconShader);

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 },
]);

const publicDir = path.join(__dirname, '..', 'frontend', 'public');

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(publicDir, 'logo192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'logo512.png'), png512);

console.log('Successfully generated:');
console.log(' - frontend/public/favicon.ico');
console.log(' - frontend/public/logo192.png');
console.log(' - frontend/public/logo512.png');
