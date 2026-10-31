import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useT } from '../lib/i18n';
import { useIsDesktop } from '../lib/useMediaQuery';
import { Icon } from './Icon';
import styles from './Sheet.module.css';

interface ModalSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly children: ReactNode;
  /** Re-focus the heading whenever this changes. */
  readonly focusKey?: string;
  readonly size?: 'md' | 'lg';
}

/**
 * Modal built on <dialog>: focus is trapped, Esc closes, background is inert.
 * Bottom sheet on phones, centred dialog on desktop.
 */
export function ModalSheet({ open, onClose, title, children, focusKey, size = 'md' }: ModalSheetProps) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      headingRef.current?.focus({ preventScroll: true });
    } else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (open) headingRef.current?.focus({ preventScroll: true });
  }, [focusKey, open]);

  // Lock page scroll behind the modal.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      data-size={size}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={styles.sheet}>
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.head}>
          <h2 id={titleId} ref={headingRef} tabIndex={-1}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t('common.close')}>
            <Icon name="close" />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}

interface DetailPanelProps {
  readonly title: ReactNode;
  readonly onClose: () => void;
  /** Re-focus the heading whenever this changes (e.g. the selected item's id). */
  readonly focusKey: string;
  readonly children: ReactNode;
}

/**
 * Detail of a selected list item: a sticky side panel next to the list on desktop,
 * a modal bottom sheet on phones. Place it inside `.withDetail` (see layout classes).
 */
export function DetailPanel({ title, onClose, focusKey, children }: DetailPanelProps) {
  const t = useT();
  const isDesktop = useIsDesktop();
  const titleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isDesktop) headingRef.current?.focus({ preventScroll: true });
  }, [focusKey, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isDesktop]);

  if (!isDesktop) {
    return (
      <ModalSheet open onClose={onClose} title={title} focusKey={focusKey}>
        {children}
      </ModalSheet>
    );
  }

  return (
    <aside className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} ref={headingRef} tabIndex={-1}>
          {title}
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label={t('common.close')}>
          <Icon name="close" />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
