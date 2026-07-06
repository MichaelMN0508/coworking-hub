# Coworking Hub — Telegram Mini App

Приложение для студентов: карта коворкингов, создание встреч по теме,
присоединение к чужим встречам и заявки на аренду места.

## Стек

- **server**: Express + TypeScript + Prisma (SQLite) + grammy (Telegram bot)
- **client**: React + Vite + TypeScript + Tailwind + react-leaflet (карта, OpenStreetMap)

## Быстрый старт (локально)

```bash
npm install

# один раз: применить миграции и засеять тестовые коворкинги
npm run prisma:migrate --workspace server
npm run prisma:seed

# запустить API и клиент
npm run dev:server
npm run dev:client
```

Клиент откроется на http://localhost:5273, API — на http://localhost:4100.
Вне Telegram (в обычном браузере) сервер подставляет тестового
пользователя `dev_user`, так что интерфейс можно проверять без бота.

## Подключение реального Telegram-бота (локально, без деплоя)

1. Скопируйте `server/.env.example` в `server/.env` и впишите токен,
   полученный от `@BotFather`, в `BOT_TOKEN`.
2. Запустите бота: `npm run dev:bot`. Он ответит на `/start`, но кнопка
   Mini App не откроется внутри Telegram, пока клиент не будет на
   публичном HTTPS-адресе (см. деплой ниже) — Telegram Mini App
   работает только по HTTPS, `localhost` изнутри Telegram недоступен.

## Полный деплой (сервер на Render + клиент на Vercel)

Оба сервиса бесплатны и работают по обычному HTTPS (443 порт), поэтому
подходят, даже если ваша сеть блокирует нестандартные порты, нужные
временным туннелям (ngrok/cloudflared/localtunnel).

### 0. Залейте код в свой GitHub-репозиторий

```bash
cd coworking-hub
# уже сделан локальный git init + commit
gh repo create coworking-hub --private --source=. --remote=origin --push
# либо вручную: создайте пустой репозиторий на github.com,
# затем:
git remote add origin <URL вашего репозитория>
git push -u origin master
```

### 1. Сервер + бот — Render.com

Один Web Service обслуживает и API, и бота (бот встроен в тот же
процесс через `ENABLE_BOT=true`, чтобы оба использовали один и тот же
файл SQLite — на бесплатном тарифе Render не даёт постоянный диск
между разными сервисами).

1. Зарегистрируйтесь на [render.com](https://render.com) (можно через GitHub).
2. New → Blueprint → выберите ваш репозиторий. Render подхватит
   `render.yaml` из корня и предложит создать сервис `coworking-hub-api`
   с Root Directory `server`.
   - Если Blueprint недоступен — создайте New → Web Service вручную:
     Root Directory: `server`
     Build Command: `npm install && npm run build && npx prisma migrate deploy`
     Start Command: `npm start`
3. В Environment добавьте переменные (Render подставит остальное сам):
   - `BOT_TOKEN` — токен от `@BotFather`
   - `CLIENT_URL` — временно оставьте пустым, впишете после шага 2
   - `MINI_APP_URL` — то же самое
   - `DATABASE_URL=file:./dev.db`
   - `ENABLE_BOT=true`
4. Задеплойте и скопируйте публичный адрес сервиса, например
   `https://coworking-hub-api.onrender.com`.

### 2. Клиент — Vercel

1. Зарегистрируйтесь на [vercel.com](https://vercel.com) (можно через GitHub).
2. Add New → Project → импортируйте тот же репозиторий.
3. Root Directory: `client`. Framework Preset определится
   автоматически как Vite.
4. Environment Variables → добавьте `VITE_API_URL` со значением адреса
   Render-сервиса из шага 1 (без `/api` на конце, например
   `https://coworking-hub-api.onrender.com`).
5. Deploy. Получите адрес вида `https://coworking-hub.vercel.app`.

### 3. Свяжите адреса друг с другом

1. Вернитесь в Render → Environment сервиса `coworking-hub-api` и
   впишите реальные значения:
   - `CLIENT_URL=https://coworking-hub.vercel.app`
   - `MINI_APP_URL=https://coworking-hub.vercel.app`
2. Сохраните — сервис передеплоится и настроит кнопку меню бота
   автоматически при старте.
3. Готово: напишите `/start` вашему боту в Telegram — кнопка
   «Открыть коворкинги» теперь откроет полноценный Mini App.
4. По желанию — задайте тот же адрес через `@BotFather` → Bot Settings
   → Menu Button, чтобы кнопка была видна всегда, а не только после
   `/start`.

### Заметки о бесплатных тарифах

- Render free Web Service «засыпает» после ~15 минут без запросов и
  просыпается по первому обращению (первый запрос будет медленным).
- Файл SQLite на Render free — часть файловой системы контейнера: он
  переживает сон/перезапуск, но обнуляется при каждом новом деплое
  (`git push`). Для реальных данных со временем стоит перейти на
  постоянную БД (Postgres, напр. Neon/Supabase — бесплатно).

## Основные возможности

- **Карта** — метки коворкингов рядом, по клику показывается адрес,
  цена, удобства и ближайшие встречи в этом месте.
- **Встречи** — создание встречи с темой (например, "подготовка к
  экзамену"), выбор места из списка или своего адреса, лимит
  участников, список участников, присоединение/выход, отмена
  организатором.
- **Аренда** — заявка на бронирование коворкинга (дата, время,
  количество человек, комментарий), статус заявки виден на вкладке
  «Моё».
- **Уведомления через бота** — организатор получает сообщение, когда
  кто-то присоединяется к встрече; участникам приходит напоминание за
  30 минут до начала.

## Структура данных (Prisma)

- `User` — профиль из Telegram (id, имя, username, фото).
- `Place` — коворкинг: адрес, координаты, цена, удобства.
- `Session` — встреча: тема, время, место (или свой адрес),
  организатор, лимит участников.
- `Participant` — участие пользователя во встрече.
- `BookingRequest` — заявка на аренду места.

## Что осталось сделать перед реальным запуском

- Заменить тестовые координаты/цены коворкингов в
  `server/prisma/seed.ts` на настоящие.
- Разместить клиент и сервер на публичных HTTPS-адресах.
- Продумать подтверждение заявок на аренду (сейчас статус меняется
  только на `cancelled` пользователем; подтверждение админом места
  ещё не реализовано).
