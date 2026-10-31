import { describe, expect, it } from 'vitest';
import { cs } from './cs';
import { en } from './en';

describe('messages', () => {
  it('have the same keys in every language', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(cs).sort());
  });

  it('have no empty strings and the same placeholders', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const [key, csText] of Object.entries(cs)) {
      const enText = en[key as keyof typeof cs];
      expect(csText.trim(), key).not.toBe('');
      expect(enText.trim(), key).not.toBe('');
      expect(placeholders(enText), key).toEqual(placeholders(csText));
    }
  });
});
