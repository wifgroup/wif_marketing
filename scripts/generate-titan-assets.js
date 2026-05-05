const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outDir = path.join(__dirname, "..", "assets", "image", "titan-style");
fs.mkdirSync(outDir, { recursive: true });

const palettes = {
  paper: [246, 243, 239, 255],
  white: [255, 255, 255, 255],
  ink: [17, 17, 17, 255],
  soft: [216, 211, 204, 255],
  gray: [97, 94, 91, 255],
  orange: [255, 153, 0, 255]
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function canvas(width, height, fill = palettes.paper) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = fill[0];
    pixels[i + 1] = fill[1];
    pixels[i + 2] = fill[2];
    pixels[i + 3] = fill[3];
  }
  const set = (x, y, color = palettes.ink, alpha = color[3]) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = (Math.floor(y) * width + Math.floor(x)) * 4;
    const a = alpha / 255;
    pixels[i] = Math.round(color[0] * a + pixels[i] * (1 - a));
    pixels[i + 1] = Math.round(color[1] * a + pixels[i + 1] * (1 - a));
    pixels[i + 2] = Math.round(color[2] * a + pixels[i + 2] * (1 - a));
    pixels[i + 3] = 255;
  };
  const line = (x0, y0, x1, y1, color = palettes.ink, weight = 1, alpha = color[3]) => {
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = Math.round(x0);
    let y = Math.round(y0);
    while (true) {
      for (let ox = -Math.floor(weight / 2); ox <= Math.floor(weight / 2); ox += 1) {
        for (let oy = -Math.floor(weight / 2); oy <= Math.floor(weight / 2); oy += 1) set(x + ox, y + oy, color, alpha);
      }
      if (x === Math.round(x1) && y === Math.round(y1)) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  };
  const rect = (x, y, w, h, color = palettes.ink, fillRect = false, alpha = color[3]) => {
    if (fillRect) {
      for (let yy = y; yy < y + h; yy += 1) for (let xx = x; xx < x + w; xx += 1) set(xx, yy, color, alpha);
      return;
    }
    line(x, y, x + w, y, color, 2, alpha);
    line(x + w, y, x + w, y + h, color, 2, alpha);
    line(x + w, y + h, x, y + h, color, 2, alpha);
    line(x, y + h, x, y, color, 2, alpha);
  };
  const circle = (cx, cy, r, color = palettes.ink, fillCircle = false, alpha = color[3]) => {
    for (let y = -r; y <= r; y += 1) {
      for (let x = -r; x <= r; x += 1) {
        const d = x * x + y * y;
        if ((fillCircle && d <= r * r) || (!fillCircle && Math.abs(d - r * r) < r * 2.2)) set(cx + x, cy + y, color, alpha);
      }
    }
  };
  const hatch = (gap = 18, alpha = 38) => {
    for (let x = -height; x < width; x += gap) line(x, height, x + height, 0, palettes.ink, 1, alpha);
  };
  const save = (filename) => {
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y += 1) {
      raw[y * (width * 4 + 1)] = 0;
      pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0))
    ]);
    fs.writeFileSync(path.join(outDir, filename), png);
  };
  return { width, height, set, line, rect, circle, hatch, save };
}

function heroCity() {
  const c = canvas(1400, 920, palettes.paper);
  c.hatch(22, 20);
  for (let y = 140; y < 830; y += 78) c.line(78, y, 1320, y, palettes.soft, 1, 150);
  for (let x = 90; x < 1320; x += 92) c.line(x, 90, x, 830, palettes.soft, 1, 110);
  const buildings = [
    [110, 430, 118, 310], [260, 300, 140, 440], [430, 210, 112, 530], [572, 360, 150, 380],
    [760, 250, 132, 490], [930, 335, 112, 405], [1076, 170, 150, 570], [1260, 395, 74, 345]
  ];
  buildings.forEach(([x, y, w, h], i) => {
    c.rect(x, y, w, h, palettes.ink, false, 220);
    for (let yy = y + 28; yy < y + h - 16; yy += 42) c.line(x + 16, yy, x + w - 16, yy, palettes.gray, 1, 130);
    for (let xx = x + 24; xx < x + w - 12; xx += 38) c.line(xx, y + 18, xx, y + h - 20, palettes.gray, 1, 95);
    if (i % 2 === 0) c.rect(x + 18, y - 34, w - 36, 34, palettes.ink, false, 180);
  });
  c.line(80, 745, 1328, 745, palettes.ink, 3, 230);
  c.line(120, 790, 1260, 790, palettes.ink, 2, 140);
  for (let x = 160; x < 1220; x += 120) {
    c.line(x, 745, x - 42, 790, palettes.ink, 1, 120);
    c.line(x, 745, x + 42, 790, palettes.ink, 1, 120);
  }
  c.circle(1110, 128, 28, palettes.ink, false, 180);
  c.line(1078, 128, 1040, 112, palettes.ink, 2, 160);
  c.line(1078, 128, 1038, 146, palettes.ink, 2, 160);
  c.line(1142, 128, 1184, 112, palettes.ink, 2, 160);
  c.line(1142, 128, 1182, 146, palettes.ink, 2, 160);
  c.save("hero-city-ledger.png");
}

