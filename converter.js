import sharp from "sharp";
import { readdir, mkdir, readFile, writeFile, rm } from "node:fs/promises";

function extractBasename(file) {
  const extIdx = file.lastIndexOf(".");
  return file.slice(0, extIdx);
}

async function ensureDirectoryExistence(filePath) {
  await mkdir(filePath, { recursive: true });
}

async function formatTilesDir(tilesPath, basename) {
  const tiles = await readdir(`${tilesPath}/${basename}_files/13`);

  const tilesMap = await tiles.reduce(async (prev, tile) => {
    const acc = await prev;
    acc[basename + "_" + tile] = await readFile(
      `${tilesPath}/${basename}_files/13/${tile}`
    );

    return acc;
  }, Promise.resolve({}));

  const reduntFiles = await readdir(tilesPath);

  reduntFiles.forEach(
    async (file) =>
      await rm(`${tilesPath}/${file}`, { force: true, recursive: true })
  );

  for (const [key, value] of Object.entries(tilesMap)) {
    await writeFile(`${tilesPath}/${key}`, value);
  }
}

async function main() {
  const floors = await readdir("assets/orig");

  if (floors.length)
    floors.forEach(async (floorIndex) => {
      const images = await readdir(`assets/orig/${floorIndex}`);
      if (images.length)
        images.forEach(async (image) => {
          const basename = extractBasename(image);

          await ensureDirectoryExistence(`assets/low/${floorIndex}/`);

          await sharp(`assets/orig/${floorIndex}/${image}`)
            .resize({ width: 2048, height: 1024 })
            .webp({ quality: 40 })
            .toFile(`assets/low/${floorIndex}/${basename}.webp`);

          await ensureDirectoryExistence(`assets/tiles/${floorIndex}/`);

          await sharp(`assets/orig/${floorIndex}/${image}`)
            .webp({ quality: 90 })
            .tile({
              size: 512,
            })
            .toFile(`assets/tiles/${floorIndex}/${basename}.dz`);

          await formatTilesDir(`assets/tiles/${floorIndex}`, basename);
        });
    });
}

main();
