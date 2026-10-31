import { useAtom, useAtomValue } from 'jotai';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { reportOpenAtom, roleAtom, tribeAtom } from '../../app/state';
import {
  githubNewIssueUrl,
  REPORT_KINDS,
  REPORT_LIMITS,
  reportPath,
  validateReport,
  type ReportFailure,
  type ReportFieldError,
  type ReportKind,
} from '../../domain/report';
import { useLang, useT, type MessageKey, type TFunction } from '../../lib/i18n';
import { reportConfig, reportEnabled, sendReport, siteRoot } from '../../lib/report';
import { useOnline } from '../../lib/useOnline';
import { ModalSheet } from '../Sheet';
import { Button, Callout, ChipGroup } from '../ui';
import styles from './Report.module.css';
import { useTurnstile } from './useTurnstile';

type Status =
  | { readonly type: 'idle' }
  | { readonly type: 'sending' }
  | { readonly type: 'sent'; readonly number?: number; readonly url?: string }
  | { readonly type: 'github'; readonly url: string }
  | { readonly type: 'error'; readonly error: ReportFailure | 'network' };

const FAILURE_KEYS: Record<ReportFailure | 'network', MessageKey> = {
  invalid: 'report.err.invalid',
  captcha: 'report.err.captcha',
  rate: 'report.err.rate',
  origin: 'report.err.server',
  server: 'report.err.server',
  network: 'report.err.network',
};

function fieldError(t: TFunction, errors: readonly ReportFieldError[], field: 'message' | 'proof' | 'name') {
  if (field === 'message' && errors.includes('message.short'))
    return t('report.err.messageShort', { n: REPORT_LIMITS.messageMin });
  if (field === 'message' && errors.includes('message.long'))
    return t('report.err.messageLong', { n: REPORT_LIMITS.messageMax });
  if (field === 'proof' && errors.includes('proof')) return t('report.err.proof');
  if (field === 'name' && errors.includes('name')) return t('report.err.name', { n: REPORT_LIMITS.nameMax });
  return undefined;
}

interface FieldProps {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  readonly children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
}

function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({ id, describedBy })}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * "Suggest a correction" form. Sends to the report endpoint (→ GitHub issue); without one,
 * opens a pre-filled GitHub issue. The draft survives closing the sheet.
 */
