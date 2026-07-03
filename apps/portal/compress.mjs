import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, extname, dirname, relative } from 'path';

const ROOT_DIR = '.';              // папка, где мы сейчас находимся
const MAX_SIZE = 1920;             // макс. ширина или высота
const JPEG_QUALITY = 82;           // чуть выше твоих 75 для лучшего качества
const PNG_QUALITY = 80;
const MIN_SIZE_KB = 500;           // сжимаем только файлы > 500 КБ

// Рекурсивный сбор всех изображений
function getAllFiles(dir) {
  let results = [];
  const list = readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else if (['.jpg', '.jpeg', '.png'].includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getAllFiles(ROOT_DIR);

for (const filePath of files) {
  const ext = extname(filePath).toLowerCase();
  const originalSize = statSync(filePath).size;

  if (originalSize < MIN_SIZE_KB * 1024) {
    console.log(`Пропущен (маленький): ${filePath}`);
    continue;
  }

  try {
    // Читаем изображение и применяем ресайз без увеличения
    let pipeline = sharp(filePath)
      .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
      .withMetadata(false);   // удаляем EXIF

    // Настройки формата
    if (ext === '.png') {
      pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true });
    } else {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true });
    }

    const buffer = await pipeline.toBuffer();

    // Заменяем файл только если новый размер меньше
    if (buffer.length < originalSize) {
      writeFileSync(filePath, buffer);
      const oldKB = Math.round(originalSize / 1024);
      const newKB = Math.round(buffer.length / 1024);
      console.log(`✓ ${filePath}  (${oldKB} КБ → ${newKB} КБ)`);
    } else {
      console.log(`✗ Не уменьшился: ${filePath}`);
    }
  } catch (e) {
    console.log(`✗ Ошибка ${filePath}: ${e.message}`);
  }
}