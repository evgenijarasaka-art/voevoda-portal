// Продакшен-эндпоинт загрузки изображений из админки (аналог /__admin-images/upload
// в vite.config.ts). Файл сохраняется в Vercel Blob, в ответе — постоянный
// абсолютный URL, который админка подставляет в данные и который портал
// показывает как есть.
//
//   POST /api/admin-images/upload  { name, dataBase64 } -> { ok, route }
//
// Лимит тела запроса у функций Vercel — 4.5 МБ, т.е. картинка примерно до 3 МБ.
import { put } from '@vercel/blob';

const BLOB_PREFIX = 'admin-images/';
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Cache-Control', 'no-store');
}

function sanitizeName(name) {
  const base = String(name || 'image').split(/[\\/]/).pop().trim();
  const cleaned = base.replace(/[^\p{L}\p{N}_.-]+/gu, '-');
  return cleaned || 'image';
}

export default async function handler(req, res) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      ok: false,
      error: 'Vercel Blob не подключён: в проекте портала откройте Storage → Create → Blob.',
    });
    return;
  }

  const secret = process.env.ADMIN_SYNC_SECRET;
  if (secret && req.headers['x-admin-key'] !== secret) {
    res.status(401).json({ ok: false, error: 'Неверный ключ записи (X-Admin-Key).' });
    return;
  }

  try {
    const body = req.body || {};
    if (!body.dataBase64) throw new Error('Нет данных файла');
    const match = /^data:(.+?);base64,(.*)$/.exec(body.dataBase64);
    const base64 = match ? match[2] : body.dataBase64;
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length) throw new Error('Пустой файл');

    let safeName = sanitizeName(body.name || 'upload.png');
    if (!IMAGE_EXT.test(safeName)) safeName += '.png';

    const blob = await put(`${BLOB_PREFIX}${safeName}`, buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: match ? match[1] : undefined,
    });
    res.status(200).json({ ok: true, route: blob.url });
  } catch (error) {
    res.status(400).json({ ok: false, error: String(error) });
  }
}
