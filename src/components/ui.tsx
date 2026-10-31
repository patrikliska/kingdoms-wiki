import { useId, type ReactNode } from 'react';
import { NavLink } from 'react-router';
import type { Tribe } from '../domain/types';
import { useT } from '../lib/i18n';
import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

interface ButtonProps {
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly size?: 'sm' | 'md';
  readonly icon?: IconName;
  readonly type?: 'button' | 'submit';
  readonly 'aria-label'?: string;
  readonly 'aria-expanded'?: boolean;
  readonly className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  icon,
  type = 'button',
  className,
  ...aria
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${className ?? ''}`}
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      {...aria}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Single-choice controls (aria-pressed toggle buttons)
// ---------------------------------------------------------------------------

export interface Option<V extends string> {
  readonly value: V;
  readonly label: ReactNode;
  /** Plain-text name when `label` isn't text. */
  readonly ariaLabel?: string;
  readonly count?: number;
  readonly tribe?: Tribe;
}

interface ChoiceProps<V extends string> {
  readonly label: string;
  readonly options: readonly Option<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
  readonly size?: 'sm' | 'md';
  /** Stretch to the full width (segments share the space). */
  readonly block?: boolean;
}

/** Compact segmented control — for 2–4 short options. */
export function Segmented<V extends string>({
  label,
  options,
  value,
  onChange,
  size = 'md',
  block = false,
}: ChoiceProps<V>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={styles.segmented}
      data-size={size}
      data-block={block || undefined}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          aria-label={o.ariaLabel}
          onClick={() => onChange(o.value)}
        >
          {o.tribe && <TribeDot tribe={o.tribe} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Filter chips — scroll horizontally on small screens; can show counts. */
export function ChipGroup<V extends string>({ label, options, value, onChange }: ChoiceProps<V>) {
  return (
    <div role="group" aria-label={label} className={styles.chips}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={styles.chip}
          aria-pressed={o.value === value}
          aria-label={o.ariaLabel}
          onClick={() => onChange(o.value)}
        >
          {o.tribe && <TribeDot tribe={o.tribe} />}
          {o.label}
          {o.count !== undefined && <span className={styles.chipCount}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

interface SearchFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly label: string;
}

export function SearchField({ value, onChange, placeholder, label }: SearchFieldProps) {
  const t = useT();
  return (
    <div className={styles.search}>
      <Icon name="search" size={18} className={styles.searchIcon} />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        enterKeyHint="search"
      />
      {value && (
        <button
          type="button"
          className={styles.searchClear}
          onClick={() => onChange('')}
          aria-label={t('common.clear')}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}

interface StepperProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly onChange: (value: number) => void;
}

/** Number with − / + buttons — thumb-friendly on phones, typeable on desktop. */
export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  const t = useT();
  const id = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className={styles.stepperWrap}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <div className={styles.stepper}>
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={`${label}: ${t('common.decrease')}`}
        >
          <Icon name="minus" size={18} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (Number.isFinite(n)) onChange(clamp(n));
          }}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={`${label}: ${t('common.increase')}`}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}

interface SwitchProps {
  readonly label: ReactNode;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <label className={styles.switch}>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.switchTrack} aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

export function TribeDot({ tribe }: { readonly tribe: Tribe }) {
  return <span className={styles.tribeDot} data-tribe={tribe} aria-hidden="true" />;
}

interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: 'neutral' | 'accent' | 'warn';
  readonly tribe?: Tribe;
  readonly title?: string;
  readonly icon?: IconName;
}

export function Badge({ children, tone = 'neutral', tribe, title, icon }: BadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone} data-tribe={tribe} title={title}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

interface CalloutProps {
  readonly children: ReactNode;
  readonly tone?: 'info' | 'warn';
  readonly title?: string;
}

export function Callout({ children, tone = 'info', title }: CalloutProps) {
  return (
    <div className={styles.callout} data-tone={tone}>
      <Icon name={tone === 'warn' ? 'alert' : 'info'} size={18} />
      <div>
        {title && <p className={styles.calloutTitle}>{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

interface CardProps {
  readonly children: ReactNode;
  readonly title?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
  readonly padded?: boolean;
  readonly as?: 'section' | 'div' | 'article';
  readonly id?: string;
}

export function Card({
  children,
  title,
  action,
  className,
  padded = true,
  as: Tag = 'section',
  id,
}: CardProps) {
  const headingId = useId();
  return (
    <Tag
      className={`${styles.card} ${className ?? ''}`}
      data-padded={padded || undefined}
      aria-labelledby={title ? headingId : undefined}
      id={id}
    >
      {(title || action) && (
        <div className={styles.cardHead}>
          {title && <h2 id={headingId}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </Tag>
  );
}

interface StatProps {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly hint?: ReactNode;
  readonly icon?: IconName;
  readonly emphasis?: boolean;
}

export function Stat({ label, value, hint, icon, emphasis = false }: StatProps) {
  return (
    <div className={styles.stat} data-emphasis={emphasis || undefined}>
      <dt>
        {icon && <Icon name={icon} size={16} />}
        {label}
      </dt>
      <dd>{value}</dd>
      {hint && <dd className={styles.statHint}>{hint}</dd>}
    </div>
  );
}

export function StatGrid({ children }: { readonly children: ReactNode }) {
  return <dl className={styles.statGrid}>{children}</dl>;
}

interface PageHeaderProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly children?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, children }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      <h1>{title}</h1>
      {description && <p className={styles.pageDescription}>{description}</p>}
      {children && <div className={styles.pageHeaderExtra}>{children}</div>}
    </header>
  );
}

interface TabLinksProps {
  readonly label: string;
  readonly tabs: readonly {
    readonly to: string;
    readonly label: string;
    readonly end?: boolean;
    readonly active?: boolean;
  }[];
}

/** Underline tabs that are real links (shareable URLs). */
export function TabLinks({ label, tabs }: TabLinksProps) {
  return (
    <nav aria-label={label} className={styles.tabs}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            isActive || tab.active ? `${styles.tab} ${styles.tabActive}` : styles.tab
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function EmptyState({
  children,
  icon = 'search',
}: {
  readonly children: ReactNode;
  readonly icon?: IconName;
}) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} size={28} />
      <p>{children}</p>
    </div>
  );
}

/** Small uppercase label above a group of content. */
export function SectionLabel({ children, id }: { readonly children: ReactNode; readonly id?: string }) {
  return (
    <h2 className={styles.sectionLabel} id={id}>
      {children}
    </h2>
  );
}
