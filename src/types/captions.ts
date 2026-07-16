import type { BannerType } from '../content/banner';

/**
 * Default banner captions per event. Used as the fallback whenever a user
 * leaves the custom caption field empty.
 */
export const DEFAULT_CAPTIONS: Record<BannerType, string> = {
  merged: 'PULL REQUEST MERGED',
  created: 'PULL REQUEST CREATED',
  approved: 'PULL REQUEST APPROVED',
  closed: 'PULL REQUEST CLOSED',
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
