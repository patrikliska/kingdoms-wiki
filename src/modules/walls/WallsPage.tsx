import { useAtomValue } from 'jotai';
import { Link, useSearchParams } from 'react-router';
import { tribeAtom } from '../../app/state';
import { DataTable, type Column } from '../../components/DataTable';
import { Icon } from '../../components/Icon';
import layout from '../../components/layout.module.css';
import { Resources } from '../../components/Resources';
import { SourceFooter } from '../../components/SourceFooter';
import { Badge, Callout, Card, ChipGroup, PageHeader, Stat, StatGrid } from '../../components/ui';
import { buildingsSource } from '../../data/buildings';
import type { BuildingLevel } from '../../data/buildingTypes';
import { tribes, tribesSource } from '../../data/tribes';
import { cumulativeTotals } from '../../domain/cumulative';
import { TRIBES, type Tribe } from '../../domain/types';
import { useFormat, useL, useT } from '../../lib/i18n';
import { buildingById } from '../buildings/buildingIndex';
import styles from './Walls.module.css';

const WALL_ID: Record<Tribe, string> = { roman: 'city-wall', gaul: 'palisade', teuton: 'earth-wall' };
const MAX = 20;

function wallLevels(tribe: Tribe): readonly BuildingLevel[] {
  return buildingById.get(WALL_ID[tribe])?.levels ?? [];
}

function isTribe(v: string | null): v is Tribe {
  return v !== null && (TRIBES as readonly string[]).includes(v);
}

