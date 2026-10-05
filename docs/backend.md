# backend

REST API каталога. Node.js 20, Express 4, TypeScript, Prisma 5, SQLite.

## Структура

```
backend/
├── prisma/
│   ├── schema.prisma        модель данных (см. docs/architecture.md)
│   └── migrations/          миграции SQLite
├── src/
│   ├── index.ts             точка входа: dotenv + listen
│   ├── app.ts               createApp(): middleware и роутеры
│   ├── routes/              маршруты: products, categories, brand, teams
│   ├── controllers/         разбор запроса, валидация, коды ответа
│   ├── services/            работа с Prisma и внешним API устройств
│   ├── middleware/
│   │   ├── upload.ts        multer: сохранение файлов в UPLOADS_DIR
│   │   └── requireAuth.ts   проверка Auth0-токена для записи
│   ├── db/client.ts         PrismaClient
│   └── __tests__/           vitest + supertest
├── Dockerfile               многоэтапная сборка, запуск от непривилегированного пользователя
└── docker-entrypoint.sh     prisma migrate deploy перед стартом
```

## Конфигурация

Переменные читаются из окружения. Локально они берутся из `backend/.env`
через `dotenv` (шаблон: [`backend/example.env`](../backend/example.env)).

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `PORT` | `4000` | Порт HTTP-сервера |
| `DATABASE_URL` | — | Путь к SQLite, например `file:./dev.db` (в Docker: `file:/data/app.db`) |
| `UPLOADS_DIR` | `./uploads` | Папка для загруженных файлов (в Docker: `/data/uploads`), создаётся при старте |
| `AUTH0_ISSUER_BASE_URL` | — | `https://<tenant>.auth0.com/`; в Docker собирается из `AUTH0_DOMAIN` |
| `AUTH0_AUDIENCE` | — | Identifier API в Auth0 |
| `AUTH_DISABLED` | `false` | `true` отключает проверку токенов для записи. **Только для локальной разработки** |
| `DEVICES_API_URL` | `http://194.247.12.105:8089/api/devices` | Внешний API устройств для синхронизации команд |

Запись (`POST`/`PUT`/`PATCH`/`DELETE`) разрешена в трёх случаях:
- заданы оба `AUTH0_*` и запрос несёт валидный токен;
- `AUTH_DISABLED=true`;
- иначе запись отвечает `503` (fail closed), а чтение работает всегда.

## API

Базовый путь — `/api`. Ответы в JSON. Файлы загружаются как
`multipart/form-data` в указанное поле. 🔒 — нужен Auth0 access-токен в
заголовке `Authorization: Bearer <token>`.

### Служебное

| Метод | Путь | Описание |
| --- | --- | --- |
| GET | `/health` | `{"status":"ok"}`, используется healthcheck'ом Docker (вне `/api`) |
| GET | `/uploads/<файл>` | Загруженные файлы (статика) |

### Товары

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| GET | `/api/products` | — | Все товары (включая скрытые) с `photos` и `categories: [{categoryId, order}]`, по дате создания |
| GET | `/api/products/:id` | — | Товар или `404` |
| POST 🔒 | `/api/products` | `name`, `description` (обязательны), `manufacturer`, `trademark`, `productType`, `shelfLife`, `storageTemperature`, `composition`, `basePrice`, `currency`, `isActive`, `categoryIds: number[]` | `201` + товар; `400`, если нет `name` или `description` |
| PUT 🔒 | `/api/products/:id` | Те же поля, все необязательные. `categoryIds` полностью заменяет набор категорий | Товар |
| DELETE 🔒 | `/api/products/:id` | — | `204`. Фото и связи удаляются каскадно (файлы на диске остаются) |
| POST 🔒 | `/api/products/:id/move` | `{ "categoryId": number, "direction": "up" \| "down" }` | Все товары. Меняет порядок товара внутри указанной категории |
| POST 🔒 | `/api/products/:id/photos` | поле `photo` | `201` + фото. Первое фото становится главным |
| DELETE 🔒 | `/api/products/:id/photos/:photoId` | — | `204`. Если удалено главное, главным становится следующее |
| POST 🔒 | `/api/products/:id/photos/:photoId/primary` | — | Товар с новым главным фото |

### Категории (разделы буклета)

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| GET | `/api/categories` | — | Категории по `order` с `teams` |
| GET | `/api/categories/:id` | — | Категория или `404` |
| POST 🔒 | `/api/categories` | `name` (обязательно), `description`, `teamIds: number[]` | `201` + категория, ставится в конец списка |
| PUT 🔒 | `/api/categories/:id` | `name`, `description`, `teamIds` (заменяет набор команд) | Категория |
| DELETE 🔒 | `/api/categories/:id` | — | `204`. Связи с товарами удаляются, сами товары остаются |
| POST 🔒 | `/api/categories/:id/move` | `{ "direction": "up" \| "down" }` | Все категории |
| POST 🔒 | `/api/categories/:id/image` | поле `image` | Категория с новым `imageUrl` |

### Обложка

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| GET | `/api/brand` | — | Бренд (создаётся пустым при первом запросе) |
| PUT 🔒 | `/api/brand` | `name`, `tagline` | Бренд |
| POST 🔒 | `/api/brand/logo` | поле `logo` | Бренд с новым `logoUrl` |

### Команды

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| GET | `/api/teams` | — | Команды по `frcName`; `frcId` приводится к number |
| POST 🔒 | `/api/teams/sync` | — | Загружает устройства из `DEVICES_API_URL`, сохраняет уникальные `frcId`/`frcName` и возвращает список команд. Если внешний API недоступен, отвечает `502` |

### Ошибки авторизации

| Код | Когда |
| --- | --- |
| `401` | Нет токена или токен невалиден: подпись, издатель, audience, срок действия |
| `403` | Токен валиден, но недостаточно прав (зарезервировано, сейчас не используется) |
| `503` | Auth0 в backend не настроен (`AUTH0_ISSUER_BASE_URL` или `AUTH0_AUDIENCE`) |

## База данных и миграции

- Схема меняется в `prisma/schema.prisma`, затем
  `npm run --workspace backend prisma:migrate` создаёт миграцию и применяет её
  к локальной базе.
- В Docker при каждом старте контейнера `docker-entrypoint.sh` выполняет
  `prisma migrate deploy` и применяет только новые миграции.
- Просмотр данных: `npm run --workspace backend prisma:studio`.

## Тесты

```bash
npm run test --workspace backend
```

- `health.test.ts` — эндпоинт `/health`.
- `auth.test.ts` — middleware авторизации: чтение открыто, запись без токена
  или с битым токеном получает `401`, без настройки `503`, при `AUTH_DISABLED`
  запись проходит.

## Известные ограничения

- Валидация входных данных минимальная: проверяются только обязательные поля и
  типы `teamIds` и `direction`.
- **Ошибки в асинхронных обработчиках роняют процесс.** Express 4 не
  перехватывает отклонённые промисы, а Node 20 завершает процесс на
  необработанном reject. Проверено: `PUT /api/products/999` (несуществующий
  товар) обрывает соединение и останавливает backend. В Docker его снова
  поднимает `restart: unless-stopped`, но запросы в этот момент теряются. То же
  относится к любому `update` или `delete` с несуществующим id и к другим
  ошибкам Prisma. Нужна обёртка для async-обработчиков и ответ `404`.
- Загрузки не ограничены по типу и размеру на уровне backend. Размер
  ограничивает nginx (`client_max_body_size 20m`). Файлы удалённых фото и
  товаров остаются на диске.
- `GET /api/products` отдаёт и скрытые товары (`isActive = false`), фильтрует
  их Android-приложение.
