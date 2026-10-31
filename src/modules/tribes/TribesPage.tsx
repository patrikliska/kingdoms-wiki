import { useAtomValue } from 'jotai';
import { Link, useSearchParams } from 'react-router';
import { tribeAtom } from '../../app/state';
import { Icon } from '../../components/Icon';
import layout from '../../components/layout.module.css';
import { SourceFooter } from '../../components/SourceFooter';
import {
  Callout,
  Card,
  ChipGroup,
  PageHeader,
  SectionLabel,
  Stat,
  StatGrid,
  TribeDot,
} from '../../components/ui';
import { tribes, tribesSource, type TribeInfo } from '../../data/tribes';
import { units } from '../../data/units';
import { TRIBES, type Tribe } from '../../domain/types';
import { useFormat, useL, useT } from '../../lib/i18n';
import { buildingById } from '../buildings/buildingIndex';
import styles from './Tribes.module.css';

type TribeFilter = Tribe | 'all';

function isTribeFilter(v: string | null): v is TribeFilter {
  return v === 'all' || (v !== null && (TRIBES as readonly string[]).includes(v));
}

export function TribesPage() {
  const t = useT();
  const myTribe = useAtomValue(tribeAtom);
  const [params, setParams] = useSearchParams();
  const param = params.get('tribe') ?? (params.get('compare') === '1' ? 'all' : null);
  const shown: TribeFilter = isTribeFilter(param) ? param : myTribe;

  return (
    <div className={layout.page}>
      <PageHeader title={t('nav.tribes')} description={t('tribes.description')} />
      <ChipGroup<TribeFilter>
        label={t('tribe.label')}
        value={shown}
        onChange={(v) => setParams(v === myTribe ? {} : { tribe: v }, { replace: true })}
        options={[
          ...TRIBES.map((tr) => ({ value: tr, tribe: tr, label: t(`tribe.${tr}`) })),
          { value: 'all' as const, label: t('common.compare') },
        ]}
      />
      {shown === 'all' ? <Comparison /> : <TribeDetail info={tribes[shown]} />}
      <SourceFooter info={tribesSource} />
    </div>
  );
}

function Comparison() {
  const t = useT();
  const l = useL();
  const fmt = useFormat();
  const rows: { label: string; value: (info: TribeInfo) => string }[] = [
    { label: t('tribes.merchantCapacity'), value: (i) => fmt.number(i.merchant.capacity) },
    {
      label: t('tribes.merchantSpeed'),
      value: (i) => t('common.fieldsPerHour', { n: fmt.number(i.merchant.speed) }),
    },
    { label: t('tribes.wall'), value: (i) => i.wall.name },
    { label: t('tribes.heroBonus'), value: (i) => l(i.heroBonus) },
    { label: t('tribes.troops'), value: (i) => l(i.troops) },
    { label: t('tribes.recommendedFor'), value: (i) => l(i.recommendedFor) },
  ];
  return (
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={t('tribes.merchantCompare')}>
      <table className={styles.table}>
        <thead>
          <tr>
            <td />
            {TRIBES.map((id) => (
              <th key={id} scope="col">
                <span className={styles.colHead}>
                  <TribeDot tribe={id} />
                  {t(`tribe.${id}`)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {TRIBES.map((id) => (
                <td key={id}>{r.value(tribes[id])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TribeDetail({ info }: { readonly info: TribeInfo }) {
  const t = useT();
  const l = useL();
  const fmt = useFormat();
  const tribeUnits = units.filter((u) => u.tribe === info.id);
  return (
    <>
      <section className={styles.hero} data-tribe={info.id} aria-labelledby="tribe-title">
        <span className={styles.emblem} aria-hidden="true">
          <Icon name="shield" size={30} />
        </span>
        <div className={styles.heroText}>
          <h2 id="tribe-title">{t(`tribe.${info.id}`)}</h2>
          <p>{l(info.troops)}</p>
          <p className={styles.recommended}>
            {t('tribes.recommendedFor')} <strong>{l(info.recommendedFor)}</strong>
          </p>
        </div>
      </section>

      <StatGrid>
        <Stat icon="cart" label={t('tribes.merchantCapacity')} value={fmt.number(info.merchant.capacity)} />
        <Stat
          icon="clock"
          label={t('tribes.merchantSpeed')}
          value={t('common.fieldsPerHour', { n: fmt.number(info.merchant.speed) })}
        />
        <Stat icon="walls" label={t('tribes.wall')} value={<Link to="/walls">{info.wall.name}</Link>} />
      </StatGrid>

      <Callout title={t('tribes.heroBonus')}>
        {l(info.heroBonus)}
        {info.heroBonusNote && <span className={styles.todo}> ({l(info.heroBonusNote)})</span>}
      </Callout>

      <div className={styles.columns}>
        <Card title={t('tribes.strengths')}>
          <ul className={styles.points} data-kind="pro">
            {info.strengths.map((s) => (
              <li key={s.en}>
                <Icon name="check" size={18} />
                {l(s)}
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t('tribes.weaknesses')}>
          <ul className={styles.points} data-kind="con">
            {info.weaknesses.map((s) => (
              <li key={s.en}>
                <Icon name="cross" size={18} />
                {l(s)}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title={t('tribes.specialBuildings')}>
        <ul className={styles.special}>
          {info.specialBuildings.map((b) => (
            <li key={b.id}>
              {buildingById.has(b.id) ? (
                <Link to={`/buildings/${b.id}`} className={styles.specialName}>
                  {b.name}
                  <Icon name="arrowRight" size={16} />
                </Link>
              ) : (
                <span className={styles.specialName}>{b.name}</span>
              )}
              <p>{l(b.summary)}</p>
            </li>
          ))}
        </ul>
      </Card>

      <section className={layout.stack} aria-labelledby="tribe-units">
        <SectionLabel id="tribe-units">{t('nav.units')}</SectionLabel>
        <div className={styles.units}>
          {tribeUnits.map((u) => (
            <Link key={u.id} to={`/units/${u.id}`} className={styles.unit}>
              {u.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
