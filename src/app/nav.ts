import type { IconName } from '../components/Icon';
import type { MessageKey } from '../lib/i18n';

export interface NavItem {
  readonly path: string;
  readonly label: MessageKey;
  readonly icon: IconName;
  /** One-line description (home tiles, More page). */
  readonly blurb?: MessageKey;
}

const home: NavItem = { path: '/', label: 'nav.home', icon: 'home' };
const quests: NavItem = { path: '/quests', label: 'nav.quests', icon: 'quests', blurb: 'home.blurb.quests' };
const buildings: NavItem = {
  path: '/buildings',
  label: 'nav.buildings',
  icon: 'buildings',
  blurb: 'home.blurb.buildings',
};
const units: NavItem = { path: '/units', label: 'nav.units', icon: 'units', blurb: 'home.blurb.units' };
const walls: NavItem = { path: '/walls', label: 'nav.walls', icon: 'walls', blurb: 'home.blurb.walls' };
const tribes: NavItem = { path: '/tribes', label: 'nav.tribes', icon: 'tribes', blurb: 'home.blurb.tribes' };
const more: NavItem = { path: '/more', label: 'nav.more', icon: 'more' };

/** Desktop sidebar — every module, most used first. */
export const SIDEBAR_NAV: readonly NavItem[] = [home, quests, buildings, units, walls, tribes];

/** Phone tab bar — 5 items max; the rest lives under "More". */
export const TAB_NAV: readonly NavItem[] = [home, quests, buildings, units, more];

/** Modules reachable from the home tiles and the More page. */
export const MODULES: readonly NavItem[] = [quests, buildings, units, walls, tribes];

/** Paths that belong under "More" on phones (keeps the More tab highlighted). */
export const MORE_PATHS: readonly string[] = ['/more', '/walls', '/tribes'];
