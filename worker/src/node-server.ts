/**
 * The report endpoint as a plain Node server: `pnpm report:dev` locally, and the way to run it on
 * our own server later (behind nginx). Node 24 runs this TypeScript file directly.
 *
 * Without GITHUB_TOKEN it runs as a dry run: issues are printed to the console, nothing reaches
 * GitHub, and Turnstile uses Cloudflare's always-pass test secret.
 *
 * Env: PORT, GITHUB_REPO, GITHUB_TOKEN, TURNSTILE_SECRET, ALLOWED_ORIGINS, SITE_URL,
 * TRUST_PROXY ("true" behind nginx, which sets X-Real-IP).
 */
import { createServer } from 'node:http';
import { createMemoryLimiter, handleReport, type ReportEnv } from './handler.ts';

const TEST_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA';
const MAX_BODY_BYTES = 64_000;

const { GITHUB_TOKEN, TURNSTILE_SECRET } = process.env;
const dryRun = !GITHUB_TOKEN || process.env.DRY_RUN === 'true';
if (!dryRun && !TURNSTILE_SECRET) {
  console.error('TURNSTILE_SECRET is required when GITHUB_TOKEN is set.');
  process.exit(1);
}

const env: ReportEnv = {
  GITHUB_REPO: process.env.GITHUB_REPO ?? 'patrikliska/kingdoms-wiki',
  GITHUB_TOKEN,
  TURNSTILE_SECRET: TURNSTILE_SECRET ?? TEST_TURNSTILE_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? (dryRun ? '*' : ''),
  SITE_URL: process.env.SITE_URL ?? 'http://localhost:5173',
  DRY_RUN: dryRun ? 'true' : 'false',
  REPORT_LIMITER: createMemoryLimiter(5, 60_000),
};
const trustProxy = process.env.TRUST_PROXY === 'true';
const port = Number(process.env.PORT ?? 8787);

createServer(async (req, res) => {
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req as AsyncIterable<Buffer>) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        res.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    }
    // Decode once at the end so multi-byte characters split across chunks stay intact.
    const body = Buffer.concat(chunks).toString('utf8');
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
    // Client IP for rate limiting: only trust proxy headers when we are behind our own proxy.
    if (!trustProxy) {
      for (const h of ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for']) headers.delete(h);
      if (req.socket.remoteAddress) headers.set('x-real-ip', req.socket.remoteAddress);
    }
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const request = new Request(`http://localhost${req.url ?? '/'}`, {
      method: req.method,
      headers,
      ...(hasBody ? { body } : {}),
    });
    const response = await handleReport(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
  } catch (error) {
    console.error(error);
    res.writeHead(500).end();
  }
}).listen(port, () => {
  console.log(
    `Report endpoint on http://localhost:${port}${dryRun ? ' (dry run – nothing is sent to GitHub)' : ''}`,
  );
});
