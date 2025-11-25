export type BannerType = 'merged' | 'created' | 'approved' | 'closed';

interface RenderBannerOptions {
  type: BannerType;
  soundUrl: string;
  soundEnabled: boolean;
  onHide: () => void;
}

const bannerAssetMap: Record<BannerType, { image: string; alt: string }> = {
  merged: {
    image: 'pull-request-merged.png',
    alt: 'Pull Request Merged',
  },
  created: {
    image: 'pull-request-created.png',
    alt: 'Pull Request Created',
  },
  approved: {
    image: 'approve-pull-request.png',
    alt: 'Pull Request Approved',
  },
  closed: {
    image: 'close-pull-request.png',
    alt: 'Pull Request Closed',
  },
};

/**
 * Renders the Elden Ring banner with correct imagery and optional audio with safe cleanup.
 */
export const renderBanner = ({
  type,
  soundUrl,
  soundEnabled,
  onHide,
}: RenderBannerOptions): boolean => {
  try {
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';

    const asset = bannerAssetMap[type];
    const imgPath = chrome.runtime.getURL(`assets/${asset.image}`);

    const img = document.createElement('img');
    img.src = imgPath;
    img.alt = asset.alt;
    banner.appendChild(img);
    document.body.appendChild(banner);

    if (soundEnabled) {
      const audio = new Audio(soundUrl);
      audio.volume = 1.0;
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
