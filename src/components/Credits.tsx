import { useT } from '../lib/i18n';

/** Third-party asset credits — CC BY requires visible attribution. */
export function Credits({ className }: { readonly className?: string }) {
  const t = useT();
  return (
    <p className={className}>
      {t('credits.icons')}{' '}
      <a href="https://game-icons.net" target="_blank" rel="noreferrer">
        game-icons.net
      </a>{' '}
      (Delapouite, Lorc),{' '}
      <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
        CC BY 3.0
      </a>
      . {t('credits.fonts')}
    </p>
  );
}
