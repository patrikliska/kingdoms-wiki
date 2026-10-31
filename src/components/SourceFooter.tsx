import type { SourceInfo } from '../domain/types';
import { useFormat, useT } from '../lib/i18n';
import { Icon } from './Icon';
import { ReportButton } from './report/ReportButton';
import styles from './SourceFooter.module.css';

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** "Zdroj · ověřeno DD.MM.YYYY" plus a way to report a mistake — every table/section ends with one. */
export function SourceFooter({ info }: { readonly info: SourceInfo | readonly SourceInfo[] }) {
  const t = useT();
  const fmt = useFormat();
  const list = Array.isArray(info) ? info : [info as SourceInfo];
  return (
    <footer className={styles.footer}>
      <div className={styles.sources}>
        <Icon name="check" size={16} className={styles.icon} />
        <div>
          {list.map((s) => (
            <p key={s.source + s.verifiedAt}>
              {t('source.label')}:{' '}
              <a href={s.source} target="_blank" rel="noreferrer">
                {hostOf(s.source)}
              </a>{' '}
              · {t('source.verified')} {fmt.date(s.verifiedAt)}
              {s.derived && (
                <>
                  {' '}
                  · {t('source.derived')}
                  {s.formula && <code className={styles.formula}>{s.formula}</code>}
                </>
              )}
            </p>
          ))}
        </div>
      </div>
      <ReportButton />
    </footer>
  );
}
