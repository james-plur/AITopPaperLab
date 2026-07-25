import { Env, json } from "../../_lib";

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id || "");
  const paper = await env.DB.prepare(`SELECT id,title,authors,organizations,awards,venue,year,
    abstract,doi,arxiv_id,source_url,pdf_url,citation_count,keywords,
    venue_memberships,topics,report_path FROM papers WHERE id=?`).bind(id).first();
  return paper ? json(paper) : json({ error: "paper not found" }, 404);
};

