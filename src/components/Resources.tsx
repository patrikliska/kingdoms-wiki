import { totalResources } from '../domain/resources';
import { RESOURCE_KEYS, type ResourceKey, type Resources as ResourcesValue } from '../domain/types';
import { useFormat, useT } from '../lib/i18n';
import { ResourceIcon } from './ResourceIcon';
import styles from './Resources.module.css';

interface ResourcesProps {
  readonly value: ResourcesValue;
  /**
   * `chips` — tinted pills for cards and summaries;
   * `plain` — icon + number, dense, for table cells.
   */
  readonly variant?: 'chips' | 'plain';
  readonly showTotal?: boolean;
  /** Short numbers (12 tis. / 12K) — summaries only, never tables. */
  readonly compact?: boolean;
  /** Hide resources that are 0. */
  readonly hideZero?: boolean;
  /** Non-resource reward text (XP, items…). */
  readonly other?: string | undefined;
  readonly size?: 'sm' | 'md' | 'lg';
}

/** Resources in game order: wood, clay, iron, crop. */
export function Resources({
  value,
  variant = 'chips',
  showTotal = false,
  compact = false,
  hideZero = false,
  other,
  size = 'md',
}: ResourcesProps) {
  const t = useT();
  const fmt = useFormat();
  const num = compact ? fmt.compact : fmt.number;
  const keys: readonly ResourceKey[] = hideZero ? RESOURCE_KEYS.filter((k) => value[k] !== 0) : RESOURCE_KEYS;
  return (
    <span className={styles.row} data-variant={variant} data-size={size} data-resource-row="">
      {keys.map((k) => (
        <span key={k} className={styles.item} data-res={k}>
          <ResourceIcon kind={k} title={t(`res.${k}`)} size={size === 'lg' ? 18 : 16} />
          {num(value[k])}
        </span>
      ))}
      {showTotal && (
        <span className={styles.total}>
          <span aria-hidden="true">Σ</span>
          <span className="visually-hidden">{t('res.total')}</span> {num(totalResources(value))}
        </span>
      )}
      {other && <span className={styles.other}>{other}</span>}
    </span>
  );
}
