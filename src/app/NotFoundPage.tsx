import { Link } from 'react-router';
import { EmptyState } from '../components/ui';
import { useT } from '../lib/i18n';

export function NotFoundPage() {
  const t = useT();
  return (
    <EmptyState icon="alert">
      {t('common.notFound')} <Link to="/">{t('nav.home')}</Link>
    </EmptyState>
  );
}
