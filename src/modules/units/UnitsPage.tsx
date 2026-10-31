import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { tribeAtom } from '../../app/state';
import { useTrackRecent } from '../../app/useRecent';
import { DataTable, type Column } from '../../components/DataTable';
import { Icon, type IconName } from '../../components/Icon';
import layout from '../../components/layout.module.css';
import { Resources } from '../../components/Resources';
import { DetailPanel } from '../../components/Sheet';
import { SourceFooter } from '../../components/SourceFooter';
import {
  Badge,
  Callout,
  ChipGroup,
  EmptyState,
  PageHeader,
  SectionLabel,
  Segmented,
  Stat,
  StatGrid,
  TribeDot,
} from '../../components/ui';
import type { Unit, UnitType } from '../../data/unitTypes';
import { units, unitsSource } from '../../data/units';
import { totalResources } from '../../domain/resources';
import { unitRatios } from '../../domain/units';
import { TRIBES, type Tribe } from '../../domain/types';
import { useFormat, useL, useT } from '../../lib/i18n';
import { buildingName } from '../buildings/buildingIndex';
import styles from './Units.module.css';

type View = 'stats' | 'ratios';
type TribeFilter = Tribe | 'all';

const typeIcon: Record<UnitType, IconName> = {
  infantry: 'sword',
  cavalry: 'horse',
  siege: 'hammer',
  scout: 'eye',
  chief: 'crown',
  settler: 'tent',
};

function isTribeFilter(v: string | null): v is TribeFilter {
  return v === 'all' || (v !== null && (TRIBES as readonly string[]).includes(v));
}

