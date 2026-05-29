import { sanitize, sanitizeHTML } from "./sanitize";

export function renderMarkdown(text: string): string {
  const escaped = sanitize(text);
  const withMarkup = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
  return sanitizeHTML(withMarkup);
}
