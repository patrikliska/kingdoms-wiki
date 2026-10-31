import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { RECENT_LIMIT, recentAtom, type RecentItem } from './state';

/** Remember that the player opened this detail (shown under "Recently viewed" on the home page). */
export function useTrackRecent(item: RecentItem | null): void {
  const setRecent = useSetAtom(recentAtom);
  const path = item?.path;
  const title = item?.title;
  const kind = item?.kind;
  useEffect(() => {
    if (!path || !title || !kind) return;
    setRecent((list) =>
      [{ path, title, kind }, ...list.filter((r) => r.path !== path)].slice(0, RECENT_LIMIT),
    );
  }, [path, title, kind, setRecent]);
}
