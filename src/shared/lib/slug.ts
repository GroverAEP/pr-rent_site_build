export function generateSlug(text: string, suffix?: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (suffix) {
    return `${base}-${suffix}`;
  }
  return base;
}

export function randomSuffix(length = 6): string {
  return Math.random().toString(36).substring(2, 2 + length);
}
