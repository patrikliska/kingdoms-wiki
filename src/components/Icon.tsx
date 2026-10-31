/** Hand-made 24×24 stroke icons — our own assets, not the game's. */
const paths = {
  home: 'M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z',
  quests: 'M7 3h9.5L20 6.5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9.5 9h7M9.5 13h7M9.5 17h4',
  tribes: 'M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6zM12 3v18',
  buildings: 'M3 21h18M5 21V9l4-3 4 3v12M13 21V12l4-2.5L21 12v9M8 13h2M8 17h2M16 15h2',
  walls: 'M3 21V8h3.5v2.5H10V8h4v2.5h3.5V8H21v13zM3 15h18M9 15v6M15 15v6',
  units: 'M14.5 4.5 20 4l-.5 5.5L9 20l-2-2 9.5-10.5M4 20l3-3M5 14l5 5',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.5-4.5',
  more: 'M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z',
  settings: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6',
  close: 'M6 6l12 12M18 6 6 18',
  chevronRight: 'm9 5 7 7-7 7',
  chevronLeft: 'm15 5-7 7 7 7',
  chevronDown: 'm5 9 7 7 7-7',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  cross: 'M7 7l10 10M17 7 7 17',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3.5 2',
  history: 'M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4.5H8M12 8v4.5l3 2',
  arrowRight: 'M4 12h15M13 6l6 6-6 6',
  arrowDown: 'M12 4v15M6 13l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5',
  alert: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17.5v.5',
  users:
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.5c2 .6 3.2 2.6 3.5 5.5',
  sparkle:
    'M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7zM19 16c.2 1.5 1 2.3 2.5 2.5-1.5.2-2.3 1-2.5 2.5-.2-1.5-1-2.3-2.5-2.5 1.5-.2 2.3-1 2.5-2.5z',
  crown: 'M3.5 8 7.5 12 12 5l4.5 7 4-4-1.5 11h-14zM5 21h14',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z',
  sword: 'M14.5 4.5 20 4l-.5 5.5L9 20l-2-2 9.5-10.5M4 20l3-3M5 14l5 5',
  horse: 'M7 21v-5.5l-3 .5 1.5-5L10 6l1-3 2 2.5c3 .5 5.5 2.5 6.5 6l.5 9.5M13 21v-5',
  hammer: 'M14 4.5 19.5 10M11 7.5l5.5 5.5M12.5 6 15 3.5l5.5 5.5L18 11.5M13.5 10.5 4 20',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  tent: 'M12 4 2.5 20h19zM12 4v16M9 20l3-6 3 6',
  wheat:
    'M12 21V9M12 9c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4zm0 5c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4z',
  coins:
    'M9 9.5c3.6 0 6.5-1.3 6.5-3S12.6 3.5 9 3.5 2.5 4.8 2.5 6.5s2.9 3 6.5 3zM2.5 6.5v5c0 1.7 2.9 3 6.5 3M2.5 11.5v5c0 1.7 2.9 3 6.5 3M21.5 12.5c0 1.7-2.9 3-6.5 3s-6.5-1.3-6.5-3 2.9-3 6.5-3 6.5 1.3 6.5 3zM21.5 12.5v5c0 1.7-2.9 3-6.5 3s-6.5-1.3-6.5-3v-5',
  cart: 'M3 4h2.5l2.2 11h10.6L20.5 7H7M9.5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  sort: 'M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5',
} as const;

export type IconName = keyof typeof paths;

interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  /** Accessible label; omit for decorative icons. */
  readonly title?: string;
  readonly className?: string;
}

export function Icon({ name, size = 20, title, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ flex: 'none' }}
    >
      <path d={paths[name]} />
    </svg>
  );
}
