import { Env, ftsQuery, integer, json } from "../_lib";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();
  if (!query) return json({ matches: [], total: 0 });
  const match = ftsQuery(query);
  if (!match) return json({ matches: [], total: 0 });
  const limit = integer(url.searchParams.get("limit"), 50, 1, 100);
  const venue = (url.searchParams.get("venue") || "").toUpperCase();
  const year = integer(url.searchParams.get("year"), 0, 0, 3000);
  const clauses = ["paper_search MATCH ?"];
  const values: unknown[] = [match];
  if (venue) { clauses.push("p.venue=?"); values.push(venue); }
  if (year) { clauses.push("p.year=?"); values.push(year); }
  const result = await env.DB.prepare(`
    SELECT p.id,p.title,p.authors,p.organizations,p.awards,p.venue,p.year,p.abstract,
      p.doi,p.arxiv_id,p.source_url,p.pdf_url,p.citation_count,p.keywords,
      p.venue_memberships,p.topics,p.report_path,bm25(paper_search) AS rank
    FROM paper_search JOIN papers p ON p.id=paper_search.id
    WHERE ${clauses.join(" AND ")}
    ORDER BY rank,p.year DESC LIMIT ?
  `).bind(...values, limit).all();
  return json({ matches: result.results, total: result.results.length });
};

