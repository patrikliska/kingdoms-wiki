import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Link } from 'react-router';
import { roleAtom, tribeAtom } from '../../app/state';
import { useTrackRecent } from '../../app/useRecent';
import { Resources } from '../../components/Resources';
import { DetailPanel } from '../../components/Sheet';
import { Badge, Button, Callout, SectionLabel, TribeDot } from '../../components/ui';
import type { Quest } from '../../data/questTypes';
import { branchSummary } from '../../domain/quests';
import { isTribeSpecific, rewardFor, totalResources } from '../../domain/resources';
import { TRIBES } from '../../domain/types';
import { useL, useT } from '../../lib/i18n';
import { QuestBadges } from './QuestBadges';
import { questGiverNames } from '../../data/questGivers';
import { questIndex } from './questIndex';
import styles from './Quests.module.css';

interface QuestDetailProps {
  readonly quest: Quest;
  readonly search: string;
  readonly onClose: () => void;
}

export function QuestDetail({ quest, search, onClose }: QuestDetailProps) {
  const t = useT();
  const l = useL();
  const tribe = useAtomValue(tribeAtom);
  const role = useAtomValue(roleAtom);
  const [compare, setCompare] = useState(false);
  useTrackRecent({ path: `/quests/${quest.id}`, title: l(quest.name), kind: 'quest' });

  const requires = quest.requires.map((id) => questIndex.byId.get(id)).filter((q): q is Quest => !!q);
  const unlocks = (questIndex.unlocks.get(quest.id) ?? [])
    .map((id) => questIndex.byId.get(id))
    .filter((q): q is Quest => !!q);
  const branch = branchSummary(questIndex, quest.id, tribe, role);
  const reward = quest.reward ? rewardFor(quest.reward, tribe) : null;
  const perTribe = quest.reward && isTribeSpecific(quest.reward) ? quest.reward : null;

  return (
    <DetailPanel title={l(quest.name)} onClose={onClose} focusKey={quest.id}>
      <div className={styles.meta}>
        <Badge>{l(questGiverNames[quest.giver])}</Badge>
        <QuestBadges quest={quest} />
      </div>
      <p className={styles.task}>{quest.task}</p>

      <section className={styles.block} aria-labelledby="reward-title">
        <SectionLabel id="reward-title">{t('quests.reward')}</SectionLabel>
        {reward ? (
          <Resources
            value={reward}
            hideZero
            size="lg"
            showTotal={totalResources(reward) > 0}
            other={reward.other}
          />
        ) : (
          <Callout tone="warn">{t('quests.rewardMissing')}</Callout>
        )}
        {perTribe && (
          <>
            <Button
              size="sm"
              variant="ghost"
              icon="tribes"
              aria-expanded={compare}
              onClick={() => setCompare((c) => !c)}
            >
              {t('common.compare')}
            </Button>
            {compare && (
              <dl className={styles.compare}>
                {TRIBES.map((tr) => (
                  <div key={tr} data-current={tr === tribe || undefined}>
                    <dt>
                      <TribeDot tribe={tr} />
                      {t(`tribe.${tr}`)}
                    </dt>
                    <dd>
                      <Resources value={perTribe.rt[tr]} hideZero size="sm" />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
      </section>

      {quest.note && <Callout tone="warn">{l(quest.note)}</Callout>}

      <section className={styles.block} aria-labelledby="chain-title">
        <SectionLabel id="chain-title">{t('quests.chain')}</SectionLabel>
        <ol className={styles.chain}>
          {requires.length === 0 ? (
            <li className={styles.chainNote}>{t('quests.requiresNone')}</li>
          ) : (
            requires.map((q) => (
              <ChainLink key={q.id} quest={q} search={search} label={t('quests.requires')} />
            ))
          )}
          <li className={styles.chainCurrent} aria-current="step">
            <span className={styles.chainDot} />
            <span>{l(quest.name)}</span>
          </li>
          {unlocks.length === 0 ? (
            <li className={styles.chainNote}>{t('quests.unlocksNone')}</li>
          ) : (
            unlocks.map((q) => <ChainLink key={q.id} quest={q} search={search} label={t('quests.unlocks')} />)
          )}
        </ol>
      </section>

      {branch.count > 1 && (
        <section className={styles.branch} aria-labelledby="branch-title">
          <SectionLabel id="branch-title">{t('quests.branch')}</SectionLabel>
          <p className={styles.branchIntro}>{t('quests.branchIntro', { count: branch.count })}</p>
          <Resources value={branch.total} showTotal compact />
          {(branch.unknown > 0 || branch.withOther > 0) && (
            <p className={styles.branchNote}>
              {[
                branch.withOther > 0 ? t('quests.branchOther', { count: branch.withOther }) : null,
                branch.unknown > 0 ? t('quests.branchUnknown', { count: branch.unknown }) : null,
              ]
                .filter(Boolean)
                .join(' ')}
            </p>
          )}
        </section>
      )}
    </DetailPanel>
  );
}

function ChainLink({
  quest,
  search,
  label,
}: {
  readonly quest: Quest;
  readonly search: string;
  readonly label: string;
}) {
  const l = useL();
  return (
    <li className={styles.chainItem}>
      <span className={styles.chainDot} />
      <Link to={`/quests/${quest.id}${search}`}>
        <span className="visually-hidden">{label}: </span>
        {l(quest.name)}
      </Link>
      <span className={styles.chainGiver}>{l(questGiverNames[quest.giver])}</span>
    </li>
  );
}
