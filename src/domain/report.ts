/**
 * Player reports ("suggest a correction") — shared by the in-app form and the report endpoint
 * (worker/), so both validate and format exactly the same way.
 *
 * Imports use explicit `.ts` extensions so the endpoint can also run directly in Node
 * (type stripping) on our own server later.
 */
import { LANGS, ROLES, TRIBES, type Lang, type Role, type Tribe } from './types.ts';

export const REPORT_KINDS = ['data', 'translation', 'bug', 'idea'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

export const REPORT_LIMITS = {
  messageMin: 10,
  messageMax: 2000,
  proofMax: 500,
  nameMax: 60,
  pathMax: 300,
  versionMax: 40,
  userAgentMax: 300,
} as const;

/** Filled in by the app, not typed by the player. */
export interface ReportContext {
  /** Router path incl. query, without the hosting base (e.g. `/quests/siege10?tab=x`). */
  readonly path: string;
  readonly tribe: Tribe;
  readonly role: Role;
  readonly lang: Lang;
  readonly version: string;
  /** Only sent for bug reports. */
  readonly userAgent?: string;
}

export interface Report {
  readonly kind: ReportKind;
  readonly message: string;
  /** Link to a screenshot or official source. */
  readonly proof?: string;
  /** Optional nickname — published with the issue. */
  readonly name?: string;
  readonly context: ReportContext;
}

/** What the app POSTs to the endpoint. */
export interface ReportRequest extends Report {
  /** Honeypot: hidden field, humans leave it empty. */
  readonly website?: string;
  readonly turnstileToken?: string;
}

/** Endpoint responses. */
export type ReportResponse =
  | { readonly ok: true; readonly number?: number; readonly url?: string }
  | { readonly ok: false; readonly error: ReportFailure; readonly fields?: readonly ReportFieldError[] };

export type ReportFailure = 'invalid' | 'captcha' | 'rate' | 'origin' | 'server';

export type ReportFieldError = 'kind' | 'message.short' | 'message.long' | 'proof' | 'name' | 'context';

export type ValidationResult =
  | { readonly ok: true; readonly report: Report }
  | { readonly ok: false; readonly errors: readonly ReportFieldError[] };

// Letters, digits and the URL characters our routes use — no spaces, quotes, backticks or `@`.
const PATH_RE = /^\/[\w\-./?=&%~+,:]*$/;

/**
 * The page path to attach to a report: path + query when it's safe to show,
 * otherwise just the path (e.g. a search query with unusual characters).
 */
export function reportPath(pathname: string, search: string): string {
  const full = `${pathname}${search}`;
  if (full.length <= REPORT_LIMITS.pathMax && PATH_RE.test(full)) return full;
  return pathname.length <= REPORT_LIMITS.pathMax && PATH_RE.test(pathname) ? pathname : '/';
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const optionalString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
const includes = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === 'string' && (list as readonly string[]).includes(v);

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateContext(raw: unknown): ReportContext | undefined {
  if (!isObject(raw)) return undefined;
  const { path, tribe, role, lang, version, userAgent } = raw;
  if (typeof path !== 'string' || path.length > REPORT_LIMITS.pathMax || !PATH_RE.test(path))
    return undefined;
  if (!includes(TRIBES, tribe) || !includes(ROLES, role) || !includes(LANGS, lang)) return undefined;
  if (typeof version !== 'string' || version.length > REPORT_LIMITS.versionMax) return undefined;
  const ua = optionalString(userAgent);
  return {
    path,
    tribe,
    role,
    lang,
    version,
    ...(ua ? { userAgent: ua.slice(0, REPORT_LIMITS.userAgentMax) } : {}),
  };
}

/** Validates untrusted input (form state or a request body). Trims text fields. */
export function validateReport(raw: unknown): ValidationResult {
  if (!isObject(raw)) return { ok: false, errors: ['kind', 'message.short', 'context'] };
  const errors: ReportFieldError[] = [];

  const kind = raw.kind;
  if (!includes(REPORT_KINDS, kind)) errors.push('kind');

  const message = typeof raw.message === 'string' ? raw.message.trim() : '';
  if (message.length < REPORT_LIMITS.messageMin) errors.push('message.short');
  else if (message.length > REPORT_LIMITS.messageMax) errors.push('message.long');

  const proof = optionalString(raw.proof);
  if (proof && (proof.length > REPORT_LIMITS.proofMax || !isHttpUrl(proof))) errors.push('proof');

  const name = optionalString(raw.name);
  if (name && name.length > REPORT_LIMITS.nameMax) errors.push('name');

  const context = validateContext(raw.context);
  if (!context) errors.push('context');

  if (errors.length > 0 || !context || !includes(REPORT_KINDS, kind)) return { ok: false, errors };
  return {
    ok: true,
    report: { kind, message, context, ...(proof ? { proof } : {}), ...(name ? { name } : {}) },
  };
}

// ---------------------------------------------------------------------------
// GitHub issue formatting
// ---------------------------------------------------------------------------

/** Top-level routes that map to a module label. */
const MODULE_LABELS: Readonly<Record<string, string>> = {
  quests: 'quests',
  buildings: 'buildings',
  units: 'units',
  walls: 'walls',
  tribes: 'tribes',
};

const KIND_TITLES: Readonly<Record<ReportKind, string>> = {
  data: 'Data',
  translation: 'Translation',
  bug: 'Bug',
  idea: 'Idea',
};

/** Stops `@name` in player text from pinging GitHub users and `#12` from linking issues. */
function defuse(text: string): string {
  return text.replace(/@(?=\w)/g, '@​').replace(/#(?=\d)/g, '#​');
}

const routeOf = (path: string) => path.split(/[?#]/)[0] ?? path;

export function reportLabels(report: Report): string[] {
  const top = routeOf(report.context.path).split('/')[1] ?? '';
  const module = MODULE_LABELS[top];
  return ['from-web', 'needs-triage', `kind:${report.kind}`, ...(module ? [`module:${module}`] : [])];
}

export function reportTitle(report: Report): string {
  const firstLine = report.message.split('\n')[0]?.trim() ?? '';
  const summary = firstLine.length > 70 ? `${firstLine.slice(0, 69)}…` : firstLine;
  return `[${KIND_TITLES[report.kind]}] ${routeOf(report.context.path)}: ${defuse(summary)}`;
}

/** Markdown issue body. `siteUrl` is the site root without a trailing slash. */
export function reportBody(report: Report, siteUrl: string): string {
  const { context } = report;
  const pageUrl = `${siteUrl.replace(/\/$/, '')}${context.path}`;
  const quoted = defuse(report.message)
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const rows = [
    `| Page | [\`${context.path}\`](${pageUrl}) |`,
    `| Tribe / role | ${context.tribe} / ${context.role} |`,
    `| Language | ${context.lang} |`,
    `| App version | \`${context.version.replace(/`/g, '')}\` |`,
    ...(context.userAgent ? [`| Browser | ${context.userAgent.replace(/[|`]/g, ' ')} |`] : []),
  ];
  return [
    `**${KIND_TITLES[report.kind]}** report from the website${report.name ? ` by _${defuse(report.name).replace(/[_*]/g, '')}_` : ''}.`,
    '',
    quoted,
    '',
    `**Proof:** ${report.proof ? `<${report.proof}>` : '_none_'}`,
    '',
    '| | |',
    '|---|---|',
    ...rows,
    '',
    '<sub>Sent from the in-app report form. Check the proof before changing data.</sub>',
  ].join('\n');
}

/** Pre-filled "new issue" page — used when no report endpoint is configured. */
export function githubNewIssueUrl(repo: string, report: Report, siteUrl: string): string {
  const params = new URLSearchParams({
    title: reportTitle(report),
    body: reportBody(report, siteUrl),
    labels: reportLabels(report).join(','),
  });
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