export function ReportDialog() {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useAtom(reportOpenAtom);
  const tribe = useAtomValue(tribeAtom);
  const role = useAtomValue(roleAtom);
  const { pathname, search } = useLocation();
  const online = useOnline();

  const [kind, setKind] = useState<ReportKind>('data');
  const [message, setMessage] = useState('');
  const [proof, setProof] = useState('');
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<readonly ReportFieldError[]>([]);
  const [status, setStatus] = useState<Status>({ type: 'idle' });

  const direct = Boolean(reportConfig.endpoint);
  const done = status.type === 'sent' || status.type === 'github';
  const {
    ref: captchaRef,
    token: captchaToken,
    failed: captchaFailed,
    required: captchaRequired,
    reset: resetCaptcha,
  } = useTurnstile(direct ? reportConfig.turnstileSiteKey : undefined, open && !done, lang);

  if (!reportEnabled) return null;

  const path = reportPath(pathname, search);
  const waitingForCaptcha = captchaRequired && !captchaToken && !captchaFailed;
  const close = () => setOpen(false);

  /** Editing a field clears its error until the next submit. */
  const clearError = (field: 'message' | 'proof' | 'name') =>
    setErrors((list) =>
      list.some((e) => e.startsWith(field)) ? list.filter((e) => !e.startsWith(field)) : list,
    );

  const startOver = () => {
    setStatus({ type: 'idle' });
    setErrors([]);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status.type === 'sending') return;
    const result = validateReport({
      kind,
      message,
      proof,
      name,
      context: {
        path,
        tribe,
        role,
        lang,
        version: __APP_VERSION__,
        userAgent: kind === 'bug' ? navigator.userAgent : '',
      },
    });
    if (!result.ok) {
      setErrors(result.errors);
      setStatus({ type: 'idle' });
      return;
    }
    setErrors([]);

    if (!reportConfig.endpoint) {
      if (!reportConfig.githubRepo) return;
      const url = githubNewIssueUrl(reportConfig.githubRepo, result.report, siteRoot());
      window.open(url, '_blank', 'noopener');
      setStatus({ type: 'github', url });
      return;
    }

    setStatus({ type: 'sending' });
    const res = await sendReport(reportConfig.endpoint, {
      ...result.report,
      website,
      ...(captchaToken ? { turnstileToken: captchaToken } : {}),
    });
    if (res.ok) {
      setStatus({ type: 'sent', number: res.number, url: res.url });
      setMessage('');
      setProof('');
      return;
    }
    resetCaptcha();
    if ('fields' in res && res.fields) setErrors(res.fields);
    setStatus({ type: 'error', error: res.error });
  };

  const messageError = fieldError(t, errors, 'message');
  const proofError = fieldError(t, errors, 'proof');
  const nameError = fieldError(t, errors, 'name');

  return (
    <ModalSheet open={open} onClose={close} title={t('report.title')} focusKey={done ? 'done' : 'form'}>
      {done ? (
        <div className={styles.form}>
          <Callout>
            {status.type === 'github'
              ? t('report.doneGithub')
              : status.number
                ? t('report.done', { n: status.number })
                : t('report.doneNoNumber')}
          </Callout>
          <div className={styles.actions}>
            {status.url && (
              <a className={styles.link} href={status.url} target="_blank" rel="noreferrer">
                {t('report.view')}
              </a>
            )}
            <Button onClick={startOver}>{t('report.another')}</Button>
            <Button variant="primary" onClick={close}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={(e) => void submit(e)} noValidate>
          <p className={styles.intro}>{t('report.intro')}</p>

          <div className={styles.field}>
            <span className={styles.label} aria-hidden="true">
              {t('report.kind')}
            </span>
            <ChipGroup
              label={t('report.kind')}
              options={REPORT_KINDS.map((k) => ({ value: k, label: t(`report.kind.${k}`) }))}
              value={kind}
              onChange={setKind}
            />
          </div>

          <Field label={t('report.message')} error={messageError}>
            {({ id, describedBy }) => (
              <textarea
                id={id}
                className={styles.input}
                rows={5}
                value={message}
                maxLength={REPORT_LIMITS.messageMax + 100}
                placeholder={t(`report.placeholder.${kind}`)}
                aria-invalid={messageError ? true : undefined}
                aria-describedby={describedBy}
                onChange={(e) => {
                  setMessage(e.target.value);
                  clearError('message');
                }}
              />
            )}
          </Field>

          <Field
            label={t('report.proof')}
            hint={kind === 'data' ? t('report.proofHint') : undefined}
            error={proofError}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                className={styles.input}
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://"
                value={proof}
                aria-invalid={proofError ? true : undefined}
                aria-describedby={describedBy}
                onChange={(e) => {
                  setProof(e.target.value);
                  clearError('proof');
                }}
              />
            )}
          </Field>

          <Field label={t('report.name')} error={nameError}>
            {({ id, describedBy }) => (
              <input
                id={id}
                className={styles.input}
                autoComplete="nickname"
                value={name}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={describedBy}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
              />
            )}
          </Field>

          {/* Honeypot: invisible to people, bots fill it in. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <p className={styles.context}>
            {t('report.context', { page: path, tribe: t(`tribe.${tribe}`), role: t(`role.${role}`) })}
          </p>

          {captchaRequired && <div ref={captchaRef} className={styles.captcha} />}

          {!online && direct && <Callout tone="warn">{t('report.offline')}</Callout>}
          {status.type === 'error' && <Callout tone="warn">{t(FAILURE_KEYS[status.error])}</Callout>}
          {captchaFailed && status.type !== 'error' && (
            <Callout tone="warn">{t('report.err.captcha')}</Callout>
          )}

          <div className={styles.actions}>
            {waitingForCaptcha && <span className={styles.wait}>{t('report.captchaWait')}</span>}
            <Button
              type="submit"
              variant="primary"
              icon="flag"
              disabled={status.type === 'sending' || (direct && (!online || waitingForCaptcha))}
            >
              {status.type === 'sending'
                ? t('report.sending')
                : direct
                  ? t('report.submit')
                  : t('report.submitGithub')}
            </Button>
          </div>
        </form>
      )}
    </ModalSheet>
  );
}
