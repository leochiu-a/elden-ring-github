import type { BannerType } from './banner';
import { GOLD_FACE_COLOR, GOLD_SHEEN_COLOR, GOLD_SHEEN_OPACITY } from './eldenBanner';

/**
 * Visual palette for a banner. Each BannerType maps to exactly one theme, so
 * adding a new look — or restyling an existing event — means editing only
 * BANNER_THEMES below. The canvas renderer (eldenBanner.ts) and the DOM
 * assembly (banner.ts) stay untouched; they receive colors as plain arguments.
 */
export interface BannerTheme {
  /** Opaque caption face color (any CSS color string). */
  faceColor: string;
  /** Additive sheen echo color layered over the face. */
  sheenColor: string;
  /** Sheen echo opacity, 0–1. */
  sheenOpacity: number;
}

/**
 * The default deep matte gold "Victory" look, shared by the positive events.
 * Built from the renderer's baseline palette so gold has a single source.
 */
const GOLD_THEME: BannerTheme = {
  faceColor: GOLD_FACE_COLOR,
  sheenColor: GOLD_SHEEN_COLOR,
  sheenOpacity: GOLD_SHEEN_OPACITY,
};

/**
 * The Elden Ring death-screen look for a closed PR: a deep blood-red face with
 * a restrained red echo, matching src/assets/close-pull-request.png. The smoky
 * dark band underneath is shared with the gold theme.
 */
const CRIMSON_THEME: BannerTheme = {
  faceColor: 'rgb(130, 16, 29)',
  sheenColor: 'rgb(190, 40, 45)',
  sheenOpacity: 0.16,
};

const BANNER_THEMES: Record<BannerType, BannerTheme> = {
  merged: GOLD_THEME,
  created: GOLD_THEME,
  approved: GOLD_THEME,
  closed: CRIMSON_THEME,
};

/** Returns the visual palette to render for a given banner type. */
export const resolveBannerTheme = (type: BannerType): BannerTheme => BANNER_THEMES[type];
