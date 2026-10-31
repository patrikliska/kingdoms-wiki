import type { ReportRequest, ReportResponse } from '../domain/report';

const clean = (value: string | undefined) => (value && value.trim() !== '' ? value.trim() : undefined);

/** Build-time settings (see src/env.d.ts). */
export const reportConfig = {
  /** Where reports are POSTed. Without it, the form opens a pre-filled GitHub issue instead. */
  endpoint: clean(import.meta.env.VITE_REPORT_ENDPOINT),
  turnstileSiteKey: clean(import.meta.env.VITE_TURNSTILE_SITE_KEY),
  githubRepo: clean(import.meta.env.VITE_GITHUB_REPO),
} as const;

/** The report button is shown only when reports can go somewhere. */
export const reportEnabled = Boolean(reportConfig.endpoint ?? reportConfig.githubRepo);

export type SendResult = ReportResponse | { readonly ok: false; readonly error: 'network' };

export async function sendReport(endpoint: string, payload: ReportRequest): Promise<SendResult> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: 'network' };
  }
  const data: unknown = await res.json().catch(() => null);
  if (typeof data === 'object' && data !== null && 'ok' in data) return data as ReportResponse;
  return { ok: false, error: res.status === 429 ? 'rate' : 'server' };
}

/** Public root of this site (origin + base path, no trailing slash). */
export function siteRoot(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/$/, '');
}
