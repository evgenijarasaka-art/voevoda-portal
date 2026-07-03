// Продакшен-эндпоинт синхронизации админки и портала (Vercel Serverless Function).
//
// Локально эту роль выполняет dev-middleware в vite.config.ts (/__admin-sync),
// а на Vercel статики нет сервера — поэтому здесь та же пара GET/PUT, но снимок
// данных хранится в Vercel Blob (подключается в дашборде: Storage → Blob).
//
//   GET  /api/admin-sync -> текущий снимок данных портала (или {})
//   PUT  /api/admin-sync -> сохранить снимок; если на портале задан env
//                           ADMIN_SYNC_SECRET, запись требует заголовок
//                           X-Admin-Key с тем же значением.
import { list, put } from '@vercel/blob';

const BLOB_PATH = 'admin-sync/site-data.json';

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Cache-Control', 'no-store');
}

export default async function handler(req, res) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      ok: false,
      error: 'Vercel Blob не подключён: в проекте портала откройте Storage → Create → Blob, чтобы появился BLOB_READ_WRITE_TOKEN.',
    });
    return;
  }

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
      if (!blobs.length) {
        res.status(200).json({});
        return;
      }
      // Blob раздаётся через CDN с кэшем — уникальный query-параметр гарантирует свежесть.
      const response = await fetch(`${blobs[0].url}?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      res.status(200).json(data ?? {});
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
    return;
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    const secret = process.env.ADMIN_SYNC_SECRET;
    if (secret && req.headers['x-admin-key'] !== secret) {
      res.status(401).json({ ok: false, error: 'Неверный ключ записи (X-Admin-Key). Задайте VITE_ADMIN_SYNC_SECRET в админке.' });
      return;
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ ok: false, error: 'Ожидается JSON-объект со снимком данных портала.' });
      return;
    }

    try {
      await put(BLOB_PATH, JSON.stringify(body), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
      });
      res.status(200).json({ ok: true, updatedAt: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
    return;
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}
