import { useSetAtom } from 'jotai';
import { Link } from 'react-router';
import { Credits } from '../components/Credits';
import { Icon } from '../components/Icon';
import layout from '../components/layout.module.css';
import { PageHeader, SectionLabel } from '../components/ui';
import { useT } from '../lib/i18n';
import { reportEnabled } from '../lib/report';
import { MODULES } from './nav';
import { reportOpenAtom, settingsOpenAtom } from './state';
import styles from './MorePage.module.css';

/** Phone "More" tab: modules that don't fit the tab bar, plus settings. */
export function MorePage() {
  const t = useT();
  const openSettings = useSetAtom(settingsOpenAtom);
  const openReport = useSetAtom(reportOpenAtom);
  return (
    <div className={layout.page}>
      <PageHeader title={t('nav.more')} />

      <section className={layout.stack} aria-labelledby="more-modules">
        <SectionLabel id="more-modules">{t('home.browse')}</SectionLabel>
        <ul className={styles.list}>
          {MODULES.map((m) => (
            <li key={m.path}>
              <Link to={m.path} className={styles.row}>
                <span className={styles.icon}>
                  <Icon name={m.icon} />
                </span>
                <span className={styles.text}>
                  <span className={styles.title}>{t(m.label)}</span>
                  {m.blurb && <span className={styles.sub}>{t(m.blurb)}</span>}
                </span>
                <Icon name="chevronRight" size={18} className={styles.arrow} />
              </Link>
            </li>
          ))}
          <li>
            <Link to="/quests/daily" className={styles.row}>
              <span className={styles.icon}>
                <Icon name="clock" />
              </span>
              <span className={styles.text}>
                <span className={styles.title}>Daily quests</span>
                <span className={styles.sub}>{t('search.page.daily')}</span>
              </span>
              <Icon name="chevronRight" size={18} className={styles.arrow} />
            </Link>
          </li>
        </ul>
      </section>

      <section className={layout.stack} aria-labelledby="more-settings">
        <SectionLabel id="more-settings">{t('settings.title')}</SectionLabel>
        <ul className={styles.list}>
          <li>
            <button type="button" className={styles.row} onClick={() => openSettings(true)}>
              <span className={styles.icon}>
                <Icon name="settings" />
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{t('settings.title')}</span>
                <span className={styles.sub}>{t('settings.summary')}</span>
              </span>
              <Icon name="chevronRight" size={18} className={styles.arrow} />
            </button>
          </li>
        </ul>
      </section>

      {reportEnabled && (
        <section className={layout.stack} aria-labelledby="more-feedback">
          <SectionLabel id="more-feedback">{t('more.feedback')}</SectionLabel>
          <ul className={styles.list}>
            <li>
              <button type="button" className={styles.row} onClick={() => openReport(true)}>
                <span className={styles.icon}>
                  <Icon name="flag" />
                </span>
                <span className={styles.text}>
                  <span className={styles.title}>{t('more.report')}</span>
                  <span className={styles.sub}>{t('more.reportSub')}</span>
                </span>
                <Icon name="chevronRight" size={18} className={styles.arrow} />
              </button>
            </li>
          </ul>
        </section>
      )}

      <p className={layout.small}>{t('more.about')}</p>
      <Credits className={layout.small} />
    </div>
  );
}
