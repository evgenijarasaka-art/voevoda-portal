/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/**
 * Локальный слой синхронизации админки и портала.
 *
 * Админка (apps/admin, dev на :3001) и портал (apps/portal, dev на :5173) живут на
 * РАЗНЫХ origin'ах, поэтому общий localStorage между ними невозможен. Этот эндпоинт
 * хранит единый JSON портала в файле на диске, админка пишет в него при сохранении,
 * а портал читает — так правки в админке реально меняют то, что видно на портале.
 *
 *   GET  /__admin-sync  -> текущий снимок данных портала (или {})
 *   PUT  /__admin-sync  -> сохранить новый снимок (тело запроса — JSON)
 */
function adminSyncPlugin(): Plugin {
  const dataFile = path.join(dirname, '.admin-sync-data.json');

  const sendJson = (res: import('node:http').ServerResponse, status: number, body: unknown) => {
    const payload = JSON.stringify(body);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
    res.setHeader('Cache-Control', 'no-store');
    res.end(payload);
  };

  return {
    name: 'voevoda-admin-sync',
    configureServer(server) {
      server.middlewares.use('/__admin-sync', (req, res) => {
        if (req.method === 'OPTIONS') {
          sendJson(res, 204, {});
          return;
        }

        if (req.method === 'GET') {
          try {
            const raw = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf-8') : '';
            sendJson(res, 200, raw ? JSON.parse(raw) : {});
          } catch {
            sendJson(res, 200, {});
          }
          return;
        }

        if (req.method === 'PUT' || req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk as Buffer));
          req.on('end', () => {
            try {
              const raw = chunks.length ? Buffer.concat(chunks) : Buffer.from('{}');
              JSON.parse(raw.toString('utf-8')); // валидация структуры
              fs.writeFileSync(dataFile, raw); // сохраняем сырые байты (UTF-8 как пришёл из браузера)
              sendJson(res, 200, { ok: true, updatedAt: new Date().toISOString() });
            } catch (error) {
              sendJson(res, 400, { ok: false, error: String(error) });
            }
          });
          return;
        }

        sendJson(res, 405, { ok: false, error: 'Method not allowed' });
      });
    },
  };
}

/**
 * Эндпоинт для модального выбора изображений в админке.
 *
 *   GET  /__admin-images        -> список картинок из apps/portal/public
 *   POST /__admin-images/upload -> { name, dataBase64 } -> сохраняет файл в public,
 *                                   возвращает { ok, route } с путём вида /имя.png
 */
function adminImagesPlugin(): Plugin {
  const publicDir = path.join(dirname, 'public');
  const imageExt = /\.(png|jpe?g|webp|gif|svg)$/i;

  const sendJson = (res: import('node:http').ServerResponse, status: number, body: unknown) => {
    const payload = JSON.stringify(body);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
    res.setHeader('Cache-Control', 'no-store');
    res.end(payload);
  };

  const sanitizeName = (name: string): string => {
    const base = path.basename(String(name || 'image')).trim();
    const cleaned = base.replace(/[^\p{L}\p{N}_.-]+/gu, '-');
    return cleaned || 'image';
  };

  return {
    name: 'voevoda-admin-images',
    configureServer(server) {
      server.middlewares.use('/__admin-images', (req, res) => {
        if (req.method === 'OPTIONS') {
          sendJson(res, 204, {});
          return;
        }

        const url = req.url || '';

        if (req.method === 'GET' && (url === '' || url === '/')) {
          try {
            const files = fs.readdirSync(publicDir, { withFileTypes: true })
              .filter((entry) => entry.isFile() && imageExt.test(entry.name))
              .map((entry) => entry.name)
              .sort((a, b) => a.localeCompare(b, 'ru'));
            sendJson(res, 200, { ok: true, images: files.map((name) => `/${name}`) });
          } catch (error) {
            sendJson(res, 500, { ok: false, error: String(error), images: [] });
          }
          return;
        }

        if (req.method === 'POST' && url.startsWith('/upload')) {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk as Buffer));
          req.on('end', () => {
            try {
              const raw = Buffer.concat(chunks).toString('utf-8');
              const body = JSON.parse(raw || '{}') as { name?: string; dataBase64?: string };
              if (!body.dataBase64) throw new Error('Нет данных файла');
              const match = /^data:(.+?);base64,(.*)$/.exec(body.dataBase64);
              const base64 = match ? match[2] : body.dataBase64;
              const buffer = Buffer.from(base64, 'base64');
              if (!buffer.length) throw new Error('Пустой файл');

              let safeName = sanitizeName(body.name || 'upload.png');
              if (!imageExt.test(safeName)) safeName += '.png';
              let finalName = safeName;
              let counter = 1;
              const ext = path.extname(safeName);
              const stem = safeName.slice(0, -ext.length);
              while (fs.existsSync(path.join(publicDir, finalName))) {
                finalName = `${stem}-${counter}${ext}`;
                counter += 1;
              }

              fs.writeFileSync(path.join(publicDir, finalName), buffer);
              sendJson(res, 200, { ok: true, route: `/${finalName}` });
            } catch (error) {
              sendJson(res, 400, { ok: false, error: String(error) });
            }
          });
          return;
        }

        sendJson(res, 405, { ok: false, error: 'Method not allowed' });
      });
    },
  };
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), adminSyncPlugin(), adminImagesPlugin()],
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});