# admin-web

Панель администратора каталога. React 18, TypeScript, Vite 5, React Router 6,
Auth0 (`@auth0/auth0-react`), редактор описаний TipTap.

## Структура

```
admin-web/
├── index.html               шрифты (Archivo, Azeret Mono), установка темы до отрисовки
├── vite.config.ts           base (префикс публикации), прокси /api и /uploads в dev
├── nginx/default.conf       nginx контейнера: SPA, кеш /assets, прокси на backend
├── Dockerfile               сборка бандла и nginx-unprivileged
└── src/
    ├── main.tsx             Auth0Provider, роутер, провайдеры темы, языка и поиска
    ├── App.tsx              шапка, навигация, вход и выход, маршруты
    ├── api/client.ts        типы и вызовы API, Bearer-токен для записи
    ├── lib/basePath.ts      префикс публикации, assetUrl() для /uploads
    ├── pages/               экраны (см. ниже)
    ├── components/          Button, RichTextEditor, иконки
    ├── context/             ThemeContext, LocaleContext, SearchContext
    ├── i18n/translations.ts строки RU / UK / EN
    └── styles.css           дизайн-токены и стили (тёмная и светлая тема)
```

## Экраны

| Маршрут | Экран | Что можно делать |
| --- | --- | --- |
| `/` | Товары | Товары сгруппированы по категориям; фильтр по категории в боковой панели, поиск по названию в шапке. Стрелками внутри группы меняется порядок товаров в этой категории. Скрытые товары отмечены бейджем «скрыт» |
| `/products/new`, `/products/:id` | Товар | Поля товара, описание в rich-text редакторе (HTML), категории (несколько), флаг «Показывать на планшете», фото: загрузка, выбор главного, удаление |
| `/categories` | Категории | Разделы буклета, поиск по названию в шапке. Порядок в списке (стрелки) определяет порядок разделов на планшете |
| `/categories/new`, `/categories/:id` | Категория | Название, описание, изображение раздела, привязка к командам |
| `/brand` | Обложка | Название бренда, слоган, логотип |
| `/teams` | Команды | Список команд и кнопка синхронизации из внешнего API устройств |

Пока пользователь не вошёл, показывается только экран входа.

## Конфигурация

Переменные `VITE_*` попадают в бандл **при сборке** (Vite подставляет их на
этапе build). После их изменения бандл нужно пересобрать.

| Переменная | Где задаётся | Назначение |
| --- | --- | --- |
| `VITE_AUTH0_DOMAIN` | `admin-web/.env` (локально), `AUTH0_DOMAIN` в корневом `.env` (Docker) | Домен tenant'а Auth0 |
| `VITE_AUTH0_CLIENT_ID` | то же, `AUTH0_CLIENT_ID` | Client ID SPA-приложения |
| `VITE_AUTH0_AUDIENCE` | то же, `AUTH0_AUDIENCE` | Identifier API: для него запрашивается access-токен |
| `VITE_BASE_PATH` | `BASE_PATH` в корневом `.env` (Docker) | Префикс публикации, например `/booklet/`. По умолчанию `/` |

Шаблон для локальной разработки: [`admin-web/example.env`](../admin-web/example.env).

## Авторизация

- Вход и выход идут через Auth0. `redirect_uri` и `returnTo` равны
  `origin + префикс` (например `https://dswapi.online/booklet`). Эти адреса
  должны быть разрешены в приложении Auth0: Callback и Logout URLs. В Web
  Origins указывается только origin, без пути.
- `App.tsx` передаёт в `api/client.ts` провайдер токена
  (`getAccessTokenSilently`). Клиент добавляет `Authorization: Bearer` ко всем
  запросам, кроме GET. Чтение идёт без токена.
- Если audience не настроен или у приложения нет доступа к API, вход или
  сохранение завершится ошибкой. Решения перечислены в
  [deploy/DEPLOY.md](../deploy/DEPLOY.md), в разделе «Частые проблемы».

## Публикация под префиксом

`lib/basePath.ts` берёт префикс из `import.meta.env.BASE_URL`, который Vite
выставляет по `base`. От него зависят:

- адрес API: `${BASE_PATH}/api`;
- ссылки на файлы: `assetUrl("/uploads/x.png")` даёт `/booklet/uploads/x.png`;
- `basename` роутера и адреса редиректа Auth0.

Внутренний nginx контейнера всегда работает от корня. Префикс срезает внешний
nginx (`proxy_pass http://booklet_admin/;`).

## Темы и язык

- **Тема:** тёмная и светлая (дизайн «Degree Zero», токены в начале
  `styles.css`). Выбор хранится в `localStorage` (`admin-theme`), по
  умолчанию берётся системная тема. Тема ставится скриптом в `index.html` до
  отрисовки, поэтому нет мигания.
- **Язык:** RU, UK, EN, переключатель в шапке. Выбор хранится в
  `localStorage` (`admin-locale`), по умолчанию берётся язык браузера.

## Разработка

```bash
npm run dev:admin        # http://localhost:5173, /api проксируется на :4000
npm run build --workspace admin-web
npm run lint --workspace admin-web
```

Тестов у админки пока нет. vitest 1.x без тестовых файлов завершается с
кодом 1, поэтому `npm run test` в корне падает на шаге admin-web. Backend
тестируется отдельно: `npm run test --workspace backend`.
