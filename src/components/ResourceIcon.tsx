import type { ResourceKey } from '../domain/types';
import { RESOURCE_GLYPH_VIEWBOX, RESOURCE_GLYPHS } from './resourceGlyphs';

const colors: Record<ResourceKey, string> = {
  wood: 'var(--res-wood)',
  clay: 'var(--res-clay)',
  iron: 'var(--res-iron)',
  crop: 'var(--res-crop)',
};

interface ResourceIconProps {
  readonly kind: ResourceKey;
  readonly title?: string;
  readonly size?: number;
}

/** Resource glyph (game-icons.net, CC BY 3.0 — see resourceGlyphs.ts), coloured per resource. */
export function ResourceIcon({ kind, title, size = 16 }: ResourceIconProps) {
  return (
    <svg
      viewBox={RESOURCE_GLYPH_VIEWBOX}
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ color: colors[kind], flex: 'none' }}
    >
      <path d={RESOURCE_GLYPHS[kind]} fill="currentColor" />
    </svg>
  );
}
