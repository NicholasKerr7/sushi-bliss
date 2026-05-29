import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const iconSourceDir = join(process.cwd(), "public/assets/icons");
const iconOutputDir = join(process.cwd(), "public/assets/icons-clean");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** Builds a CRC32 table once for PNG chunk checksums. */
function createCrcTable() {
  return Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    return value >>> 0;
  });
}

const crcTable = createCrcTable();

/** Calculates the PNG CRC32 checksum for a chunk type and payload. */
function crc32(type, payload) {
  let checksum = 0xffffffff;
  const input = Buffer.concat([Buffer.from(type), payload]);
  for (const byte of input) {
    checksum = crcTable[(checksum ^ byte) & 0xff] ^ (checksum >>> 8);
  }
  return (checksum ^ 0xffffffff) >>> 0;
}

/** Creates a PNG chunk buffer with length, type, payload, and checksum. */
function createChunk(type, payload = Buffer.alloc(0)) {
  const chunk = Buffer.alloc(12 + payload.length);
  chunk.writeUInt32BE(payload.length, 0);
  chunk.write(type, 4, 4, "ascii");
  payload.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(type, payload), 8 + payload.length);
  return chunk;
}

/** Reads a non-interlaced, 8-bit RGB/RGBA PNG into raw RGBA pixels. */
function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error("Invalid PNG signature.");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const payload = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = payload.readUInt32BE(0);
      height = payload.readUInt32BE(4);
      bitDepth = payload[8];
      colorType = payload[9];
      interlace = payload[12];
    }

    if (type === "IDAT") idatChunks.push(payload);
    if (type === "IEND") break;
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace}`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const bytesPerPixel = channels;
  const rowLength = width * channels;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const rgba = Buffer.alloc(width * height * 4);
  let readOffset = 0;
  let previousRow = Buffer.alloc(rowLength);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[readOffset];
    readOffset += 1;
    const row = Buffer.from(inflated.subarray(readOffset, readOffset + rowLength));
    readOffset += rowLength;

    for (let x = 0; x < rowLength; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const up = previousRow[x] ?? 0;
      const upperLeft = x >= bytesPerPixel ? previousRow[x - bytesPerPixel] : 0;

      if (filter === 1) row[x] = (row[x] + left) & 0xff;
      if (filter === 2) row[x] = (row[x] + up) & 0xff;
      if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 0xff;
      if (filter === 4) row[x] = (row[x] + paethPredictor(left, up, upperLeft)) & 0xff;
    }

    for (let x = 0; x < width; x += 1) {
      const inputOffset = x * channels;
      const outputOffset = (y * width + x) * 4;
      rgba[outputOffset] = row[inputOffset];
      rgba[outputOffset + 1] = row[inputOffset + 1];
      rgba[outputOffset + 2] = row[inputOffset + 2];
      rgba[outputOffset + 3] = channels === 4 ? row[inputOffset + 3] : 255;
    }

    previousRow = row;
  }

  return { width, height, rgba };
}

/** Implements the Paeth predictor used by PNG filter type 4. */
function paethPredictor(left, up, upperLeft) {
  const prediction = left + up - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const upDistance = Math.abs(prediction - up);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  return upDistance <= upperLeftDistance ? up : upperLeft;
}

/** Removes the baked light checkerboard while preserving saturated gold/red pixels. */
function removeCheckerboardBackground(rgba) {
  const cleaned = Buffer.from(rgba);
  for (let index = 0; index < cleaned.length; index += 4) {
    const red = cleaned[index];
    const green = cleaned[index + 1];
    const blue = cleaned[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const neutral = max - min < 18;
    const brightNeutral = neutral && max > 205;
    const paleCheckerAntiAlias = neutral && max > 188 && min > 176;

    if (brightNeutral || paleCheckerAntiAlias) {
      cleaned[index + 3] = 0;
    }
  }
  return cleaned;
}

/** Encodes raw RGBA pixels as a simple no-filter PNG. */
function encodePng({ width, height, rgba }) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const rowLength = width * 4;
  const filtered = Buffer.alloc((rowLength + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const outputOffset = y * (rowLength + 1);
    filtered[outputOffset] = 0;
    rgba.copy(filtered, outputOffset + 1, y * rowLength, (y + 1) * rowLength);
  }

  return Buffer.concat([
    pngSignature,
    createChunk("IHDR", header),
    createChunk("IDAT", deflateSync(filtered, { level: 9 })),
    createChunk("IEND"),
  ]);
}

/** Generates transparent derivatives for every packaged icon PNG. */
function prepareIcons() {
  mkdirSync(iconOutputDir, { recursive: true });
  const generated = [];

  for (const fileName of readdirSync(iconSourceDir).filter((file) => file.endsWith(".png"))) {
    const sourcePath = join(iconSourceDir, fileName);
    const outputPath = join(iconOutputDir, fileName);
    const decoded = decodePng(readFileSync(sourcePath));
    const encoded = encodePng({ ...decoded, rgba: removeCheckerboardBackground(decoded.rgba) });
    writeFileSync(outputPath, encoded);
    generated.push(`${basename(outputPath)} ${createHash("sha256").update(encoded).digest("hex").slice(0, 10)}`);
  }

  console.log(`Generated ${generated.length} cleaned icon assets.`);
}

prepareIcons();
