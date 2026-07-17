import { generateBandDataUrl, generateSheenDataUrl, generateCaptionDataUrl } from './eldenBanner';
import { resolveCaption } from '../types/captions';

export type BannerType = 'merged' | 'created' | 'approved' | 'closed';

interface RenderBannerOptions {
  type: BannerType;
  soundUrl: string;
  soundEnabled: boolean;
  soundVolume?: number;
  /** Custom caption text; falls back to the built-in default when empty. */
  caption?: string | undefined;
  onHide: () => void;
}

/**
 * Renders the Elden Ring banner with correct imagery and optional audio with safe cleanup.
 */
export const renderBanner = ({
  type,
  soundUrl,
  soundEnabled,
  soundVolume,
  caption,
  onHide,
}: RenderBannerOptions): boolean => {
  try {
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';

    const resolvedCaption = resolveCaption(type, caption);

    // Bottom layer: the smoky band. Defines the banner's size.
    const band = document.createElement('img');
    band.className = 'banner-band';
    band.src = generateBandDataUrl();
    band.alt = '';
    band.setAttribute('aria-hidden', 'true');
    banner.appendChild(band);

    // Middle layer: the deep matte gold caption face.
    const caption_ = document.createElement('img');
    caption_.className = 'banner-caption';
    caption_.src = generateCaptionDataUrl(resolvedCaption);
    caption_.alt = resolvedCaption;
    banner.appendChild(caption_);

    // Top layer: the warm additive sheen, blended over the face. Where it aligns
    // it brightens the gold (the layered overlap tone); as it spreads outward
    // after the fade-in it becomes the dim offset echo.
    const sheen = document.createElement('img');
    sheen.className = 'banner-sheen';
    sheen.src = generateSheenDataUrl(resolvedCaption);
    sheen.alt = '';
    sheen.setAttribute('aria-hidden', 'true');
    banner.appendChild(sheen);

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
