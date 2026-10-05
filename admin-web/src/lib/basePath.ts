// Админка может быть опубликована не от корня домена (например, за общим
// nginx на /booklet/). Префикс задаётся при сборке через VITE_BASE_PATH.
// BASE_URL у Vite всегда оканчивается на "/", здесь храним вариант без него.
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

// Бэкенд хранит ссылки на файлы как "/uploads/..." — добавляем префикс
// публикации. Абсолютные URL (http://, //) остаются как есть.
export function assetUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${BASE_PATH}${path}`;
}
