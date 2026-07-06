# Реальные звонки в Messages

В комплекте два файла:

1. `Messages.realtime.tsx` — страница с реальными WebRTC звонками.
2. `call-signaling-server.ts` — минимальный Socket.IO signaling-сервер.

## Установка зависимостей

В фронтенд-проекте:

```bash
npm i socket.io-client
```

Для signaling-сервера:

```bash
npm i socket.io
npm i -D tsx typescript @types/node
```

## Запуск сервера

```bash
npx tsx call-signaling-server.ts
```

По умолчанию сервер запускается на:

```txt
http://localhost:4000
```

## Настройка фронтенда

Можно добавить `.env`:

```env
VITE_SIGNALING_URL=http://localhost:4000
```

Если `.env` не добавлять, `Messages.realtime.tsx` сам использует `http://localhost:4000`.

## Как протестировать на одном компьютере

Открой два окна браузера:

```txt
http://localhost:5173/messages?userId=me
http://localhost:5173/messages?userId=1
```

В первом окне нажми звонок на чате `Торнадо`, потому что его `id = 1`.
Во втором окне появится входящий звонок.

## Важно

Камера, микрофон и демонстрация экрана работают только на `localhost` или на HTTPS.
Для продакшена нужен TURN-сервер, иначе у части пользователей звонки не соединятся через NAT/фаерволлы.
