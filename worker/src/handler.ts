/**
 * Report endpoint: turns a player's correction from the app into a GitHub issue.
 *
 * Runtime-agnostic (only fetch/Request/Response): runs as a Cloudflare Worker (index.ts) and
 * under Node (node-server.ts) on our own server later. The GitHub token never reaches the browser.
 */
import {
  reportBody,
  reportLabels,
  reportTitle,
  validateReport,
  type ReportResponse,
} from '../../src/domain/report.ts';

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface ReportEnv {
  /** "owner/repo" the issues go to. */
  readonly GITHUB_REPO: string;
  /** Secret. Fine-grained token with "Issues: read and write" on GITHUB_REPO only. */
  readonly GITHUB_TOKEN?: string;
  /** Comma-separated origins allowed to post (e.g. "https://patrikliska.github.io"), or "*". */
  readonly ALLOWED_ORIGINS: string;
  /** Public site root, used for page links in the issue. */
  readonly SITE_URL: string;
  /** Secret. Cloudflare Turnstile secret key. */
  readonly TURNSTILE_SECRET?: string;
  /** "true" = log the issue instead of creating it (local development). */
  readonly DRY_RUN?: string;
  /** Per-IP limit (Cloudflare rate limiting binding, or the in-memory one in Node). */
  readonly REPORT_LIMITER?: RateLimiter;
}

const MAX_BODY_CHARS = 16_000;
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function allowedOrigin(origin: string | null, allowList: string): string | null {
  if (!origin) return null;
  const list = allowList.split(',').map((o) => o.trim());
  return list.includes('*') || list.includes(origin) ? origin : null;
}

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers({ Vary: 'Origin' });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Access-Control-Max-Age', '86400');
  }
  return headers;
}

function json(body: ReportResponse, status: number, headers: Headers): Response {
  const h = new Headers(headers);
  h.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { status, headers: h });
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Real-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

async function verifyTurnstile(token: string, ip: string, secret: string, fetchImpl: typeof fetch) {
  if (!token) return false;
  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);
  if (ip !== 'unknown') form.set('remoteip', ip);
  try {
    const res = await fetchImpl(TURNSTILE_VERIFY, { method: 'POST', body: form });
    const data: unknown = await res.json();
    return isObject(data) && data.success === true;
  } catch {
    return false;
  }
}

export async function handleReport(
  request: Request,
  env: ReportEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const origin = allowedOrigin(request.headers.get('Origin'), env.ALLOWED_ORIGINS);
  const cors = corsHeaders(origin);

  if (request.method === 'OPTIONS') return new Response(null, { status: origin ? 204 : 403, headers: cors });
  if (request.method !== 'POST') return json({ ok: false, error: 'invalid' }, 405, cors);
  if (!origin) return json({ ok: false, error: 'origin' }, 403, cors);

  const ip = clientIp(request);
  if (env.REPORT_LIMITER && !(await env.REPORT_LIMITER.limit({ key: ip })).success) {
    return json({ ok: false, error: 'rate' }, 429, cors);
  }

  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) return json({ ok: false, error: 'invalid' }, 413, cors);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json({ ok: false, error: 'invalid' }, 400, cors);
  }

  // Honeypot filled in: answer like a success so bots learn nothing.
  if (isObject(raw) && typeof raw.website === 'string' && raw.website.trim() !== '') {
    return json({ ok: true }, 200, cors);
  }

  const result = validateReport(raw);
  if (!result.ok) return json({ ok: false, error: 'invalid', fields: result.errors }, 400, cors);

  const dryRun = env.DRY_RUN === 'true';
  if (env.TURNSTILE_SECRET) {
    const token = isObject(raw) && typeof raw.turnstileToken === 'string' ? raw.turnstileToken : '';
    if (!(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET, fetchImpl))) {
      return json({ ok: false, error: 'captcha' }, 403, cors);
    }
  } else if (!dryRun) {
    console.error('report: TURNSTILE_SECRET is not set, refusing reports');
    return json({ ok: false, error: 'server' }, 500, cors);
  }

  const issue = {
    title: reportTitle(result.report),
    body: reportBody(result.report, env.SITE_URL),
    labels: reportLabels(result.report),
  };

  if (dryRun) {
    console.log(
      `report (dry run) → ${env.GITHUB_REPO}\n${issue.title}\n${issue.labels.join(', ')}\n\n${issue.body}\n`,
    );
    return json({ ok: true }, 201, cors);
  }
  if (!env.GITHUB_TOKEN) {
    console.error('report: GITHUB_TOKEN is not set');
    return json({ ok: false, error: 'server' }, 500, cors);
  }

  const res = await fetchImpl(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'kingdoms-companion-report',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(issue),
  });
  if (!res.ok) {
    console.error(`report: GitHub answered ${res.status}: ${await res.text()}`);
    return json({ ok: false, error: 'server' }, 502, cors);
  }
  const created: unknown = await res.json();
  const number = isObject(created) && typeof created.number === 'number' ? created.number : undefined;
  const url = isObject(created) && typeof created.html_url === 'string' ? created.html_url : undefined;
  return json({ ok: true, ...(number ? { number } : {}), ...(url ? { url } : {}) }, 201, cors);
}

/** Sliding-window per-key limiter for a single Node process. */
export function createMemoryLimiter(limit: number, periodMs: number, now = () => Date.now()): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    async limit({ key }) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((at) => t - at < periodMs);
      const success = recent.length < limit;
      if (success) recent.push(t);
      hits.set(key, recent);
      if (hits.size > 10_000) {
        for (const [k, list] of hits) if (list.every((at) => t - at >= periodMs)) hits.delete(k);
      }
      return { success };
    },
  };
}
