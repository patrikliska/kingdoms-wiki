import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { tribeAtom } from '../../app/state';
import { useTrackRecent } from '../../app/useRecent';
import { DataTable, type Column } from '../../components/DataTable';
import { Icon } from '../../components/Icon';
import layout from '../../components/layout.module.css';
import { Resources } from '../../components/Resources';
import { SourceFooter } from '../../components/SourceFooter';
import {
  Badge,
  Callout,
  Card,
  EmptyState,
  PageHeader,
  Segmented,
  Stat,
  StatGrid,
  Stepper,
} from '../../components/ui';
import { buildingsSource, buildingsVerifiedAt as VERIFIED_AT } from '../../data/buildings';
import type { Building, BuildingLevel, BuildingSite } from '../../data/buildingTypes';
import { buildTime, upgradeRange, WORLD_SPEEDS, type WorldSpeed } from '../../domain/buildings';
import { cumulativeTotals } from '../../domain/cumulative';
import { totalResources } from '../../domain/resources';
import { useFormat, useL, useT } from '../../lib/i18n';
import { buildingById, buildingName, effectColumns, mbFactorFor } from './buildingIndex';
import { categoryIcon } from './categoryIcon';
import styles from './Buildings.module.css';

function intParam(v: string | null, fallback: number, min: number, max: number): number {
  const n = v === null ? NaN : Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export function BuildingDetailPage() {
  const t = useT();
  const { buildingId } = useParams();
  const building = buildingId ? buildingById.get(buildingId) : undefined;
  if (!building) {
    return (
      <EmptyState icon="alert">
        {t('buildings.notFound', { id: buildingId ?? '' })} <Link to="/buildings">{t('buildings.back')}</Link>
      </EmptyState>
    );
  }
  return <BuildingDetail building={building} />;
}

function BuildingDetail({ building: b }: { readonly building: Building }) {
  const t = useT();
  const l = useL();
  const fmt = useFormat();
  const tribe = useAtomValue(tribeAtom);
  const [params, setParams] = useSearchParams();
  useTrackRecent({ path: `/buildings/${b.id}`, title: b.name, kind: 'building' });

  const to = intParam(params.get('lvl'), b.maxLevel, 1, b.maxLevel);
  const from = intParam(params.get('from'), 0, 0, to - 1);
  const mb = intParam(params.get('mb'), 1, 1, 20);
  const speedParam = intParam(params.get('speed'), 1, 1, 5);
  const speed: WorldSpeed = (WORLD_SPEEDS as readonly number[]).includes(speedParam)
    ? (speedParam as WorldSpeed)
    : 1;

  const setParam = (key: string, value: number, fallback: number) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, String(value));
    setParams(next, { replace: true });
  };
  const setRange = (nextFrom: number, nextTo: number) => {
    const next = new URLSearchParams(params);
    if (nextFrom === 0) next.delete('from');
    else next.set('from', String(nextFrom));
    if (nextTo === b.maxLevel) next.delete('lvl');
    else next.set('lvl', String(nextTo));
    setParams(next, { replace: true });
  };

  const factor = useMemo(() => mbFactorFor(b, mb), [b, mb]);
  const range = upgradeRange(b.levels, from, to, factor, speed);
  const effects = effectColumns(b, tribe, speed, t, fmt);
  const isMainBuilding = b.id === 'main-building';
  const cumulative = cumulativeTotals(b.levels);

  const columns: Column<BuildingLevel>[] = [
    { key: 'lvl', header: t('common.level'), render: (lv) => lv.lvl, align: 'end' },
    {
      key: 'cost',
      header: t('buildings.col.cost'),
      render: (lv) => <Resources value={lv.cost} variant="plain" />,
    },
    {
      key: 'sum',
      header: 'Σ',
      title: t('buildings.col.sumTitle'),
      align: 'end',
      render: (lv) => fmt.number(totalResources(lv.cost)),
    },
    {
      key: 'cum',
      header: t('buildings.col.cum'),
      title: t('buildings.col.cumTitle'),
      align: 'end',
      render: (lv) => fmt.number(cumulative[lv.lvl - 1] ?? 0),
    },
    {
      key: 'time',
      header: t('buildings.col.time'),
      align: 'end',
      render: (lv) => fmt.duration(buildTime(lv.timeBase, factor(lv.lvl), speed)),
    },
    ...effects.map((e): Column<BuildingLevel> => ({
      key: e.key,
      header: e.label,
      align: 'end',
      render: (lv) => {
        const v = lv.effects[e.key];
        return v === undefined ? '–' : e.format(v);
      },
    })),
    {
      key: 'pop',
      header: t('buildings.population'),
      title: t('buildings.col.popTitle'),
      align: 'end',
      render: (lv) => fmt.number(lv.pop),
    },
    {
      key: 'cp',
      header: t('buildings.col.cp'),
      title: t('buildings.col.cpTitle'),
      align: 'end',
      render: (lv) => fmt.number(lv.cp * speed),
    },
  ];

  const notes = [
    t('buildings.timeNote'),
    isMainBuilding ? t('buildings.mbNote') : null,
    speed !== 1 ? t('buildings.speedNote') : null,
  ].filter(Boolean);

  return (
    <div className={layout.page}>
      <Link to="/buildings" className={styles.back}>
        <Icon name="chevronLeft" size={18} />
        {t('buildings.back')}
      </Link>

      <PageHeader
        title={b.name}
        eyebrow={
          <span className={styles.eyebrow}>
            <span className={styles.cardIcon} data-cat={b.category}>
              <Icon name={categoryIcon[b.category]} size={18} />
            </span>
            {t(`buildingCategory.${b.category}`)}
          </span>
        }
      >
        <div className={styles.headBadges}>
          <Badge>{t('buildings.maxLevel', { n: b.maxLevel })}</Badge>
          {b.tribe && (
            <Badge tribe={b.tribe}>{t('buildings.onlyTribe', { tribe: t(`tribe.${b.tribe}`) })}</Badge>
          )}
          {b.where.map((w) => (
            <Badge key={w} tone="accent">
              {t(`site.${w}`)}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <Card title={t('buildings.calc')}>
        <div className={styles.calcInputs}>
          <Stepper
            label={t('buildings.fromLevel')}
            value={from}
            min={0}
            max={to - 1}
            onChange={(v) => setRange(v, to)}
          />
          <Icon name="arrowRight" size={18} className={styles.calcArrow} />
          <Stepper
            label={t('buildings.toLevel')}
            value={to}
            min={1}
            max={b.maxLevel}
            onChange={(v) => setRange(Math.min(from, v - 1), v)}
          />
          {!isMainBuilding && (
            <Stepper
              label="Main Building"
              value={mb}
              min={1}
              max={20}
              onChange={(v) => setParam('mb', v, 1)}
            />
          )}
          <div className={styles.speed}>
            <span className={styles.fieldLabel}>{t('buildings.worldSpeed')}</span>
            <Segmented<`${WorldSpeed}`>
              label={t('buildings.worldSpeed')}
              value={`${speed}`}
              onChange={(v) => setParam('speed', Number(v), 1)}
              options={WORLD_SPEEDS.map((s) => ({ value: `${s}` as `${WorldSpeed}`, label: `${s}×` }))}
            />
          </div>
        </div>

        <StatGrid>
          <Stat
            emphasis
            label={t('buildings.costN', { n: range.levels })}
            value={<Resources value={range.cost} showTotal size="lg" />}
          />
          <Stat icon="clock" label={t('buildings.buildTime')} value={fmt.duration(range.time)} />
          <Stat icon="users" label={t('buildings.population')} value={`+${fmt.number(range.pop)}`} />
          <Stat
            icon="sparkle"
            label={t('buildings.cp')}
            value={t('buildings.cpValue', { n: fmt.number(range.cp * speed) })}
          />
        </StatGrid>
        <p className={styles.calcNote}>{notes.join(' ')}</p>
      </Card>

      <div className={styles.facts}>
        <Card title={t('buildings.requirements')}>
          {b.requires.length === 0 ? (
            <p className={layout.muted}>{t('buildings.none')}</p>
          ) : (
            <ul className={styles.reqs}>
              {b.requires.map((r) => (
                <li key={r.id}>
                  <Link to={`/buildings/${r.id}?lvl=${r.level}`} className={styles.req}>
                    {buildingName(r.id)}
                    <Badge tone="accent">{r.level}</Badge>
                  </Link>
                  {r.alt?.map((a) => (
                    <span key={a} className={styles.reqAlt}>
                      {t('buildings.or')}{' '}
                      <Link to={`/buildings/${a}`} className={styles.req}>
                        {buildingName(a)}
                      </Link>
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
          {b.levelCaps && (
            <p className={styles.caps}>
              {t('buildings.levelCaps')}{' '}
              {(Object.entries(b.levelCaps) as [BuildingSite, number][])
                .map(([site, lvl]) => `${t(`site.${site}`)} ${lvl}`)
                .join(' · ')}
            </p>
          )}
        </Card>
        {b.notes.length > 0 && (
          <Card title={t('buildings.notes')}>
            <div className={layout.stack}>
              {b.notes.map((n) => (
                <Callout key={n.en}>{l(n)}</Callout>
              ))}
            </div>
          </Card>
        )}
      </div>

      <section aria-labelledby="levels-title" className={layout.stack}>
        <h2 id="levels-title">{t('buildings.allLevels')}</h2>
        <DataTable
          caption={t('buildings.tableCaption', { name: b.name })}
          columns={columns}
          rows={b.levels}
          rowKey={(lv) => String(lv.lvl)}
          isRowActive={(lv) => lv.lvl > from && lv.lvl <= to}
          onRowClick={(lv) => setRange(Math.min(from, lv.lvl - 1), lv.lvl)}
        />
        <SourceFooter
          info={
            b.article
              ? [...buildingsSource.slice(0, 1), { source: b.article, verifiedAt: VERIFIED_AT }]
              : buildingsSource
          }
        />
      </section>
    </div>
  );
}
