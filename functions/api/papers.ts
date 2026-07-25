import { Env, integer, json } from "../_lib";

const PUBLIC_COLUMNS = `id,title,authors,organizations,awards,venue,year,abstract,doi,
  arxiv_id,source_url,pdf_url,citation_count,keywords,venue_memberships,topics,report_path`;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const page = integer(url.searchParams.get("page"), 1, 1, 100000);
  const perPage = integer(url.searchParams.get("per_page"), 50, 10, 100);
  const venue = (url.searchParams.get("venue") || "").toUpperCase();
  const year = integer(url.searchParams.get("year"), 0, 0, 3000);
  const clauses: string[] = ["1=1"];
  const values: unknown[] = [];
  if (venue) { clauses.push("venue=?"); values.push(venue); }
  if (year) { clauses.push("year=?"); values.push(year); }
  const where = clauses.join(" AND ");
  const offset = (page - 1) * perPage;
  const [countResult, papersResult] = await env.DB.batch([
    env.DB.prepare(`SELECT count(*) AS count FROM papers WHERE ${where}`).bind(...values),
    env.DB.prepare(`SELECT ${PUBLIC_COLUMNS} FROM papers WHERE ${where}
      ORDER BY year DESC,venue,title LIMIT ? OFFSET ?`).bind(...values, perPage, offset),
  ]);
  const countRow = countResult.results[0] as { count?: number | string } | undefined;
  const total = Number(countRow?.count || 0);
  return json({
    page,
    per_page: perPage,
    total,
    pages: Math.ceil(total / perPage),
    papers: papersResult.results,
  });
};
