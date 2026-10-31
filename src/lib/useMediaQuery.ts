import { useSyncExternalStore } from 'react';

/** Live `matchMedia` result; `false` outside the browser. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Desktop layout: sidebar + side panels. Matches the 900px breakpoint in CSS. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 900px)');
}
