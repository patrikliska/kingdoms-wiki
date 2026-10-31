import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { langAtom, roleAtom, settingsOpenAtom, themeAtom, tribeAtom, type ThemeChoice } from '../app/state';
import { tribes } from '../data/tribes';
import { ROLES, TRIBES, type Lang, type Role } from '../domain/types';
import { useL, useT } from '../lib/i18n';
import { Icon } from './Icon';
import { ModalSheet } from './Sheet';
import { Segmented, TribeDot } from './ui';
import styles from './Settings.module.css';

/** Three big tribe cards — the most important personal setting. */
export function TribePicker({ compact = false }: { readonly compact?: boolean }) {
  const t = useT();
  const l = useL();
  const [tribe, setTribe] = useAtom(tribeAtom);
  return (
    <div
      role="group"
      aria-label={t('tribe.label')}
      className={styles.tribes}
      data-compact={compact || undefined}
    >
      {TRIBES.map((id) => (
        <button
          key={id}
          type="button"
          className={styles.tribe}
          data-tribe={id}
          aria-pressed={tribe === id}
          onClick={() => setTribe(id)}
        >
          <span className={styles.emblem} aria-hidden="true">
            <Icon name="shield" size={compact ? 18 : 22} />
          </span>
          <span className={styles.tribeText}>
            <span className={styles.tribeName}>{t(`tribe.${id}`)}</span>
            {!compact && <span className={styles.tribeHint}>{l(tribes[id].troops)}</span>}
          </span>
          {tribe === id && (
            <span className={styles.check} aria-hidden="true">
              <Icon name="check" size={16} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function RoleSwitch({
  size = 'md',
  block,
}: {
  readonly size?: 'sm' | 'md';
  readonly block?: boolean;
}) {
  const t = useT();
  const [role, setRole] = useAtom(roleAtom);
  return (
    <Segmented<Role>
      label={t('role.label')}
      size={size}
      block={block}
      value={role}
      onChange={setRole}
      options={ROLES.map((v) => ({ value: v, label: t(`role.${v}`) }))}
    />
  );
}

/** `short` = CZ / EN (header); otherwise full language names. */
export function LangSwitch({
  size = 'md',
  short = false,
  block,
}: {
  readonly size?: 'sm' | 'md';
  readonly short?: boolean;
  readonly block?: boolean;
}) {
  const t = useT();
  const [lang, setLang] = useAtom(langAtom);
  return (
    <Segmented<Lang>
      label={t('lang.label')}
      size={size}
      block={block}
      value={lang}
      onChange={setLang}
      options={[
        { value: 'cs', label: short ? 'CZ' : 'Čeština' },
        { value: 'en', label: short ? 'EN' : 'English' },
      ]}
    />
  );
}

export function ThemeSwitch({ block }: { readonly block?: boolean }) {
  const t = useT();
  const [theme, setTheme] = useAtom(themeAtom);
  const options: readonly ThemeChoice[] = ['system', 'light', 'dark'];
  return (
    <Segmented<ThemeChoice>
      label={t('theme.label')}
      block={block}
      value={theme}
      onChange={setTheme}
      options={options.map((v) => ({ value: v, label: t(`theme.${v}`) }))}
    />
  );
}

/** Header button showing the current tribe; opens the settings sheet. */
export function TribeChip() {
  const t = useT();
  const tribe = useAtomValue(tribeAtom);
  const role = useAtomValue(roleAtom);
  const open = useSetAtom(settingsOpenAtom);
  return (
    <button
      type="button"
      className={styles.chip}
      onClick={() => open(true)}
      aria-label={`${t('settings.open')}: ${t(`tribe.${tribe}`)}, ${t(`role.${role}`)}`}
    >
      <TribeDot tribe={tribe} />
      <span className={styles.chipTribe}>{t(`tribe.${tribe}`)}</span>
      <span className={styles.chipRole}>· {t(`role.${role}`)}</span>
      <Icon name="chevronDown" size={16} />
    </button>
  );
}

/** One place for every personal setting. */
export function SettingsSheet() {
  const t = useT();
  const [open, setOpen] = useAtom(settingsOpenAtom);
  return (
    <ModalSheet open={open} onClose={() => setOpen(false)} title={t('settings.title')}>
      <section className={styles.section}>
        <h3>{t('settings.tribe')}</h3>
        <p className={styles.hint}>{t('settings.tribeHint')}</p>
        <TribePicker />
      </section>
      <section className={styles.section}>
        <h3>{t('role.label')}</h3>
        <p className={styles.hint}>{t('settings.roleHint')}</p>
        <RoleSwitch block />
      </section>
      <section className={styles.section}>
        <h3>{t('lang.label')}</h3>
        <LangSwitch block />
      </section>
      <section className={styles.section}>
        <h3>{t('theme.label')}</h3>
        <ThemeSwitch block />
      </section>
    </ModalSheet>
  );
}
