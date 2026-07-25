CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT,
  organizations TEXT,
  awards TEXT,
  venue TEXT,
  year INTEGER,
  abstract TEXT,
  doi TEXT,
  arxiv_id TEXT,
  source_url TEXT,
  pdf_url TEXT,
  citation_count INTEGER,
  keywords TEXT,
  venue_memberships TEXT,
  topics TEXT,
  report_path TEXT,
  search_terms TEXT,
  updated_at REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_papers_year_venue ON papers(year DESC, venue, title);
CREATE INDEX IF NOT EXISTS idx_papers_venue_year ON papers(venue, year DESC, title);

CREATE VIRTUAL TABLE IF NOT EXISTS paper_search USING fts5(
  id UNINDEXED,
  title,
  authors,
  organizations,
  abstract,
  keywords,
  search_terms,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS papers_ai AFTER INSERT ON papers BEGIN
  INSERT INTO paper_search(id,title,authors,organizations,abstract,keywords,search_terms)
  VALUES (new.id,new.title,new.authors,new.organizations,new.abstract,new.keywords,new.search_terms);
END;

CREATE TRIGGER IF NOT EXISTS papers_ad AFTER DELETE ON papers BEGIN
  DELETE FROM paper_search WHERE id=old.id;
END;

CREATE TRIGGER IF NOT EXISTS papers_au AFTER UPDATE ON papers BEGIN
  DELETE FROM paper_search WHERE id=old.id;
  INSERT INTO paper_search(id,title,authors,organizations,abstract,keywords,search_terms)
  VALUES (new.id,new.title,new.authors,new.organizations,new.abstract,new.keywords,new.search_terms);
END;

