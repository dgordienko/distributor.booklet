# Деплой Booklet за общим nginx (`https://dswapi.online/booklet/`)

Админка и backend запускаются в Docker рядом с существующим nginx и публикуются
на префиксе `/booklet/`. Наружу порты контейнеров не публикуются: доступ только
через nginx с TLS.

```
Интернет ─► nginx (443) ─ /booklet/ ─► booklet-admin:8080 ─ /api, /uploads ─► booklet-backend:4000
                                       (контейнер админки)                    (контейнер backend)
                  оба контейнера в общей сети distributor-api-shared-network,
                  отдельная сеть проекта не создаётся
```

## 0. Что должно быть на сервере

- Docker Compose версии **2.24 или новее** (в override-файле используется `!reset`):
  `docker compose version`.
- Контейнер nginx подключён к общей docker-сети, по умолчанию
  `distributor-api-shared-network`. Если сеть называется иначе, задайте её имя
  в `.env` через `SHARED_NETWORK`. Ниже в командах имя сети берётся из переменной
  `NET`, задайте её так же:

  ```bash
  NET=distributor-api-shared-network   # или значение SHARED_NETWORK из .env
  docker network inspect "$NET" | grep -i nginx
  ```
- Свободный доступ сервера к `https://<ваш-tenant>.auth0.com` (backend загружает
  ключи для проверки токенов).

## 1. Настройка Auth0

Делается один раз в Auth0 Dashboard.

**Приложение (Single Page Application)**, которое уже используется для админки.
Добавьте в него:

- Allowed Callback URLs: `https://dswapi.online/booklet` (без слэша в конце)
- Allowed Logout URLs: `https://dswapi.online/booklet`
- Allowed Web Origins: `https://dswapi.online` (только origin, **без пути**: браузер
  сообщает origin без `/booklet`, и с путём тихий вход и продление сессии не работают)

**API** (Applications → APIs → Create API):

- Name: любое, например `Booklet API`.
- Identifier: любой уникальный URL-идентификатор, например `https://booklet-api`.
  Он не обязан существовать. Это значение и есть `AUTH0_AUDIENCE`.
- Signing Algorithm: `RS256`.

**Доступ приложения к API.** В API откройте вкладку **Application Access** и в разделе
**User Access** (доступ от имени пользователя, не Machine-to-Machine) разрешите доступ
SPA-приложению админки. Без этого вход завершится ошибкой
`Client "<client id>" is not authorized to access resource server "https://booklet-api"`.
Пересборка после этой настройки не нужна, достаточно войти заново.

Без API все изменения (создание, редактирование, удаление, загрузка файлов)
будут отклоняться backend с ошибкой, а чтение останется доступным.

## 2. Получение кода

```bash
git clone git@github.com:dgordienko/distributor.booklet.git
cd distributor.booklet
git checkout main        # все изменения уже смержены в main
```

При обновлении: `git pull` в этой же папке.

## 3. Файл `.env`

Создайте `.env` в корне репозитория (рядом с `docker-compose.yml`) на основе `env.example`:

```env
AUTH0_DOMAIN=<tenant>.auth0.com
AUTH0_CLIENT_ID=<client id SPA-приложения>
# Identifier API из шага 1, должен совпадать посимвольно
AUTH0_AUDIENCE=https://booklet-api
# Префикс публикации, со слэшами с обеих сторон
BASE_PATH=/booklet/
# Только если общая сеть называется иначе
# SHARED_NETWORK=distributor-api-shared-network
# Если нужно переопределить адрес API устройств
# DEVICES_API_URL=http://<host>:8089/api/devices
```

Комментарии пишите отдельной строкой, не после значения.

**Проверка перед сборкой.** Убедитесь, что переменные реально доходят до compose.
Если `env.example` копировался целиком, строки `BASE_PATH` или `AUTH0_AUDIENCE` легко
пропустить или оставить закомментированными:

```bash
grep -nE '^(AUTH0_DOMAIN|AUTH0_CLIENT_ID|AUTH0_AUDIENCE|BASE_PATH)=' .env
docker compose -f docker-compose.yml -f docker-compose.nginx.yml config \
  | grep -E 'VITE_BASE_PATH|VITE_AUTH0_AUDIENCE|AUTH0_AUDIENCE|AUTH0_ISSUER_BASE_URL'
```

