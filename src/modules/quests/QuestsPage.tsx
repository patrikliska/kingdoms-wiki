import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { roleAtom, tribeAtom } from '../../app/state';
import { Icon } from '../../components/Icon';
import layout from '../../components/layout.module.css';
import { Resources } from '../../components/Resources';
import { RoleSwitch } from '../../components/Settings';
import { SourceFooter } from '../../components/SourceFooter';
import { ChipGroup, EmptyState, PageHeader, SearchField, Switch } from '../../components/ui';
import { quests, questsSource, questTitlesSource } from '../../data/quests';
import { QUEST_GIVERS, type Quest, type QuestGiver } from '../../data/questTypes';
import { lineage } from '../../domain/questGraph';
import { filterQuests, questVisibleFor } from '../../domain/quests';
import { rewardFor } from '../../domain/resources';
import { useL, useT } from '../../lib/i18n';
import { QuestBadges } from './QuestBadges';
import { QuestDetail } from './QuestDetail';
import { questGiverNames } from '../../data/questGivers';
import { questIndex } from './questIndex';
import { QuestTabs } from './QuestTabs';
import styles from './Quests.module.css';

type GiverFilter = QuestGiver | 'all';

function isGiver(v: string | null): v is QuestGiver {
  return v !== null && (QUEST_GIVERS as readonly string[]).includes(v);
}

export function QuestsPage() {
  const t = useT();
  const l = useL();
  const { questId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tribe = useAtomValue(tribeAtom);
  const role = useAtomValue(roleAtom);

  const giverParam = params.get('giver');
  const giver: GiverFilter = isGiver(giverParam) ? giverParam : 'all';
  const query = params.get('q') ?? '';
  const allRoles = params.get('roles') === 'all';
  const branchOnly = params.get('branch') === '1';

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const selected = questId ? questIndex.byId.get(questId) : undefined;
  const line = useMemo(() => (selected ? lineage(questIndex, selected.id) : null), [selected]);

  const visible = useMemo(() => {
    const list = filterQuests(quests, { giver, query, tribe, role, allRoles });
    return branchOnly && line ? list.filter((q) => line.has(q.id)) : list;
  }, [giver, query, tribe, role, allRoles, branchOnly, line]);

  // Counts per giver ignore the giver filter itself, so the chips show what you'd get.
  const giverCounts = useMemo(() => {
    const base = filterQuests(quests, { giver: 'all', query, tribe, role, allRoles });
    const by = (g: QuestGiver) => base.filter((q) => q.giver === g).length;
    return { all: base.length, wren: by('wren'), markus: by('markus'), chieftain: by('chieftain') };
  }, [query, tribe, role, allRoles]);

  const groups = QUEST_GIVERS.map((g) => ({ giver: g, items: visible.filter((q) => q.giver === g) })).filter(
    (g) => g.items.length > 0,
  );

  const search = params.toString() ? `?${params.toString()}` : '';
  const closeDetail = () => void navigate(`/quests${search}`);
  const totalForRole = quests.filter((q) => questVisibleFor(q, tribe, role, false)).length;

  return (
    <div className={layout.page}>
      <PageHeader title={t('nav.quests')} description={t('quests.description', { count: totalForRole })} />
      <QuestTabs storyActive search={search} />

      <div className={layout.toolbar}>
        <SearchField
          value={query}
          onChange={(v) => setParam('q', v)}
          placeholder={t('quests.search.placeholder')}
          label={t('quests.search.label')}
        />
        <ChipGroup<GiverFilter>
          label={t('quests.giver')}
          value={giver}
          onChange={(v) => setParam('giver', v === 'all' ? null : v)}
          options={[
            { value: 'all', label: t('quests.giver.all'), count: giverCounts.all },
            ...QUEST_GIVERS.map((g) => ({ value: g, label: l(questGiverNames[g]), count: giverCounts[g] })),
          ]}
        />
        <div className={layout.toolbarRow}>
          <RoleSwitch size="sm" />
          <Switch
            label={t('quests.otherRole')}
            checked={allRoles}
            onChange={(c) => setParam('roles', c ? 'all' : null)}
          />
          {selected && (
            <Switch
              label={t('quests.branchOnly', { name: l(selected.name) })}
              checked={branchOnly}
              onChange={(c) => setParam('branch', c ? '1' : null)}
            />
          )}
        </div>
      </div>

      <div className={layout.withDetail}>
        <div className={styles.list}>
          {groups.length === 0 && <EmptyState>{t('quests.empty')}</EmptyState>}
          {groups.map((g) => (
            <section key={g.giver} aria-labelledby={`giver-${g.giver}`} className={styles.group}>
              <h2 id={`giver-${g.giver}`} className={styles.groupTitle}>
                {l(questGiverNames[g.giver])}
                <span className={styles.count}>{g.items.length}</span>
              </h2>
              <ul className={styles.items}>
                {g.items.map((q) => (
                  <QuestRow
                    key={q.id}
                    quest={q}
                    search={search}
                    selected={q.id === selected?.id}
                    inLine={line?.has(q.id) ?? false}
                  />
                ))}
              </ul>
            </section>
          ))}
          <SourceFooter info={[questsSource, questTitlesSource]} />
        </div>

        {selected && <QuestDetail quest={selected} search={search} onClose={closeDetail} />}
        {questId && !selected && (
          <EmptyState icon="alert">
            {t('quests.notFound', { id: questId })} <Link to="/quests">{t('quests.backToList')}</Link>
          </EmptyState>
        )}
      </div>
    </div>
  );
}

interface QuestRowProps {
  readonly quest: Quest;
  readonly search: string;
  readonly selected: boolean;
  readonly inLine: boolean;
}

function QuestRow({ quest, search, selected, inLine }: QuestRowProps) {
  const t = useT();
  const l = useL();
  const tribe = useAtomValue(tribeAtom);
  const reward = quest.reward ? rewardFor(quest.reward, tribe) : null;
  return (
    <li>
      <Link
        to={`/quests/${quest.id}${search}`}
        className={styles.item}
        aria-current={selected ? 'page' : undefined}
        data-in-line={inLine && !selected ? '' : undefined}
      >
        <span className={styles.itemMain}>
          <span className={styles.itemHead}>
            <span className={styles.itemName}>{l(quest.name)}</span>
            <QuestBadges quest={quest} />
          </span>
          <span className={styles.itemReward}>
            {reward ? (
              <Resources value={reward} hideZero size="sm" other={reward.other} />
            ) : (
              <span className={styles.unknown}>{t('quests.rewardUnknown')}</span>
            )}
          </span>
        </span>
        <Icon name="chevronRight" size={18} className={styles.chevron} />
      </Link>
    </li>
  );
}
