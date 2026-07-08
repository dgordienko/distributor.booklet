// Превью текста для карточки: убираем теги и схлопываем пробелы/переносы,
// которые оставляют абзацы и списки Tiptap.
export function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|li|div|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
