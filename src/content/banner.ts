import { generateBannerDataUrl } from './eldenBanner';

export type BannerType = 'merged' | 'created' | 'approved' | 'closed';

interface RenderBannerOptions {
  type: BannerType;
  soundUrl: string;
  soundEnabled: boolean;
  soundVolume?: number;
  onHide: () => void;
}

const bannerCaptionMap: Record<BannerType, string> = {
  merged: 'PULL REQUEST MERGED',
  created: 'PULL REQUEST CREATED',
  approved: 'PULL REQUEST APPROVED',
  closed: 'PULL REQUEST CLOSED',
};

/**
 * Renders the Elden Ring banner with correct imagery and optional audio with safe cleanup.
 */
export const renderBanner = ({
  type,
  soundUrl,
  soundEnabled,
  soundVolume,
  onHide,
}: RenderBannerOptions): boolean => {
  try {
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';

    const caption = bannerCaptionMap[type];

    const img = document.createElement('img');
    img.src = generateBannerDataUrl(caption);
    img.alt = caption;
    banner.appendChild(img);
    document.body.appendChild(banner);

    if (soundEnabled) {
      const audio = new Audio(soundUrl);
      audio.volume = Math.min(1, Math.max(0, soundVolume ?? 1));
      audio.play().catch((err) => console.log('Sound playback failed:', err));
    }

    setTimeout(() => banner.classList.add('show'), 50);
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => {
        if (banner.parentNode) {
          banner.remove();
        }
        onHide();
      }, 500);
    }, 3000);

    return true;
  } catch (error) {
    console.error('Banner rendering failed:', error);
    return false;
  }
};
