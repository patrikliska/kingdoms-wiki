import { useSetAtom } from 'jotai';
import { reportOpenAtom } from '../../app/state';
import { useT } from '../../lib/i18n';
import { reportEnabled } from '../../lib/report';
import { Button } from '../ui';

/** Opens the "suggest a correction" form for the current page. */
export function ReportButton() {
  const t = useT();
  const setOpen = useSetAtom(reportOpenAtom);
  if (!reportEnabled) return null;
  return (
    <Button variant="ghost" size="sm" icon="flag" onClick={() => setOpen(true)}>
      {t('report.open')}
    </Button>
  );
}
