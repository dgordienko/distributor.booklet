# distributor.mobile.presenter

Система для торгового представителя. В веб-админке редактируется каталог
(товары, фото, описания, разделы, обложка), а Android-планшет в торговой точке
показывает его покупателю в виде листаемого буклета.

Исходное описание идеи: [draft.md](./draft.md). Дизайн-система админки: [DESIGN.md](./DESIGN.md).

## Состав

| Проект | Стек | Назначение | Документация |
| --- | --- | --- | --- |
| [`backend/`](./backend) | Node.js 20, Express, TypeScript, Prisma, SQLite | REST API каталога, хранение фото | [docs/backend.md](./docs/backend.md) |
| [`admin-web/`](./admin-web) | React 18, TypeScript, Vite, Auth0 | Панель администратора каталога | [docs/admin-web.md](./docs/admin-web.md) |
| [`android/`](./android) | Kotlin, Jetpack Compose, Retrofit, Coil | Буклет на планшете (только чтение) | [docs/android.md](./docs/android.md) |
| [`deploy/`](./deploy) | Docker Compose, nginx | Публикация за общим nginx | [deploy/DEPLOY.md](./deploy/DEPLOY.md) |

Как компоненты связаны между собой, модель данных и авторизация описаны в
[docs/architecture.md](./docs/architecture.md).

```
                    ┌──────────────────────┐
  Администратор ──► │ admin-web (браузер)  │──┐ запись: Bearer-токен Auth0
                    └──────────────────────┘  │
                                              ▼
                                      ┌──────────────┐     ┌──────────────┐
                                      │   backend    │────►│ SQLite +     │
                                      │  /api, /uploads    │ uploads/     │
                                      └──────────────┘     └──────────────┘
                                              ▲
                    ┌──────────────────────┐  │ чтение: GET без токена
  Покупатель ◄───── │ android (планшет)    │──┘
                    └──────────────────────┘
```

Продакшен: `https://dswapi.online/booklet/` (админка, API и файлы за одним префиксом).

## Быстрый старт (локальная разработка)

Нужны Node.js 20+ и npm. Репозиторий — npm workspaces (`backend`, `admin-web`)
с одним `package-lock.json` в корне.

```bash
npm install

# backend: SQLite-база, папка для загрузок, отключённая проверка токенов
cp backend/example.env backend/.env          # в нём уже AUTH_DISABLED=true
npm run --workspace backend prisma:migrate
npm run dev:backend                          # http://localhost:4000

# admin-web: нужны данные SPA-приложения Auth0
cp admin-web/example.env admin-web/.env      # заполните VITE_AUTH0_*
npm run dev:admin                            # http://localhost:5173
```

Vite проксирует `/api` и `/uploads` на `http://localhost:4000`, так что
админка и backend работают как один сайт.

В приложении Auth0 для локального входа должен быть разрешён адрес
`http://localhost:5173` (Callback, Logout URLs и Web Origins).

Android-приложение открывается в Android Studio из папки `android/`. Адрес
backend задан константой `BASE_URL` (см. [docs/android.md](./docs/android.md)).

### Через Docker

```bash
cp env.example .env          # заполните AUTH0_*; для локальной записи без Auth0 API: AUTH_DISABLED=true
docker compose up -d --build
# админка: http://localhost:8080, backend: http://localhost:4000
```

## Команды

| Действие | Команда |
| --- | --- |
| Установить зависимости (backend + admin-web) | `npm install` |
| Backend в dev-режиме (hot reload) | `npm run dev:backend` |
| Admin-web в dev-режиме (Vite) | `npm run dev:admin` |
| Prisma: создать или обновить схему SQLite | `npm run --workspace backend prisma:migrate` |
| Prisma Studio (просмотр БД) | `npm run --workspace backend prisma:studio` |
| Собрать backend и admin-web | `npm run build` |
| Lint backend и admin-web | `npm run lint` |
| Тесты backend | `npm run test --workspace backend` (у admin-web тестов пока нет) |
| Android: debug APK | `cd android && ./gradlew assembleDebug` |
| Android: unit-тесты | `cd android && ./gradlew test` |

Gradle 9 требует JDK 17+. Если в `PATH` более старый JDK, укажите JDK из Android Studio:
`export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`.

## Ветки

- `dev` — основная ветка разработки (не удалять).
- `main` — стабильная ветка, изменения попадают через PR из `dev`.
