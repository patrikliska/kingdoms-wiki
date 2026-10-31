import { useId, useState, type ReactNode } from 'react';
import { useT } from '../lib/i18n';
import { useMediaQuery } from '../lib/useMediaQuery';
import { Icon } from './Icon';
import styles from './DataTable.module.css';

export interface Column<Row> {
  readonly key: string;
  readonly header: string;
  /** Tooltip / longer description of the header. */
  readonly title?: string;
  readonly render: (row: Row) => ReactNode;
  /** When set, the column is sortable. */
  readonly sortValue?: (row: Row) => number | string;
  readonly align?: 'start' | 'end';
}

interface DataTableProps<Row> {
  readonly caption: string;
  readonly columns: readonly Column<Row>[];
  readonly rows: readonly Row[];
  readonly rowKey: (row: Row) => string;
  readonly isRowActive?: (row: Row) => boolean;
  readonly onRowClick?: (row: Row) => void;
  /** On phones render each row as a card instead of a wide table. */
  readonly mobileCard?: (row: Row) => ReactNode;
}

type Sort = { key: string; dir: 1 | -1 } | null;

function sortRows<Row>(rows: readonly Row[], columns: readonly Column<Row>[], sort: Sort): readonly Row[] {
  if (!sort) return rows;
  const get = columns.find((c) => c.key === sort.key)?.sortValue;
  if (!get) return rows;
  return [...rows].sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    const cmp =
      typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return cmp * sort.dir;
  });
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  isRowActive,
  onRowClick,
  mobileCard,
}: DataTableProps<Row>) {
  const t = useT();
  const sortId = useId();
  const [sort, setSort] = useState<Sort>(null);
  const isPhone = useMediaQuery('(max-width: 699px)');
  const sorted = sortRows(rows, columns, sort);
  const sortable = columns.filter((c) => c.sortValue);

  if (mobileCard && isPhone) {
    return (
      <div className={styles.cardsWrap}>
        {sortable.length > 0 && (
          <div className={styles.sortBar}>
            <Icon name="sort" size={16} />
            <label htmlFor={sortId}>{t('table.sortBy')}</label>
            <select
              id={sortId}
              value={sort ? `${sort.key}:${sort.dir}` : ''}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(':');
                setSort(key ? { key, dir: dir === '1' ? 1 : -1 } : null);
              }}
            >
              <option value="">{t('table.defaultOrder')}</option>
              {sortable.map((c) => (
                <option key={c.key} value={`${c.key}:-1`}>
                  {c.title ?? c.header}
                </option>
              ))}
            </select>
          </div>
        )}
        <ul className={styles.cards} aria-label={caption}>
          {sorted.map((row) => (
            <li key={rowKey(row)} data-active={isRowActive?.(row) || undefined}>
              {mobileCard(row)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: -1 } : s.dir === -1 ? { key, dir: 1 } : null));

  return (
    <div className={styles.scroll} tabIndex={0} role="region" aria-label={caption}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const dir = sort?.key === c.key ? sort.dir : 0;
              return (
                <th
                  key={c.key}
                  scope="col"
                  data-align={c.align ?? 'start'}
                  aria-sort={dir === 0 ? undefined : dir === 1 ? 'ascending' : 'descending'}
                  title={c.title}
                >
                  {c.sortValue ? (
                    <button type="button" className={styles.sortBtn} onClick={() => toggleSort(c.key)}>
                      {c.header}
                      <span aria-hidden="true" className={styles.sortMark} data-dir={dir}>
                        <Icon name="arrowDown" size={12} />
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              data-active={isRowActive?.(row) || undefined}
              data-clickable={onRowClick ? '' : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c, i) =>
                i === 0 ? (
                  <th key={c.key} scope="row" data-align={c.align ?? 'start'}>
                    {c.render(row)}
                  </th>
                ) : (
                  <td key={c.key} data-align={c.align ?? 'start'}>
                    {c.render(row)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
