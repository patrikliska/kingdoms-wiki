import { describe, expect, it, vi } from 'vitest';
import { createMemoryLimiter, handleReport, type ReportEnv } from './handler';

const ORIGIN = 'https://patrikliska.github.io';
const env: ReportEnv = {
  GITHUB_REPO: 'patrikliska/kingdoms-wiki',
  GITHUB_TOKEN: 'token',
  TURNSTILE_SECRET: 'secret',
  ALLOWED_ORIGINS: ORIGIN,
  SITE_URL: 'https://patrikliska.github.io/kingdoms-wiki',
};
const report = {
  kind: 'data',
  message: 'Galové dostanou 1 200 dřeva, ne 1 100.',
  context: { path: '/quests/siege10', tribe: 'gaul', role: 'governor', lang: 'cs', version: '0.1.0' },
  turnstileToken: 'tok',
};

function post(body: unknown, origin: string | null = ORIGIN): Request {
  const headers = new Headers({ 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' });
  if (origin) headers.set('Origin', origin);
  return new Request('https://report.example/', { method: 'POST', headers, body: JSON.stringify(body) });
}

/** Fake upstreams: Turnstile answers `captchaOk`, GitHub creates issue #42. */
function upstream(captchaOk = true, githubStatus = 201) {
  return vi.fn<typeof fetch>(async (input) => {
    const url = String(input);
    if (url.includes('turnstile')) return Response.json({ success: captchaOk });
    if (url.includes('api.github.com')) {
      return githubStatus < 300
        ? Response.json(
            { number: 42, html_url: 'https://github.com/x/y/issues/42' },
            { status: githubStatus },
          )
        : new Response('nope', { status: githubStatus });
    }
    throw new Error(`unexpected fetch ${url}`);
  });
}

describe('handleReport', () => {
  it('creates a GitHub issue and returns its number', async () => {
    const fetchMock = upstream();
    const res = await handleReport(post(report), env, fetchMock);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true, number: 42, url: 'https://github.com/x/y/issues/42' });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);

    const [, init] = fetchMock.mock.calls[1] ?? [];
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      'https://api.github.com/repos/patrikliska/kingdoms-wiki/issues',
    );
    const issue = JSON.parse(String(init?.body)) as { title: string; labels: string[]; body: string };
    expect(issue.title).toBe('[Data] /quests/siege10: Galové dostanou 1 200 dřeva, ne 1 100.');
    expect(issue.labels).toEqual(['from-web', 'needs-triage', 'kind:data', 'module:quests']);
    expect(issue.body).toContain('https://patrikliska.github.io/kingdoms-wiki/quests/siege10');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token');
  });

  it('answers CORS preflight only for allowed origins', async () => {
    const preflight = (origin: string) =>
      handleReport(
        new Request('https://report.example/', { method: 'OPTIONS', headers: { Origin: origin } }),
        env,
      );
    expect((await preflight(ORIGIN)).status).toBe(204);
    const evil = await preflight('https://evil.example');
    expect(evil.status).toBe(403);
    expect(evil.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('rejects posts from other origins and without an origin', async () => {
    const fetchMock = upstream();
    expect((await handleReport(post(report, 'https://evil.example'), env, fetchMock)).status).toBe(403);
    expect((await handleReport(post(report, null), env, fetchMock)).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns field errors for an invalid report', async () => {
    const res = await handleReport(post({ ...report, message: 'short' }), env, upstream());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid', fields: ['message.short'] });
  });

  it('rejects broken JSON and oversized bodies', async () => {
    const broken = new Request('https://report.example/', {
      method: 'POST',
      headers: { Origin: ORIGIN },
      body: '{',
    });
    expect((await handleReport(broken, env, upstream())).status).toBe(400);
    const huge = await handleReport(post({ ...report, message: 'x'.repeat(20_000) }), env, upstream());
    expect(huge.status).toBe(413);
  });

  it('rejects a failed captcha without calling GitHub', async () => {
    const fetchMock = upstream(false);
    const res = await handleReport(post(report), env, fetchMock);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: 'captcha' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('pretends success when the honeypot is filled', async () => {
    const fetchMock = upstream();
    const res = await handleReport(post({ ...report, website: 'http://spam' }), env, fetchMock);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('applies the rate limit per IP', async () => {
    const limited = { ...env, REPORT_LIMITER: createMemoryLimiter(1, 60_000) };
    expect((await handleReport(post(report), limited, upstream())).status).toBe(201);
    const second = await handleReport(post(report), limited, upstream());
    expect(second.status).toBe(429);
    expect(await second.json()).toEqual({ ok: false, error: 'rate' });
  });

  it('reports a server error when GitHub fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await handleReport(post(report), env, upstream(true, 500));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'server' });
  });

  it('refuses to run without a Turnstile secret unless in dry run', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const noSecret = { ...env, TURNSTILE_SECRET: undefined };
    expect((await handleReport(post(report), noSecret, upstream())).status).toBe(500);
    const fetchMock = upstream();
    const dry = await handleReport(post(report), { ...noSecret, DRY_RUN: 'true' }, fetchMock);
    expect(dry.status).toBe(201);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('createMemoryLimiter', () => {
  it('allows `limit` hits per period and key', async () => {
    let now = 0;
    const limiter = createMemoryLimiter(2, 1000, () => now);
    const hit = async (key: string) => (await limiter.limit({ key })).success;
    expect([await hit('a'), await hit('a'), await hit('a'), await hit('b')]).toEqual([
      true,
      true,
      false,
      true,
    ]);
    now = 1000;
    expect(await hit('a')).toBe(true);
  });
});
