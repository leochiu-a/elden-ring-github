import { createBannerCanvas, drawBand, drawCaption, drawSheen } from './eldenBanner';
import { resolveBannerTheme } from './bannerThemes';
import { resolveCaption } from '../types/captions';
import { DEFAULT_SOUND_VOLUME } from '../types/settings';

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
    const theme = resolveBannerTheme(type);

    // Layers are drawn straight onto viewport-sized canvases and shown as-is —
    // no PNG encode/decode round trip on the main thread.
    const layer = (className: string, draw: (canvas: HTMLCanvasElement) => boolean) => {
      const canvas = createBannerCanvas();
      canvas.className = className;
      canvas.setAttribute('aria-hidden', 'true');
      if (!draw(canvas)) {
        throw new Error(`2d context unavailable for ${className}`);
      }
      banner.appendChild(canvas);
    };

    // Bottom layer: the smoky band. Defines the banner's size.
    layer('banner-band', drawBand);
    // Middle layer: the opaque matte caption face, in the theme's face color.
    layer('banner-caption', (canvas) => drawCaption(canvas, resolvedCaption, theme.faceColor));
    // Top layer: the additive sheen, blended over the face. Where it aligns it
    // brightens the face (the layered overlap tone); as it spreads outward after
    // the fade-in it becomes the dim offset echo.
    layer('banner-sheen', (canvas) =>
      drawSheen(canvas, resolvedCaption, theme.sheenColor, theme.sheenOpacity),
    );

    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-label', resolvedCaption);

    document.body.appendChild(banner);

    if (soundEnabled) {
      const audio = new Audio(soundUrl);
      audio.volume = Math.min(1, Math.max(0, soundVolume ?? DEFAULT_SOUND_VOLUME));
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