function decisionBoard() {
  const c = canvas(1100, 760, palettes.white);
  c.hatch(20, 18);
  c.rect(68, 70, 964, 610, palettes.ink, false, 210);
  for (let x = 156; x < 950; x += 120) c.line(x, 130, x, 624, palettes.soft, 1, 150);
  for (let y = 165; y < 620; y += 86) c.line(118, y, 982, y, palettes.soft, 1, 160);
  const points = [[118, 565], [238, 505], [358, 530], [478, 412], [598, 438], [718, 326], [838, 270], [982, 205]];
  points.forEach((point, i) => {
    if (i) c.line(points[i - 1][0], points[i - 1][1], point[0], point[1], palettes.ink, 4, 230);
    c.circle(point[0], point[1], 9, palettes.ink, true, 255);
  });
  [[150, 140, 190, 55], [412, 176, 230, 55], [694, 112, 240, 55], [704, 510, 220, 72]].forEach(([x, y, w, h], i) => {
    c.rect(x, y, w, h, i === 2 ? palettes.orange : palettes.ink, false, 210);
    for (let yy = y + 18; yy < y + h - 8; yy += 16) c.line(x + 18, yy, x + w - 18, yy, palettes.gray, 2, 120);
  });
  c.save("decision-board.png");
}

function advisor(name, seed) {
  const c = canvas(760, 920, palettes.paper);
  c.hatch(17 + seed, 16);
  c.circle(380, 265, 108, palettes.ink, false, 210);
  c.circle(380, 265, 90, palettes.white, true, 255);
  c.circle(380, 245, 74, palettes.ink, false, 110);
  c.line(320, 272, 352, 266, palettes.ink, 3, 180);
  c.line(410, 266, 442, 272, palettes.ink, 3, 180);
  c.line(350, 312, 410, 318, palettes.ink, 3, 150);
  c.line(286, 640, 474, 640, palettes.ink, 4, 220);
  c.line(306, 396, 210, 790, palettes.ink, 4, 220);
  c.line(454, 396, 552, 790, palettes.ink, 4, 220);
  c.line(310, 500, 450, 500, palettes.ink, 2, 120);
  c.line(328, 500, 382, 640, palettes.ink, 2, 140);
  c.line(432, 500, 382, 640, palettes.ink, 2, 140);
  for (let y = 690; y < 826; y += 28) c.line(230, y, 530, y, palettes.gray, 1, 120);
  for (let x = 270; x < 510; x += 44) c.line(x, 665, x + (seed % 2 ? 20 : -20), 850, palettes.gray, 1, 80);
  c.rect(78, 72, 604, 776, palettes.ink, false, 150);
  c.save(`advisor-${name}.png`);
}

function feeLedger() {
  const c = canvas(1150, 820, palettes.paper);
  c.hatch(24, 18);
  c.rect(80, 84, 470, 640, palettes.ink, false, 230);
  c.rect(600, 84, 470, 640, palettes.ink, false, 120);
  c.rect(112, 122, 130, 130, palettes.ink, false, 220);
  c.rect(632, 122, 130, 130, palettes.gray, false, 140);
  for (let y = 324; y < 645; y += 58) {
    c.line(124, y, 500, y, palettes.ink, 2, 160);
    c.line(644, y, 1020, y, palettes.gray, 2, 105);
  }
  c.line(130, 590, 206, 512, palettes.ink, 5, 230);
  c.line(206, 512, 292, 552, palettes.ink, 5, 230);
  c.line(292, 552, 458, 388, palettes.ink, 5, 230);
  c.line(650, 420, 740, 492, palettes.gray, 4, 110);
  c.line(740, 492, 820, 468, palettes.gray, 4, 110);
  c.line(820, 468, 1010, 358, palettes.gray, 4, 110);
  c.circle(176, 184, 42, palettes.orange, false, 220);
  c.save("fee-ledger.png");
}

heroCity();
decisionBoard();
advisor("sullivan", 2);
advisor("silveira", 5);
advisor("chatterjee", 8);
feeLedger();
