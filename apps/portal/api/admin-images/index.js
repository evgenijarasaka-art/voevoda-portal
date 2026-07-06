// Продакшен-эндпоинт списка изображений для модалки выбора в админке.
// Локальный аналог — /__admin-images в vite.config.ts (читает apps/portal/public).
// На Vercel статические файлы public недоступны из функции, поэтому здесь
// отдаются только изображения, загруженные через админку в Vercel Blob.
//
//   GET /api/admin-images -> { ok, images: [абсолютные URL] }
import { list } from '@vercel/blob';

const BLOB_PREFIX = 'admin-images/';

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Cache-Control', 'no-store');
}

export default async function handler(req, res) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      ok: false,
      images: [],
      error: 'Vercel Blob не подключён: в проекте портала откройте Storage → Create → Blob.',
    });
    return;
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 500 });
    const images = blobs
      .map((blob) => blob.url)
      .sort((a, b) => a.localeCompare(b, 'ru'));
    res.status(200).json({ ok: true, images });
  } catch (error) {
    res.status(500).json({ ok: false, images: [], error: String(error) });
  }
}
