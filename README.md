# AI Top Paper Lab

Public, read-only edition of PaperLab, deployed with Cloudflare Pages, Pages Functions, and D1.

The public application contains paper metadata, external PDF links, and locally generated reports. Collection, editing, PDF processing, and LLM report generation remain in the private local PaperLab installation.

## Local development

```bash
npm install
npx wrangler d1 execute ai-top-paper-lab --local --file=schema.sql
npm run dev
```

The production D1 binding is configured in `wrangler.toml` after the database is created.

