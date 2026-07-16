import type { BannerType } from '../content/banner';

/**
 * Default banner captions per event, in the spirit of Elden Ring's on-screen
 * messages. Used as the fallback whenever a user leaves the custom caption
 * field empty. ("VICTORY ACHIEVED" and "A SHARD SHATTERED" carry over from the
 * original banner artwork in src/assets.)
 */
export const DEFAULT_CAPTIONS: Record<BannerType, string> = {
  merged: 'ENEMY FELLED',
  created: 'LOST GRACE DISCOVERED',
  approved: 'VICTORY ACHIEVED',
  closed: 'A SHARD SHATTERED',
};

/**
 * Storage key holding the custom caption for a given banner type.
 */
export const CAPTION_STORAGE_KEYS: Record<BannerType, keyof CaptionSettings> = {
  merged: 'captionMerged',
  created: 'captionCreated',
  approved: 'captionApproved',
  closed: 'captionClosed',
};

export interface CaptionSettings {
  captionMerged?: string;
  captionCreated?: string;
  captionApproved?: string;
  captionClosed?: string;
}

/**
 * Resolves the caption to render for a banner type: the user's custom text when
 * present and non-empty, otherwise the built-in default.
 */
export const resolveCaption = (type: BannerType, custom?: string): string => {
  const trimmed = custom?.trim();
  return trimmed ? trimmed : DEFAULT_CAPTIONS[type];
};
