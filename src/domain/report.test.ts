import { describe, expect, it } from 'vitest';
import {
  githubNewIssueUrl,
  reportBody,
  reportLabels,
  reportPath,
  reportTitle,
  validateReport,
  type Report,
  type ReportContext,
} from './report';

const context: ReportContext = {
  path: '/quests/siege10',
  tribe: 'gaul',
  role: 'governor',
  lang: 'cs',
  version: '0.1.0',
};
const valid = { kind: 'data', message: '  Galové dostanou 1 200 dřeva, ne 1 100.  ', context };

function report(overrides: Partial<Report> = {}): Report {
  const result = validateReport({ ...valid, ...overrides });
  if (!result.ok) throw new Error(result.errors.join());
  return result.report;
}

describe('validateReport', () => {
  it('accepts a valid report and trims text', () => {
    const result = validateReport({ ...valid, proof: ' https://support.kingdoms.com/x ', name: ' Pat ' });
    expect(result).toEqual({
      ok: true,
      report: {
        kind: 'data',
        message: 'Galové dostanou 1 200 dřeva, ne 1 100.',
        proof: 'https://support.kingdoms.com/x',
        name: 'Pat',
        context,
      },
    });
  });

  it('drops empty optional fields and unknown keys', () => {
    const result = validateReport({ ...valid, proof: '  ', name: '', website: 'x', extra: 1 });
    expect(result.ok && result.report).toEqual({ kind: 'data', message: valid.message.trim(), context });
  });

  it('reports every invalid field', () => {
    const result = validateReport({
      kind: 'spam',
      message: 'short',
      proof: 'javascript:alert(1)',
      name: 'x'.repeat(61),
      context,
    });
    expect(result).toEqual({ ok: false, errors: ['kind', 'message.short', 'proof', 'name'] });
  });

  it('limits the message length', () => {
    const result = validateReport({ ...valid, message: 'x'.repeat(2001) });
    expect(result.ok ? [] : result.errors).toEqual(['message.long']);
  });

  it.each([
    ['a path with spaces', { ...context, path: '/quests/a b' }],
    ['a path with a mention', { ...context, path: '/@user' }],
    ['a relative path', { ...context, path: 'quests' }],
    ['an unknown tribe', { ...context, tribe: 'egyptian' }],
    ['an unknown language', { ...context, lang: 'de' }],
    ['a missing version', { ...context, version: undefined }],
  ])('rejects context with %s', (_, ctx) => {
    const result = validateReport({ ...valid, context: ctx });
    expect(result.ok ? [] : result.errors).toEqual(['context']);
  });

  it('rejects non-objects', () => {
    expect(validateReport(null).ok).toBe(false);
    expect(validateReport('report').ok).toBe(false);
  });
});

describe('reportPath', () => {
  it('keeps a safe query', () => {
    expect(reportPath('/buildings/city-wall', '?lvl=20')).toBe('/buildings/city-wall?lvl=20');
  });

  it('falls back to the path when the query is not safe', () => {
    expect(reportPath('/quests', '?q="x y"')).toBe('/quests');
  });
});

describe('issue formatting', () => {
  it('labels by kind and module', () => {
    expect(reportLabels(report())).toEqual(['from-web', 'needs-triage', 'kind:data', 'module:quests']);
    expect(reportLabels(report({ context: { ...context, path: '/more' } }))).toEqual([
      'from-web',
      'needs-triage',
      'kind:data',
    ]);
  });

  it('builds a short title from the first line', () => {
    const long = report({ message: `${'a'.repeat(100)}\nsecond line` });
    expect(reportTitle(report())).toBe('[Data] /quests/siege10: Galové dostanou 1 200 dřeva, ne 1 100.');
    expect(reportTitle(long)).toBe(`[Data] /quests/siege10: ${'a'.repeat(69)}…`);
  });

  it('quotes the message, links the page and stops mentions', () => {
    const body = reportBody(
      report({ message: 'Ask @octocat about #12\nline two', name: '@pat_', proof: 'https://x.dev/a' }),
      'https://patrikliska.github.io/kingdoms-wiki/',
    );
    expect(body).toContain('> Ask @​octocat about #​12\n> line two');
    expect(body).toContain('by _@​pat_.');
    expect(body).toContain('[`/quests/siege10`](https://patrikliska.github.io/kingdoms-wiki/quests/siege10)');
    expect(body).toContain('**Proof:** <https://x.dev/a>');
    expect(body).toContain('| Tribe / role | gaul / governor |');
  });

  it('builds a pre-filled GitHub issue link', () => {
    const url = new URL(githubNewIssueUrl('patrikliska/kingdoms-wiki', report(), 'https://example.com'));
    expect(url.pathname).toBe('/patrikliska/kingdoms-wiki/issues/new');
    expect(url.searchParams.get('title')).toBe(reportTitle(report()));
    expect(url.searchParams.get('labels')).toBe('from-web,needs-triage,kind:data,module:quests');
  });
});
