import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { Icon, type IconName } from '../components/Icon';
import { useLang, useT } from '../lib/i18n';
import { search } from '../lib/search';
import { buildSearchIndex, type SearchKind } from './searchIndex';
import styles from './SearchDialog.module.css';

const kindIcon: Record<SearchKind, IconName> = {
  quest: 'quests',
  building: 'buildings',
  unit: 'units',
  tip: 'info',
  page: 'arrowRight',
};

const SUGGESTIONS = ['Warehouse', 'Settler', 'City Wall', 'Granary 10'];

interface SearchDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

/** Global search: results appear while typing; ↑ ↓ to move, Enter to open. */
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const t = useT();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();

  const lang = useLang();
  const index = useMemo(() => buildSearchIndex(t, lang), [t, lang]);
  const results = useMemo(() => search(index, query, 40), [index, query]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (path: string) => {
    onClose();
    setQuery('');
    void navigate(path);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      const hit = results[active];
      if (hit) go(hit.path);
    }
  };

  const activeId = results[active] ? `${listId}-${active}` : undefined;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={t('search.open')}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.inputRow}>
          <Icon name="search" size={20} className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-label={t('search.open')}
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            enterKeyHint="go"
          />
          <button type="button" className={styles.cancel} onClick={onClose}>
            {t('search.close')}
          </button>
        </div>

        {query.trim() === '' ? (
          <div className={styles.idle}>
            <p className={styles.hint}>{t('search.hint')}</p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    inputRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className={styles.hint}>{t('search.empty')}</p>
        ) : (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className={styles.results}
            aria-label={t('search.results')}
          >
            {results.map((r, i) => (
              <li
                key={r.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={styles.result}
                onMouseMove={() => setActive(i)}
                onClick={() => go(r.path)}
              >
                <span className={styles.resultIcon} data-kind={r.kind}>
                  <Icon name={kindIcon[r.kind]} size={18} />
                </span>
                <span className={styles.resultText}>
                  <span className={styles.title}>{r.title}</span>
                  {r.subtitle && <span className={styles.subtitle}>{r.subtitle}</span>}
                </span>
                <span className={styles.kind}>{t(`search.kind.${r.kind}`)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.footer} aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {t('search.navigate')}
          </span>
          <span>
            <kbd>Enter</kbd> {t('search.select')}
          </span>
          <span>
            <kbd>Esc</kbd> {t('search.close')}
          </span>
        </div>
      </div>
    </dialog>
  );
}