Должны быть видны все четыре строки `.env`, а в `config` значения
`VITE_BASE_PATH: /booklet/`, ваш `AUTH0_AUDIENCE` и
`AUTH0_ISSUER_BASE_URL: https://<tenant>.auth0.com/`. Пустое значение означает,
что переменная не задана: без `BASE_PATH` в браузере будет белый экран, без
`AUTH0_AUDIENCE` любое сохранение вернёт 503.

Важно:

- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_AUDIENCE` и `BASE_PATH` попадают в
  JS-бандл админки **при сборке образа**. После любого их изменения образ админки
  нужно пересобрать (шаг 4 делает это сам).
- Не задавайте `AUTH_DISABLED=true` на сервере: это отключает проверку токенов
  для записи и предназначено только для локальной разработки.
- Файл `.env` содержит рабочие настройки, не коммитьте его.

## 4. Запуск контейнеров

**Контейнеры нужно поднять до перезагрузки nginx** (см. шаг 5).

```bash
docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d --build --remove-orphans
docker compose -f docker-compose.yml -f docker-compose.nginx.yml ps
```

`--remove-orphans` удаляет контейнеры от старых имён сервисов (`backend`, `admin`),
если проект уже запускался до переименования. Иначе старая админка может удерживать
сетевое имя `booklet-admin`, и nginx будет отправлять запросы в устаревший стек.

Оба контейнера (`booklet-backend`, `booklet-admin`) должны быть в состоянии `healthy`.

Проверьте, что админка видна из сети nginx:

```bash
docker network inspect "$NET" | grep -i booklet
docker run --rm --network "$NET" curlimages/curl \
  -s -o /dev/null -w "%{http_code}\n" http://booklet-admin:8080/
# ожидается: 200
```

## 5. Настройка nginx

Готовый полный конфиг лежит в `deploy/app.conf`, фрагмент для вставки в существующий
конфиг: `deploy/nginx-booklet.conf`. Нужны три вещи:

1. На уровне `http` рядом с остальными `upstream`:

   ```nginx
   upstream booklet_admin {
       server booklet-admin:8080;
   }
   ```

2. В блок **`server { listen 443 ssl; ... }`** (не в блок на порту 80):

   ```nginx
   location = /booklet {
       return 301 $scheme://$http_host$uri/$is_args$args;
   }

   location ^~ /booklet/ {
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       auth_basic off;
       client_max_body_size 20m;
       proxy_pass http://booklet_admin/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       add_header X-Debug "Booklet-Admin";
   }
   ```

   Редирект `= /booklet` должен быть именно в блоке 443: на него возвращается
   пользователь после входа через Auth0 (`/booklet?code=...&state=...`).
   `^~` нужен, чтобы запросы не перехватывали regex-блоки `/(admin|config)` и
   другие. Слэш в конце `proxy_pass` срезает префикс `/booklet/`.

3. Проверить и применить конфиг:

   ```bash
   docker exec nginx nginx -t && docker exec nginx nginx -s reload
   ```

   Если контейнер `booklet-admin` не запущен, `nginx -t` и перезапуск завершатся
   ошибкой `host not found in upstream`, а это затронет и остальные сервисы
   на этом nginx.

## 6. Проверка

```bash
# редирект без слэша сохраняет параметры Auth0
curl -sI "https://dswapi.online/booklet?code=a&state=b" | grep -i location
# ожидается: Location: https://dswapi.online/booklet/?code=a&state=b

# админка отдаёт страницу, статика грузится с префикса
curl -s https://dswapi.online/booklet/ | grep -o '/booklet/assets/[^"]*'

# чтение API публично
curl -s https://dswapi.online/booklet/api/brand

# запись без токена запрещена
curl -s -o /dev/null -w "%{http_code}\n" -X PUT -H 'content-type: application/json' \
  -d '{"name":"x"}' https://dswapi.online/booklet/api/brand
# ожидается: 401

# существующий API не затронут
curl -s -o /dev/null -w "%{http_code}\n" https://dswapi.online/api/...
```

Затем откройте `https://dswapi.online/booklet/` в браузере, войдите через Auth0 и
проверьте: список товаров открывается, изменение бренда сохраняется, картинки
товаров и категорий отображаются.

## 7. Android-приложение

Backend отдаёт ссылки на картинки в виде `/uploads/...`. Для релизной сборки задайте
базовый адрес (со слэшем в конце, это требование Retrofit):

```
https://dswapi.online/booklet/
```

