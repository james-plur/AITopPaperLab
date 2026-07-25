import { Env, json } from "../_lib";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const [total, venues, years] = await env.DB.batch([
    env.DB.prepare("SELECT count(*) AS count FROM papers"),
    env.DB.prepare("SELECT venue, count(*) AS count FROM papers WHERE venue!='' GROUP BY venue ORDER BY venue"),
    env.DB.prepare("SELECT year, count(*) AS count FROM papers WHERE year IS NOT NULL GROUP BY year ORDER BY year DESC"),
  ]);
  return json({
    total: Number((total.results[0] as { count?: number | string } | undefined)?.count || 0),
    venues: venues.results,
    years: years.results,
  });
};
