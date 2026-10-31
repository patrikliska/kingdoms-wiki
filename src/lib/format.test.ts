import { describe, expect, it } from 'vitest';
import { formatDuration, getFormatter } from './format';

const cs = getFormatter('cs');
const en = getFormatter('en');

describe('format', () => {
  it('groups thousands with a space in Czech and a comma in English', () => {
    expect(cs.number(1234567).replace(/\s/g, ' ')).toBe('1 234 567');
    expect(en.number(1234567)).toBe('1,234,567');
  });
  it('uses the right decimal separator and percent style', () => {
    expect(cs.percent(80.61)).toBe('80,6 %');
    expect(en.percent(80.61)).toBe('80.6%');
  });
  it('formats ISO dates per language', () => {
    expect(cs.date('2026-10-27')).toBe('27.10.2026');
    expect(en.date('2026-10-27')).toBe('27 Oct 2026');
  });
  it('formats durations', () => expect(formatDuration(3725)).toBe('1:02:05'));
});
