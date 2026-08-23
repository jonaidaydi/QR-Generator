import { writeFile } from "node:fs/promises";
import { PNG } from "pngjs";

const sizes = [32, 180, 192, 512];
const modules = [
  "111001111",
  "101001001",
  "111001111",
  "000000000",
  "111011101",
  "101110001",
  "111011111",
  "000010101",
  "101111101",
];

function insideRoundedSquare(x, y, size, radius) {
  const nearestX = Math.max(radius, Math.min(size - radius - 1, x));
  const nearestY = Math.max(radius, Math.min(size - radius - 1, y));
  return Math.hypot(x - nearestX, y - nearestY) <= radius;
}

function setPixel(png, x, y, red, green, blue, alpha = 255) {
  const index = (y * png.width + x) * 4;
  png.data[index] = red;
  png.data[index + 1] = green;
  png.data[index + 2] = blue;
  png.data[index + 3] = alpha;
}

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  const radius = size * 0.23;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!insideRoundedSquare(x, y, size, radius)) {
        setPixel(png, x, y, 0, 0, 0, 0);
        continue;
      }
      const blend = y / Math.max(1, size - 1);
      setPixel(
        png,
        x,
        y,
        Math.round(255),
        Math.round(183 - blend * 43),
        Math.round(86 - blend * 48),
      );
    }
  }

  const moduleSize = Math.max(2, Math.floor(size * 0.065));
  const codeSize = moduleSize * modules.length;
  const offset = Math.floor((size - codeSize) / 2);
  for (let row = 0; row < modules.length; row += 1) {
    for (let column = 0; column < modules[row].length; column += 1) {
      if (modules[row][column] !== "1") continue;
      for (let y = 0; y < moduleSize; y += 1) {
        for (let x = 0; x < moduleSize; x += 1) {
          setPixel(png, offset + column * moduleSize + x, offset + row * moduleSize + y, 17, 17, 17);
        }
      }
    }
  }
  return PNG.sync.write(png);
}

await Promise.all(
  sizes.map((size) => writeFile(new URL(`../static/icons/icon-${size}.png`, import.meta.url), createIcon(size))),
);
