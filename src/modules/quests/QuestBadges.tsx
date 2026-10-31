import type { Quest } from '../../data/questTypes';
import { Badge } from '../../components/ui';
import { useT } from '../../lib/i18n';
import styles from './Quests.module.css';

export function QuestBadges({ quest }: { readonly quest: Quest }) {
  const t = useT();
  if (quest.role === 'all' && !quest.unverified) return null;
  return (
    <span className={styles.badges}>
      {quest.role !== 'all' && (
        <Badge tone="accent" icon={quest.role === 'king' ? 'crown' : undefined}>
          {t(`role.${quest.role}`)}
        </Badge>
      )}
      {quest.unverified && (
        <Badge tone="warn" title={t('quests.notInTable')}>
          {t('common.todo')}
        </Badge>
      )}
    </span>
  );
}