export function UnitsPage() {
  const t = useT();
  const fmt = useFormat();
  const { unitId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const myTribe = useAtomValue(tribeAtom);

  // ?tribe= lets you look at another tribe without changing your own.
  const tribeParam = params.get('tribe');
  const tribeFilter: TribeFilter = isTribeFilter(tribeParam) ? tribeParam : myTribe;
  const view: View = params.get('view') === 'ratios' ? 'ratios' : 'stats';
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const search = params.toString() ? `?${params.toString()}` : '';

  const selected = unitId ? units.find((u) => u.id === unitId) : undefined;
  const rows = useMemo(
    () => (tribeFilter === 'all' ? units : units.filter((u) => u.tribe === tribeFilter)),
    [tribeFilter],
  );
  const showTribe = tribeFilter === 'all';

  const n = fmt.number;
  const d = (v: number) => fmt.decimal(v, 1);
  const open = (u: Unit) => void navigate(`/units/${u.id}${search}`);

  const num = (
    key: string,
    header: string,
    get: (u: Unit) => number,
    format: (v: number) => string = n,
    title?: string,
  ): Column<Unit> => ({ key, header, title, align: 'end', render: (u) => format(get(u)), sortValue: get });

  const nameCol: Column<Unit> = {
    key: 'name',
    header: t('units.col.unit'),
    render: (u) => (
      <Link to={`/units/${u.id}${search}`} className={styles.unitLink} onClick={(e) => e.stopPropagation()}>
        {showTribe && <TribeDot tribe={u.tribe} />}
        {/* the unit type is an icon (hover shows the word) – saves a whole column */}
        <span className={styles.typeIcon} title={t(`unitType.${u.type}`)}>
          <Icon name={typeIcon[u.type]} size={16} title={t(`unitType.${u.type}`)} />
        </span>
        {u.name}
      </Link>
    ),
    sortValue: (u) => u.name,
  };

  const defVs = t('units.group.defVs');
  const statsCols: Column<Unit>[] = [
    num('attack', t('units.attack'), (u) => u.attack),
    { ...num('defInf', t('units.col.vsInf'), (u) => u.defInf, n, t('units.defInf')), group: defVs },
    { ...num('defCav', t('units.col.vsCav'), (u) => u.defCav, n, t('units.defCav')), group: defVs },
    {
      key: 'cost',
      header: t('units.trainingCost'),
      title: t('units.trainingCostTitle'),
      shrink: true,
      // resources on the left, the total on the right so totals line up row to row
      render: (u) => (
        <span className={styles.cost}>
          <Resources value={u.cost} hideZero variant="plain" />
          <span className={styles.costTotal}>
            <span aria-hidden="true">Σ</span>
            <span className="visually-hidden">{t('res.total')}</span> {n(totalResources(u.cost))}
          </span>
        </span>
      ),
      sortValue: (u) => totalResources(u.cost),
    },
    num('speed', t('units.speed'), (u) => u.speed, n, t('units.speedTitle')),
    num('carry', t('units.carry'), (u) => u.carry),
    num('upkeep', t('units.col.upkeep'), (u) => u.upkeep, n, t('units.upkeepTitle')),
  ];

  type Ratios = ReturnType<typeof unitRatios>;
  const ratio = (
    key: string,
    header: string,
    group: string,
    get: (r: Ratios) => number,
    title: string,
  ): Column<Unit> => ({ ...num(key, header, (u) => get(unitRatios(u)), d, title), group });
  const per100 = t('units.group.per100');
  const perCrop = t('units.group.perCrop');
  const ratioCols: Column<Unit>[] = [
    ratio('aPerCost', t('units.attack'), per100, (r) => r.attackPerCost, t('units.ratio.attackPerCost')),
    ratio('diPerCost', t('units.col.defInf'), per100, (r) => r.defInfPerCost, t('units.ratio.defInfPerCost')),
    ratio('dcPerCost', t('units.col.defCav'), per100, (r) => r.defCavPerCost, t('units.ratio.defCavPerCost')),
    ratio('carryPerCost', t('units.carry'), per100, (r) => r.carryPerCost, t('units.ratio.carryPerCost')),
    ratio(
      'aPerCrop',
      t('units.attack'),
      perCrop,
      (r) => r.attackPerCrop,
      t('units.ratio.attackPerCropTitle'),
    ),
    ratio('dPerCrop', t('units.col.def'), perCrop, (r) => r.defPerCrop, t('units.ratio.defPerCropTitle')),
  ];

  const columns = [nameCol, ...(view === 'stats' ? statsCols : ratioCols)];

  const card = (u: Unit) => {
    const r = unitRatios(u);
    const trio: [string, string, IconName][] =
      view === 'stats'
        ? [
            [t('units.attack'), n(u.attack), 'sword'],
            [t('units.col.defInf'), n(u.defInf), 'shield'],
            [t('units.col.defCav'), n(u.defCav), 'horse'],
          ]
        : [
            [t('units.ratio.attackPerCost'), d(r.attackPerCost), 'sword'],
            [t('units.ratio.defInfPerCost'), d(r.defInfPerCost), 'shield'],
            [t('units.ratio.defCavPerCost'), d(r.defCavPerCost), 'horse'],
          ];
    return (
      <Link
        to={`/units/${u.id}${search}`}
        className={styles.card}
        aria-current={u.id === selected?.id ? 'page' : undefined}
      >
        <span className={styles.cardHead}>
          <span className={styles.cardIcon}>
            <Icon name={typeIcon[u.type]} size={18} />
          </span>
          <span className={styles.cardName}>
            {u.name}
            <span className={styles.cardType}>
              {showTribe && (
                <>
                  <TribeDot tribe={u.tribe} /> {t(`tribe.${u.tribe}`)} ·{' '}
                </>
              )}
              {t(`unitType.${u.type}`)}
            </span>
          </span>
          <Icon name="chevronRight" size={18} className={styles.cardArrow} />
        </span>
        <span className={styles.trio}>
          {trio.map(([label, value, icon]) => (
            <span key={label} className={styles.trioItem}>
              <span className={styles.trioLabel}>
                <Icon name={icon} size={14} />
                {label}
              </span>
              <span className={styles.trioValue}>{value}</span>
            </span>
          ))}
        </span>
        <Resources value={u.cost} hideZero size="sm" showTotal />
        <span className={styles.cardMeta}>
          {t('common.fieldsPerHour', { n: n(u.speed) })} · {t('units.carry')} {n(u.carry)} ·{' '}
          {t('units.upkeepValue', { n: n(u.upkeep) })}
        </span>
      </Link>
    );
  };

  return (
    <div className={layout.page}>
      <PageHeader title={t('nav.units')} description={t('units.description')} />
      <div className={layout.toolbar}>
        <ChipGroup<TribeFilter>
          label={t('tribe.label')}
          value={tribeFilter}
          onChange={(v) => setParam('tribe', v === myTribe ? null : v)}
          options={[
            ...TRIBES.map((tr) => ({ value: tr, tribe: tr, label: t(`tribe.${tr}`) })),
            { value: 'all' as const, label: t('units.allTribes') },
          ]}
        />
        <Segmented<View>
          label={t('units.view')}
          size="sm"
          value={view}
          onChange={(v) => setParam('view', v === 'stats' ? null : v)}
          options={[
            { value: 'stats', label: t('units.view.stats') },
            { value: 'ratios', label: t('units.view.ratios') },
          ]}
        />
      </div>

      <div className={layout.withDetail}>
        <div className={layout.stack}>
          <DataTable
            caption={t('nav.units')}
            columns={columns}
            rows={rows}
            rowKey={(u) => u.id}
            isRowActive={(u) => u.id === selected?.id}
            onRowClick={open}
            mobileCard={card}
            compact
          />
          <p className={layout.small}>{t('units.note')}</p>
          <SourceFooter info={unitsSource} />
        </div>
        {selected && <UnitDetail unit={selected} onClose={() => void navigate(`/units${search}`)} />}
        {unitId && !selected && <EmptyState icon="alert">{t('units.notFound', { id: unitId })}</EmptyState>}
      </div>
    </div>
  );
}

function UnitDetail({ unit, onClose }: { readonly unit: Unit; readonly onClose: () => void }) {
  const t = useT();
  const l = useL();
  const fmt = useFormat();
  useTrackRecent({ path: `/units/${unit.id}`, title: unit.name, kind: 'unit' });
  const n = fmt.number;
  const d = (v: number) => fmt.decimal(v, 1);
  const r = unitRatios(unit);
  return (
    <DetailPanel title={unit.name} onClose={onClose} focusKey={unit.id}>
      <div className={styles.metaBadges}>
        <Badge tribe={unit.tribe}>{t(`tribe.${unit.tribe}`)}</Badge>
        <Badge icon={typeIcon[unit.type]}>{t(`unitType.${unit.type}`)}</Badge>
        <Badge>{l(buildingName(unit.building))}</Badge>
      </div>

      <StatGrid>
        <Stat icon="sword" label={t('units.attack')} value={n(unit.attack)} />
        <Stat icon="shield" label={t('units.defInf')} value={n(unit.defInf)} />
        <Stat icon="horse" label={t('units.defCav')} value={n(unit.defCav)} />
        <Stat icon="clock" label={t('units.speed')} value={t('common.fieldsPerHour', { n: n(unit.speed) })} />
        <Stat icon="cart" label={t('units.carry')} value={n(unit.carry)} />
        <Stat icon="wheat" label={t('units.upkeep')} value={t('units.upkeepValue', { n: n(unit.upkeep) })} />
      </StatGrid>

      <section className={layout.stack}>
        <SectionLabel>{t('units.trainingCost')}</SectionLabel>
        <Resources value={unit.cost} showTotal hideZero />
      </section>

      <section className={layout.stack}>
        <SectionLabel>{t('units.view.ratios')}</SectionLabel>
        <dl className={styles.ratios}>
          <dt>{t('units.ratio.attackPerCost')}</dt>
          <dd>{d(r.attackPerCost)}</dd>
          <dt>{t('units.ratio.defPerCost')}</dt>
          <dd>
            {d(r.defInfPerCost)} / {d(r.defCavPerCost)}
          </dd>
          <dt>{t('units.ratio.attackPerCrop')}</dt>
          <dd>{d(r.attackPerCrop)}</dd>
          <dt>{t('units.ratio.carryPerCost')}</dt>
          <dd>{d(r.carryPerCost)}</dd>
        </dl>
      </section>

      <section className={layout.stack}>
        <SectionLabel>{t('units.requirements')}</SectionLabel>
        {unit.requires.length === 0 ? (
          <p className={layout.small}>{t('units.noRequirements')}</p>
        ) : (
          <div className={styles.reqs}>
            {unit.requires.map((req) => (
              <Link
                key={req.building}
                to={`/buildings/${req.building}?lvl=${req.level}`}
                className={styles.req}
              >
                {l(buildingName(req.building))}
                <Badge tone="accent">{req.level}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={layout.stack}>
        <SectionLabel>{t('units.research')}</SectionLabel>
        {unit.research ? (
          <>
            <Resources value={unit.research.cost} hideZero showTotal size="sm" />
            <Callout tone="warn">
              {t('units.researchTime', { time: fmt.duration(unit.research.time) })}
            </Callout>
          </>
        ) : (
          <p className={layout.small}>{t('units.noResearch')}</p>
        )}
      </section>

      <a href={unit.source} target="_blank" rel="noreferrer" className={styles.external}>
        {t('units.article')}
        <Icon name="external" size={16} />
      </a>
    </DetailPanel>
  );
}
