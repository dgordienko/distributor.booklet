# distributor.mobile.presenter

Система для торгового представителя: позволяет редактировать контент о товарах
(текст, фото, описания) и показывать его покупателю на экране планшета в
торговой точке.

См. [draft.md](./draft.md) для исходного описания идеи.

## Состав репозитория

- **backend/** — Express + TypeScript API. Хранит товары (текст, фото) в
  SQLite (Prisma), фото — в `backend/uploads/`.
- **admin-web/** — React + TypeScript (Vite) панель администратора для
  редактирования товаров, добавления фото и описаний.
- **android/** — Kotlin/Jetpack Compose приложение для планшета, которое
  получает товары через API backend и показывает их покупателю.

## Быстрый старт

```bash
npm install
cp backend/example.env backend/.env
npm run --workspace backend prisma:migrate
npm run dev:backend   # http://localhost:4000
npm run dev:admin     # http://localhost:5173
```

Android-приложение открывается отдельно в Android Studio: `android/`.
Адрес backend для эмулятора по умолчанию — `http://10.0.2.2:4000`
(см. `android/app/src/main/java/com/distributor/presenter/data/ProductApi.kt`).

## Команды

| Действие | Команда |
|---|---|
| Установить зависимости (backend + admin-web) | `npm install` |
| Backend в dev-режиме (ts-node-dev, hot reload) | `npm run dev:backend` |
| Admin-web в dev-режиме (Vite) | `npm run dev:admin` |
| Prisma миграция (создать/обновить SQLite схему) | `npm run --workspace backend prisma:migrate` |
| Prisma Studio (просмотр БД) | `npm run --workspace backend prisma:studio` |
| Собрать backend и admin-web | `npm run build` |
| Lint backend и admin-web | `npm run lint` |
| Тесты backend и admin-web | `npm run test` |
| Android: сборка debug APK | `cd android && ./gradlew assembleDebug` |
| Android: unit-тесты | `cd android && ./gradlew test` |
