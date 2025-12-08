export const SOUND_TYPES = [
  'you-die-sound',
  'lost-grace-discovered',
  'flask-of-crimson-tears',
  'new-item',
] as const;

export type SoundType = (typeof SOUND_TYPES)[number];
