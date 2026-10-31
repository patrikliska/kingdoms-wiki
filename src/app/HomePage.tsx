import { useAtomValue, useSetAtom } from 'jotai';
import { Link } from 'react-router';
import { Icon, type IconName } from '../components/Icon';
import { RoleSwitch, TribePicker } from '../components/Settings';
import { SectionLabel } from '../components/ui';
import { buildings } from '../data/buildings';
import { quests } from '../data/quests';
import { tribes } from '../data/tribes';
import { units } from '../data/units';
import type { Lang } from '../domain/types';
import { useLang, useT, type MessageKey } from '../lib/i18n';
import { MODULES } from './nav';
import { recentAtom, searchOpenAtom, tribeAtom, type RecentItem } from './state';
import styles from './HomePage.module.css';

const recentIcon: Record<RecentItem['kind'], IconName> = {
  quest: 'quests',
  building: 'buildings',
  unit: 'units',
};

const nameOf = (id: string, lang: Lang) => buildings.find((b) => b.id === id)?.name[lang] ?? id;

/** Saved titles are in the language of the visit; show quests and buildings in the current one. */
function recentTitle(item: RecentItem, lang: Lang): string {
  const id = item.path.split(/[/?]/)[2] ?? '';
  if (item.kind === 'building') return buildings.find((b) => b.id === id)?.name[lang] ?? item.title;
  if (item.kind === 'quest') return quests.find((q) => q.id === id)?.name[lang] ?? item.title;
  return item.title;
}

export function HomePage() {
  const t = useT();
  const lang = useLang();
  const tribe = useAtomValue(tribeAtom);
  const recent = useAtomValue(recentAtom);
  const openSearch = useSetAtom(searchOpenAtom);

  const counts: Record<string, number> = {
    '/quests': quests.length,
    '/buildings': buildings.filter((b) => b.tribe === null || b.tribe === tribe).length,
    '/units': units.filter((u) => u.tribe === tribe).length,
    '/walls': 3,
    '/tribes': 3,
  };
  const countLabel: Record<string, MessageKey> = {
    '/quests': 'home.count.quests',
    '/buildings': 'home.count.buildings',
    '/units': 'home.count.units',
    '/walls': 'home.count.walls',
    '/tribes': 'home.count.tribes',
  };

  const settler = units.find((u) => u.tribe === tribe && u.type === 'settler');
  const quick: { to: string; label: string; icon: IconName }[] = [
    {
      to: '/walls',
      label: t('home.quick.wall', { wall: nameOf(tribes[tribe].wall.id, lang) }),
      icon: 'walls',
    },
    {
      to: '/buildings/warehouse?lvl=20',
      label: t('home.quick.building', { name: nameOf('warehouse', lang), lvl: 20 }),
      icon: 'buildings',
    },
    {
      to: '/buildings/main-building?lvl=20',
      label: t('home.quick.building', { name: nameOf('main-building', lang), lvl: 20 }),
      icon: 'buildings',
    },
    {
      to: '/buildings/residence?lvl=10',
      label: t('home.quick.building', { name: nameOf('residence', lang), lvl: 10 }),
      icon: 'buildings',
    },
    ...(settler
      ? [{ to: `/units/${settler.id}`, label: t('home.quick.settler'), icon: 'units' as IconName }]
      : []),
    { to: '/quests?giver=wren', label: t('home.quick.wren'), icon: 'quests' },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>{t('app.tagline')}</h1>
        <p className={styles.lead}>{t('home.intro')}</p>
        <button type="button" className={styles.bigSearch} onClick={() => openSearch(true)}>
          <Icon name="search" size={22} />
          <span>{t('home.searchPrompt')}</span>
          <kbd className={styles.kbd}>Ctrl K</kbd>
        </button>
      </section>

      <section className={styles.you} aria-labelledby="you-title">
        <div className={styles.youHead}>
          <SectionLabel id="you-title">{t('home.youPlay')}</SectionLabel>
          <RoleSwitch size="sm" />
        </div>
        <TribePicker compact />
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent-title" className={styles.section}>
          <SectionLabel id="recent-title">{t('home.recent')}</SectionLabel>
          <ul className={styles.recent}>
            {recent.map((r) => (
              <li key={r.path}>
                <Link to={r.path} className={styles.recentItem}>
                  <Icon name={recentIcon[r.kind]} size={16} />
                  <span>{recentTitle(r, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="modules-title" className={styles.section}>
        <SectionLabel id="modules-title">{t('home.browse')}</SectionLabel>
        <ul className={styles.tiles}>
          {MODULES.map((m) => (
            <li key={m.path}>
              <Link to={m.path} className={styles.tile}>
                <span className={styles.tileIcon}>
                  <Icon name={m.icon} size={22} />
                </span>
                <span className={styles.tileText}>
                  <span className={styles.tileTitle}>
                    {t(m.label)}
                    {countLabel[m.path] && (
                      <span className={styles.tileCount}>
                        {t(countLabel[m.path] as MessageKey, { n: counts[m.path] ?? 0 })}
                      </span>
                    )}
                  </span>
                  {m.blurb && <span className={styles.tileBlurb}>{t(m.blurb)}</span>}
                </span>
                <Icon name="chevronRight" size={18} className={styles.tileArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quick-title" className={styles.section}>
        <SectionLabel id="quick-title">{t('home.quickTitle')}</SectionLabel>
        <ul className={styles.quick}>
          {quick.map((q) => (
            <li key={q.to}>
              <Link to={q.to} className={styles.quickItem}>
                <Icon name={q.icon} size={16} />
                {q.label}
                <Icon name="arrowRight" size={16} className={styles.quickArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
