import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Lang } from '../../domain/types';

interface TurnstileOptions {
  sitekey: string;
  language: string;
  theme: 'auto';
  size: 'flexible';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<TurnstileApi> | undefined;

/** Loads Cloudflare's script once, only when a form actually needs it. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    script.onerror = () => {
      loading = undefined;
      script.remove();
      reject(new Error('turnstile'));
    };
    document.head.append(script);
  });
  return loading;
}

export interface Turnstile {
  /** Attach to the element the widget renders into. */
  readonly ref: RefObject<HTMLDivElement | null>;
  /** Present once the visitor passed the check. */
  readonly token: string | undefined;
  /** The script or the check failed (e.g. blocked by an extension). */
  readonly failed: boolean;
  /** False when no site key is configured – the form then sends without a token. */
  readonly required: boolean;
  /** Tokens are single-use: call after every submit attempt. */
  readonly reset: () => void;
}

/** Cloudflare Turnstile anti-spam check, rendered while `active`. */
export function useTurnstile(siteKey: string | undefined, active: boolean, lang: Lang): Turnstile {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [token, setToken] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = ref.current;
    if (!siteKey || !active || !container) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled) return;
        widgetId.current = api.render(container, {
          sitekey: siteKey,
          language: lang,
          theme: 'auto',
          size: 'flexible',
          callback: (t) => {
            setToken(t);
            setFailed(false);
          },
          'expired-callback': () => setToken(undefined),
          'error-callback': () => {
            setToken(undefined);
            setFailed(true);
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
      setToken(undefined);
    };
  }, [siteKey, active, lang]);

  const reset = useCallback(() => {
    setToken(undefined);
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  return { ref, token, failed, required: Boolean(siteKey), reset };
}
