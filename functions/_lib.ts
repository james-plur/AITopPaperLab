export interface Env {
  DB: D1Database;
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": status === 200 ? "public, max-age=60, s-maxage=300" : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function integer(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export function searchTokens(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  const tokens = new Set<string>();
  for (const part of normalized.split(/[\s,;:!?()[\]]+/)) {
    if (!part) continue;
    const english = part.replace(/[^\x00-\x7f]/g, "");
    if (english.length > 1) tokens.add(english);
    for (const segment of part.match(/[\u4e00-\u9fff]+/g) || []) {
      if (segment.length === 1) tokens.add(segment);
      for (let index = 0; index < segment.length - 1; index += 1) {
        tokens.add(segment.slice(index, index + 2));
      }
    }
  }
  return [...tokens].slice(0, 20);
}

export function ftsQuery(query: string): string {
  return searchTokens(query)
    .map((token) => `"${token.replaceAll('"', '""')}"`)
    .join(" OR ");
}