export function WallsPage() {
  const t = useT();
  const l = useL();
  const fmt = useFormat();
  const myTribe = useAtomValue(tribeAtom);
  const [params, setParams] = useSearchParams();

  // Which wall to show: ?wall=<tribe>, defaulting to the player's own.
  const wallParam = params.get('wall');
  const tribe: Tribe = isTribe(wallParam) ? wallParam : myTribe;
  const lvlParam = Number.parseInt(params.get('lvl') ?? '', 10);
  const level = Number.isFinite(lvlParam) ? Math.min(MAX, Math.max(1, lvlParam)) : MAX;

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const pct = (v: number | undefined) => (v === undefined ? '–' : `+${fmt.percent(v * 100, 1)}`);
  const wall = buildingById.get(WALL_ID[tribe]);
  const levels = wallLevels(tribe);
  const cumulative = cumulativeTotals(levels);
  const current = levels[level - 1];
  const maxBonus = Math.max(...TRIBES.map((tr) => wallLevels(tr)[level - 1]?.effects.defBonus ?? 0));

  const columns: Column<BuildingLevel>[] = [
    { key: 'lvl', header: t('common.level'), align: 'end', render: (lv) => lv.lvl },
    { key: 'bonus', header: t('effect.defBonus'), align: 'end', render: (lv) => pct(lv.effects.defBonus) },
    {
      key: 'flat',
      header: t('effect.defFlat'),
      align: 'end',
      render: (lv) => fmt.number(lv.effects.defFlat ?? 0),
    },
    {
      key: 'cost',
      header: t('buildings.col.cost'),
      render: (lv) => <Resources value={lv.cost} variant="plain" />,
    },
    {
      key: 'cum',
      header: t('buildings.col.cum'),
      title: t('buildings.col.cumTitle'),
      align: 'end',
      render: (lv) => fmt.number(cumulative[lv.lvl - 1] ?? 0),
    },
  ];

  return (
    <div className={layout.page}>
      <PageHeader title={t('nav.walls')} description={t('walls.description')} />

      <ChipGroup<Tribe>
        label={t('tribes.wall')}
        value={tribe}
        onChange={(v) => setParam('wall', v === myTribe ? null : v)}
        options={TRIBES.map((tr) => ({
          value: tr,
          tribe: tr,
          label: buildingById.get(WALL_ID[tr])?.name ?? tr,
          ariaLabel: `${buildingById.get(WALL_ID[tr])?.name} – ${t(`tribe.${tr}`)}`,
        }))}
      />

      {wall && current && (
        <Card
          title={
            <span className={styles.wallTitle}>
              {wall.name}
              <Badge tribe={tribe}>{t(`tribe.${tribe}`)}</Badge>
            </span>
          }
        >
          <div className={styles.slider}>
            <label htmlFor="wall-level" className={styles.sliderLabel}>
              {t('common.level')} <strong>{level}</strong>
            </label>
            <input
              id="wall-level"
              type="range"
              min={1}
              max={MAX}
              value={level}
              onChange={(e) => setParam('lvl', e.target.value === String(MAX) ? null : e.target.value)}
              style={{ ['--fill' as string]: `${((level - 1) / (MAX - 1)) * 100}%` }}
            />
            <div className={styles.sliderScale} aria-hidden="true">
              <span>1</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>

          <StatGrid>
            <Stat emphasis icon="shield" label={t('effect.defBonus')} value={pct(current.effects.defBonus)} />
            <Stat label={t('effect.defFlat')} value={fmt.number(current.effects.defFlat ?? 0)} />
            <Stat label={t('walls.totalCost', { n: level })} value={fmt.number(cumulative[level - 1] ?? 0)} />
          </StatGrid>

          <div className={styles.levelCost}>
            <span className={styles.levelCostLabel}>{t('walls.levelCost', { n: level })}</span>
            <Resources value={current.cost} showTotal />
          </div>

          <Link to={`/buildings/${wall.id}?lvl=${level}`} className={styles.calcLink}>
            {t('walls.calcLink')}
            <Icon name="arrowRight" size={16} />
          </Link>
        </Card>
      )}

      <Card title={t('walls.compareTitle', { n: level })}>
        <ul className={styles.bars}>
          {TRIBES.map((tr) => {
            const lv = wallLevels(tr)[level - 1];
            const bonus = lv?.effects.defBonus ?? 0;
            return (
              <li key={tr} data-current={tr === tribe || undefined}>
                <span className={styles.barName}>
                  {buildingById.get(WALL_ID[tr])?.name}
                  <span className={styles.barTribe}>{t(`tribe.${tr}`)}</span>
                </span>
                <span className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    data-tribe={tr}
                    style={{ width: `${maxBonus ? (bonus / maxBonus) * 100 : 0}%` }}
                  />
                </span>
                <span className={styles.barValue}>
                  {pct(bonus)}
                  <span className={styles.barFlat}>+{fmt.number(lv?.effects.defFlat ?? 0)}</span>
                </span>
                <span className={styles.barNote}>{l(tribes[tr].wall.summary)}</span>
              </li>
            );
          })}
        </ul>
        <Callout>{t('walls.ramNote')}</Callout>
      </Card>

      <details className={styles.details}>
        <summary>
          {t('buildings.allLevels')}
          <Icon name="chevronDown" size={18} />
        </summary>
        {wall && (
          <DataTable
            caption={t('walls.tableCaption', { name: wall.name })}
            columns={columns}
            rows={levels}
            rowKey={(lv) => String(lv.lvl)}
            isRowActive={(lv) => lv.lvl === level}
            onRowClick={(lv) => setParam('lvl', lv.lvl === MAX ? null : String(lv.lvl))}
          />
        )}
        <p className={layout.small}>{t('walls.explain')}</p>
      </details>

      <Card title="Water Ditch">
        <div className={layout.stack}>
          <p>{t('walls.ditchText')}</p>
          <div className={styles.ditchBadges}>
            <Badge tone="accent">{t('site.city')}</Badge>
            <Badge tone="warn">{t('common.todo')}</Badge>
          </div>
          <Link to="/buildings/water-ditch" className={styles.calcLink}>
            {t('walls.ditchLink')}
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </Card>

      <SourceFooter info={[...buildingsSource.slice(0, 1), ...tribesSource]} />
    </div>
  );
}
