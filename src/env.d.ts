/** App version baked in at build time (vite.config.ts). */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Report endpoint URL (Cloudflare Worker / own server). Unset = no direct reports. */
  readonly VITE_REPORT_ENDPOINT?: string;
  /** Cloudflare Turnstile site key (public). */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  /** "owner/repo" for the pre-filled GitHub issue fallback. */
  readonly VITE_GITHUB_REPO?: string;
}
