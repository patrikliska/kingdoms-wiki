# Report endpoint

Turns "Suggest a correction" reports from the app into GitHub issues, so players don't need a GitHub
account. It is the project's only server code: no database, no accounts, and the GitHub token never
reaches the browser.

```
app form ──POST JSON──► endpoint ──► Turnstile check ──► GitHub API: create issue
                        (Cloudflare Worker now, Node on our own server later)
```

- `src/handler.ts` – the logic. Uses only `fetch`/`Request`/`Response`, so it runs anywhere.
- `src/index.ts` – Cloudflare Worker entry; `wrangler.toml` holds its config.
- `src/node-server.ts` – the same endpoint as a plain Node server (local dev, own server later).
- Validation and issue formatting are shared with the app: `src/domain/report.ts`.

Protection: allowed origins only (CORS), Cloudflare Turnstile, a per-IP rate limit (5 a minute), a
honeypot field, input length limits, and `@mentions` in player text are defused.

Issues get the labels `from-web`, `needs-triage`, `kind:<data|translation|bug|idea>` and
`module:<quests|buildings|units|walls|tribes>`.

## Local development

```sh
pnpm report:dev   # dry run on http://localhost:8787 – prints issues instead of creating them
pnpm dev          # Vite proxies /api/report to it (.env.development)
```

`.env.development` uses Cloudflare's Turnstile test keys, which always pass.

## Going live (one-time setup)

1. **GitHub token** – github.com → Settings → Developer settings → Fine-grained tokens → new token:
   repository access _Only select repositories → kingdoms-wiki_, permission _Issues: Read and write_.
2. **Turnstile** – Cloudflare dashboard → Turnstile → Add widget: hostname `patrikliska.github.io`
   (add `localhost` for testing), mode _Managed_. Note the site key and the secret key.
3. **Deploy the Worker** (free Cloudflare account):
   ```sh
   pnpm dlx wrangler login
   pnpm dlx wrangler secret put GITHUB_TOKEN --config worker/wrangler.toml
   pnpm dlx wrangler secret put TURNSTILE_SECRET --config worker/wrangler.toml
   pnpm report:deploy
   ```
   Wrangler prints the URL, e.g. `https://kingdoms-report.<account>.workers.dev`.
4. **Tell the site about it** – GitHub repo → Settings → Secrets and variables → Actions →
   _Variables_: `REPORT_ENDPOINT` = the Worker URL, `TURNSTILE_SITE_KEY` = the site key. Re-run the
   deploy workflow (or push to `master`).

Until step 4 is done, the form opens a pre-filled GitHub issue instead (players need a GitHub account
for that).

## Moving to our own server

Run the Node version behind nginx (Node 24+ runs the TypeScript directly):

```sh
GITHUB_TOKEN=… TURNSTILE_SECRET=… TRUST_PROXY=true \
ALLOWED_ORIGINS=https://<our-domain> SITE_URL=https://<our-domain> \
PORT=8787 node worker/src/node-server.ts
```

```nginx
location = /api/report {
  proxy_pass http://127.0.0.1:8787/;
  proxy_set_header X-Real-IP $remote_addr;
}
```

Then build the site with `VITE_REPORT_ENDPOINT=/api/report` and update the Turnstile widget's
hostname.
