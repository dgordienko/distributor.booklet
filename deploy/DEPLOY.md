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
- Контейнер nginx подключён к docker-сети `distributor-api-shared-network`:
  `docker network inspect distributor-api-shared-network | grep -i nginx`.
  Если сеть называется иначе, задайте её имя в `.env` через `SHARED_NETWORK`.
- Свободный доступ сервера к `https://<ваш-tenant>.auth0.com` (backend загружает
  ключи для проверки токенов).

## 1. Настройка Auth0

Делается один раз в Auth0 Dashboard.

**Приложение (Single Page Application)**, которое уже используется для админки.
Добавьте в него адрес `https://dswapi.online/booklet` (без слэша в конце) в поля:

- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

**API** (Applications → APIs → Create API):

- Name: любое, например `Booklet API`.
- Identifier: любой уникальный URL-идентификатор, например `https://booklet-api`.
  Он не обязан существовать. Это значение и есть `AUTH0_AUDIENCE`.
- Signing Algorithm: `RS256`.

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
AUTH0_AUDIENCE=https://booklet-api        # Identifier API из шага 1
BASE_PATH=/booklet/                       # префикс публикации, со слэшами с обеих сторон
# SHARED_NETWORK=distributor-api-shared-network   # только если имя сети другое
# DEVICES_API_URL=http://<host>:8089/api/devices  # если нужно переопределить
```

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
docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.nginx.yml ps
```

Оба контейнера (`booklet-backend`, `booklet-admin`) должны быть в состоянии `healthy`.

Проверьте, что админка видна из сети nginx:

```bash
docker network inspect distributor-api-shared-network | grep -i booklet
docker run --rm --network distributor-api-shared-network curlimages/curl \
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
docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d --build
```

Изменения в nginx применяйте как в шаге 5. После пересоздания контейнера
`booklet-admin` перезагрузите nginx (`nginx -s reload`): он запоминает IP
контейнера при старте.

## 9. Резервная копия данных

База (SQLite) и загруженные файлы лежат в docker-томе `backend_data`
(имя томов начинается с имени проекта compose; посмотреть: `docker volume ls | grep backend_data`).

```bash
docker run --rm -v <имя_тома>:/data -v "$PWD":/backup alpine \
  tar czf /backup/booklet-data-$(date +%F).tar.gz -C /data .
```

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
| `502 Bad Gateway` на `/booklet/` | Контейнер был пересоздан, nginx держит старый IP: `nginx -s reload`. Либо контейнер не `healthy`: `docker compose -f docker-compose.yml -f docker-compose.nginx.yml ps`, затем `... logs booklet-admin`. |
| `/booklet` без слэша открывает чужой сервис (facade) | `location = /booklet` лежит не в блоке 443. Перенесите его (шаг 5). |
| После входа ошибка Auth0 `Callback URL mismatch` | В приложении Auth0 не добавлен `https://dswapi.online/booklet` (шаг 1). |
| Вход есть, но сохранение даёт 401 | Не создан API в Auth0 или `AUTH0_AUDIENCE` в `.env` не совпадает с его Identifier. После правки пересоберите образы (шаг 4). |
| Сохранение даёт 503: `Auth is not configured` | В `.env` не задан `AUTH0_AUDIENCE` или `AUTH0_DOMAIN`. |
| Белая страница, ошибки 404 на `/assets/...` | Образ собран без `BASE_PATH=/booklet/`. Задайте переменную в `.env` и выполните шаг 4. |
| Картинки не открываются | Образ собран без `BASE_PATH` (ссылки идут на `/uploads/...` мимо префикса) или Android использует старый базовый адрес. |
| `could not find an available, non-overlapping IPv4 address pool` | Запуск без `-f docker-compose.nginx.yml`: базовый compose создаёт свою сеть, а свободных адресных пулов Docker на сервере нет. Запускайте всегда с обоими файлами. |
| Загрузка файла отклоняется (`413`) | Лимит 20 МБ задан в nginx на сервере и в контейнере админки; для больших файлов увеличьте `client_max_body_size` в обоих местах. |
