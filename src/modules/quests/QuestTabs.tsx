import { TabLinks } from '../../components/ui';
import { useT } from '../../lib/i18n';

/** Story / Daily tabs shared by both quest pages. */
export function QuestTabs({
  storyActive = false,
  search = '',
}: {
  readonly storyActive?: boolean;
  readonly search?: string;
}) {
  const t = useT();
  return (
    <TabLinks
      label={t('quests.tabs')}
      tabs={[
        { to: `/quests${search}`, label: t('quests.tab.story'), end: true, active: storyActive },
        { to: '/quests/daily', label: t('quests.tab.daily') },
      ]}
    />
  );
}
