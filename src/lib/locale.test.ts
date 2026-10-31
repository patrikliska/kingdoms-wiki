import { describe, expect, it } from 'vitest';
import { detectLang } from './locale';

describe('detectLang', () => {
  it('picks Czech for a Czech browser anywhere', () => {
    expect(detectLang(['cs-CZ', 'en'], 'America/New_York')).toBe('cs');
    expect(detectLang(['en-US', 'cs'], 'Europe/London')).toBe('cs');
  });
  it('picks Czech for the Czech time zone even with an English browser', () => {
    expect(detectLang(['en-US'], 'Europe/Prague')).toBe('cs');
  });
  it('defaults to English elsewhere', () => {
    expect(detectLang(['en-US'], 'Europe/Berlin')).toBe('en');
    expect(detectLang(['de-DE'], undefined)).toBe('en');
    expect(detectLang([], undefined)).toBe('en');
  });
  it('does not confuse other languages that start with "cs"', () => {
    expect(detectLang(['csb'], 'Europe/Warsaw')).toBe('en');
  });
});
