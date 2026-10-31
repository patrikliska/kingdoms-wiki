import { describe, expect, it } from 'vitest';
import { normalize, search } from './search';

const items = [
  { id: '1', title: 'City Wall', subtitle: 'Římská zeď', keywords: ['hradby'] },
  { id: '2', title: 'Earth Wall', subtitle: 'Germánská zeď' },
  { id: '3', title: 'Warehouse', subtitle: 'Sklad' },
];

describe('search', () => {
  it('strips diacritics', () => expect(normalize('Zeď Římanů')).toBe('zed rimanu'));
  it('matches all words', () => expect(search(items, 'wall earth').map((i) => i.id)).toEqual(['2']));
  it('matches subtitle and keywords without diacritics', () => {
    expect(
      search(items, 'zed')
        .map((i) => i.id)
        .sort(),
    ).toEqual(['1', '2']);
    expect(search(items, 'hradby').map((i) => i.id)).toEqual(['1']);
  });
  it('ranks title prefix first', () => expect(search(items, 'wa')[0]?.id).toBe('3'));
  it('returns nothing for an empty query', () => expect(search(items, '  ')).toEqual([]));
});
