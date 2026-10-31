import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Credits } from '../components/Credits';
import { Icon } from '../components/Icon';
import { LangSwitch, SettingsSheet, TribeChip } from '../components/Settings';
import { useLang, useT } from '../lib/i18n';
import { MORE_PATHS, SIDEBAR_NAV, TAB_NAV } from './nav';
import { SearchDialog } from './SearchDialog';
import { searchOpenAtom, themeAtom } from './state';
import styles from './Layout.module.css';

function useDocumentSettings() {
  const theme = useAtomValue(themeAtom);
  const lang = useLang();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

function Brand({ full = true }: { readonly full?: boolean }) {
  return (
    <Link to="/" className={styles.brand} aria-label="Kingdoms Companion">
      <img src="/favicon.svg" alt="" width="32" height="32" />
      {full && (
        <span className={styles.brandText}>
          Kingdoms <span className={styles.brandSub}>Companion</span>
        </span>
      )}
    </Link>
  );
}

export function Layout() {
  const t = useT();
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom);
  useDocumentSettings();

  // Scroll to top on page change (not on query-string changes like filters).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select');
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  const inMore = MORE_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        {t('layout.skip')}
      </a>

      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <Brand />
        <nav aria-label={t('nav.main')} className={styles.sideNav}>
          {SIDEBAR_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `${styles.sideLink} ${isActive ? styles.active : ''}`}
            >
              <Icon name={item.icon} />
              <span>{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <p>{t('layout.footer')}</p>
          <Credits />
        </div>
      </aside>

      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topInner}>
          <div className={styles.mobileBrand}>
            <Brand full={false} />
          </div>
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={() => setSearchOpen(true)}
            aria-label={t('search.open')}
            aria-keyshortcuts="Control+K Meta+K /"
          >
            <Icon name="search" size={18} />
            <span className={styles.searchPlaceholder} aria-hidden="true">
              {t('search.placeholder')}
            </span>
            <kbd className={styles.kbd} aria-hidden="true">
              Ctrl K
            </kbd>
          </button>
          <div className={styles.topActions}>
            <TribeChip />
            <LangSwitch size="sm" short />
          </div>
        </div>
      </header>

      <main id="main" className={styles.main}>
        <Outlet />
      </main>

      {/* Phone tab bar */}
      <nav aria-label={t('nav.main')} className={styles.tabbar}>
        {TAB_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `${styles.tab} ${isActive || (item.path === '/more' && inMore) ? styles.active : ''}`
            }
          >
            <span className={styles.tabIcon}>
              <Icon name={item.icon} size={22} />
            </span>
            <span>{t(item.label)}</span>
          </NavLink>
        ))}
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsSheet />
    </div>
  );
}
