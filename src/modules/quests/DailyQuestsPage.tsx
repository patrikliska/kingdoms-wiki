import { Icon, type IconName } from '../../components/Icon';
import layout from '../../components/layout.module.css';
import { SourceFooter } from '../../components/SourceFooter';
import { Callout, Card, PageHeader } from '../../components/ui';
import { dailyQuestsSource } from '../../data/quests';
import { useT, type MessageKey } from '../../lib/i18n';
import { QuestTabs } from './QuestTabs';
import styles from './Quests.module.css';

const STEPS: readonly { icon: IconName; text: MessageKey }[] = [
  { icon: 'quests', text: 'daily.where' },
  { icon: 'more', text: 'daily.slots' },
  { icon: 'clock', text: 'daily.refresh' },
  { icon: 'history', text: 'daily.swap' },
];

/**
 * The official article only describes how daily quests work — it lists no concrete
 * tasks, points or rewards, so we don't either (TODO: find a verified Kingdoms source).
 */
export function DailyQuestsPage() {
  const t = useT();
  return (
    <div className={layout.page}>
      <PageHeader title={t('nav.quests')} />
      <QuestTabs />
      <Card title={t('daily.title')}>
        <ul className={styles.steps}>
          {STEPS.map((s) => (
            <li key={s.text}>
              <span className={styles.stepIcon}>
                <Icon name={s.icon} size={18} />
              </span>
              {t(s.text)}
            </li>
          ))}
        </ul>
      </Card>
      <Callout tone="warn" title={t('common.todo')}>
        {t('daily.todo')}
      </Callout>
      <SourceFooter info={dailyQuestsSource} />
    </div>
  );
}
