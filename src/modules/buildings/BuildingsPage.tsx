import { useAtomValue } from 'jotai';
import { Link, useSearchParams } from 'react-router';
import { tribeAtom } from '../../app/state';
import { Icon } from '../../components/Icon';
import layout from '../../components/layout.module.css';
import { Resources } from '../../components/Resources';
import { SourceFooter } from '../../components/SourceFooter';
import { Badge, ChipGroup, EmptyState, PageHeader, SearchField } from '../../components/ui';
import { buildingsSource } from '../../data/buildings';
import type { Building, BuildingCategory } from '../../data/buildingTypes';
import { useL, useT } from '../../lib/i18n';
import { normalize } from '../../lib/search';
import { availableFor, buildingName, CATEGORIES } from './buildingIndex';
import { categoryIcon } from './categoryIcon';
import styles from './Buildings.module.css';

type CategoryFilter = BuildingCategory | 'all';

function isCategory(v: string | null): v is BuildingCategory {
  return v !== null && (CATEGORIES as readonly string[]).includes(v);
}

export function BuildingsPage() {
  const t = useT();
  const tribe = useAtomValue(tribeAtom);
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const catParam = params.get('cat');
  const category: CategoryFilter = isCategory(catParam) ? catParam : 'all';
  const words = normalize(query).split(/\s+/).filter(Boolean);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const matching = availableFor(tribe).filter((b) => {
    if (words.length === 0) return true;
    const hay = normalize(`${b.name.cs} ${b.name.en} ${b.id} ${t(`buildingCategory.${b.category}`)}`);
    return words.every((w) => hay.includes(w));
  });
  const list = category === 'all' ? matching : matching.filter((b) => b.category === category);

  return (
    <div className={layout.page}>
      <PageHeader
        title={t('nav.buildings')}
        description={t('buildings.shownFor', { tribe: t(`tribe.${tribe}`) })}
      />
      <div className={layout.toolbar}>
        <SearchField
          value={query}
          onChange={(v) => setParam('q', v)}
          placeholder={t('buildings.search')}
          label={t('buildings.search')}
        />
        <ChipGroup<CategoryFilter>
          label={t('buildings.category')}
          value={category}
          onChange={(v) => setParam('cat', v === 'all' ? null : v)}
          options={[
            { value: 'all', label: t('quests.giver.all'), count: matching.length },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: t(`buildingCategory.${c}`),
              count: matching.filter((b) => b.category === c).length,
            })),
          ]}
        />
      </div>

      {CATEGORIES.map((cat) => {
        const items = list.filter((b) => b.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`} className={layout.stack}>
            <h2 id={`cat-${cat}`} className={styles.groupTitle}>
              {t(`buildingCategory.${cat}`)}
            </h2>
            <ul className={layout.cardGrid}>
              {items.map((b) => (
                <li key={b.id}>
                  <BuildingCard building={b} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {list.length === 0 && <EmptyState>{t('buildings.empty')}</EmptyState>}
      <SourceFooter info={buildingsSource} />
    </div>
  );
}

function BuildingCard({ building: b }: { readonly building: Building }) {
  const t = useT();
  const l = useL();
  const first = b.levels[0];
  const restricted = !b.where.includes('village');
  return (
    <Link to={`/buildings/${b.id}`} className={styles.card}>
      <span className={styles.cardHead}>
        <span className={styles.cardIcon} data-cat={b.category}>
          <Icon name={categoryIcon[b.category]} size={20} />
        </span>
        <span className={styles.cardTitle}>{l(b.name)}</span>
        <Icon name="chevronRight" size={18} className={styles.cardArrow} />
      </span>
      <span className={styles.cardBadges}>
        <Badge>{t('buildings.maxLevel', { n: b.maxLevel })}</Badge>
        {b.tribe && <Badge tribe={b.tribe}>{t(`tribe.${b.tribe}`)}</Badge>}
        {restricted && <Badge tone="warn">{b.where.map((w) => t(`site.${w}`)).join(', ')}</Badge>}
      </span>
      {first && <Resources value={first.cost} hideZero size="sm" />}
      {b.requires.length > 0 && (
        <span className={styles.cardMeta}>
          {t('buildings.requiresList', {
            list: b.requires.map((r) => `${l(buildingName(r.id))} ${r.level}`).join(', '),
          })}
        </span>
      )}
    </Link>
  );
}