Сейчас в `ProductApi.kt` стоит `http://10.0.2.2:4000/` (адрес эмулятора).
Приложение только читает данные (`GET api/products|brand|categories`), токен ему
не нужен.

## 8. Обновление

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d --build --remove-orphans
```

Изменения в nginx применяйте как в шаге 5. После пересоздания контейнера
`booklet-admin` перезагрузите nginx (`nginx -s reload`): он запоминает IP
контейнера при старте.

## 9. Резервная копия данных

База (SQLite) и загруженные файлы лежат в docker-томе `backend_data`
(имя томов начинается с имени проекта compose; посмотреть: `docker volume ls | grep backend_data`).

Копируйте том только при остановленном backend: SQLite-файл, скопированный во время
записи, может оказаться повреждённым, а база и файлы попадут в архив из разных
моментов времени. На время копирования (обычно секунды) API недоступен.

```bash
C="docker compose -f docker-compose.yml -f docker-compose.nginx.yml"
$C stop booklet-backend
docker run --rm -v <имя_тома>:/data:ro -v "$PWD":/backup alpine \
  tar czf /backup/booklet-data-$(date +%F).tar.gz -C /data .
$C start booklet-backend
```

Если `tar` завершился ошибкой, всё равно выполните `$C start booklet-backend`.

Команда `docker compose down -v` **удаляет том вместе с данными**, не используйте
флаг `-v` на рабочем сервере.

## 10. Откат и отключение

1. Удалите из конфига nginx оба `location` для `/booklet` и `upstream booklet_admin`,
   затем `nginx -t && nginx -s reload`.
2. Остановите контейнеры: `docker compose -f docker-compose.yml -f docker-compose.nginx.yml down`
   (без `-v`).

## Частые проблемы

| Симптом | Причина и решение |
| --- | --- |
| nginx не стартует: `host not found in upstream "booklet-admin"` | Контейнер админки не запущен или не в сети `distributor-api-shared-network`. Выполните шаг 4, проверьте сеть, затем перезагрузите nginx. |
| `502 Bad Gateway` на `/booklet/` | Контейнер `booklet-admin` был пересоздан, внешний nginx держит старый IP: `nginx -s reload`. Либо контейнер не `healthy`: `docker compose -f docker-compose.yml -f docker-compose.nginx.yml ps`, затем `... logs booklet-admin`. |
| `/booklet` без слэша открывает чужой сервис (facade) | `location = /booklet` лежит не в блоке 443. Перенесите его (шаг 5). |
| После входа ошибка Auth0 `Callback URL mismatch` | В приложении Auth0 не добавлен `https://dswapi.online/booklet` (шаг 1). |
| Вход есть, но сохранение даёт 401 | Не создан API в Auth0 или `AUTH0_AUDIENCE` в `.env` не совпадает с его Identifier. После правки пересоберите образы (шаг 4). |
| Сохранение даёт 503: `Auth is not configured` | В `.env` не задан `AUTH0_AUDIENCE` или `AUTH0_DOMAIN`. Проверьте командами из шага 3 и пересоберите оба образа (шаг 4). |
| Белая страница; в DevTools → Network скрипты и стили грузятся с `/assets/...` (без `/booklet/`) и отвечают 503 или 404 | Образ собран без `BASE_PATH=/booklet/`, а `/assets/` на общем nginx перехватывает Dagster. Добавьте `BASE_PATH` в `.env`, проверьте командами из шага 3, пересоберите админку (`... up -d --build booklet-admin`) и выполните `nginx -s reload`. Проверка: `curl -s https://dswapi.online/booklet/ \| grep -o '/booklet/assets/[^"]*'` должна что-то найти. |
| Ошибка входа `Client "..." is not authorized to access resource server "..."` | SPA-приложению не выдан User Access к API в Auth0 (шаг 1, «Доступ приложения к API»). Пересборка не нужна. |
| Картинки не открываются | Образ собран без `BASE_PATH` (ссылки идут на `/uploads/...` мимо префикса) или Android использует старый базовый адрес. |
| `could not find an available, non-overlapping IPv4 address pool` | Запуск без `-f docker-compose.nginx.yml`: базовый compose создаёт свою сеть, а свободных адресных пулов Docker на сервере нет. Запускайте всегда с обоими файлами. |
| Загрузка файла отклоняется (`413`) | Лимит 20 МБ задан в nginx на сервере и в контейнере админки; для больших файлов увеличьте `client_max_body_size` в обоих местах. |
