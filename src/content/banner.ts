export type BannerType = 'merged' | 'created' | 'approved' | 'closed';

interface RenderBannerOptions {
  type: BannerType;
  soundUrl: string;
  soundEnabled: boolean;
  soundVolume?: number;
  customText?: string;
  onHide: () => void;
}

const DEFAULT_BANNER_TEXT: Record<BannerType, string> = {
  merged: 'MERGE ACCOMPLISHED',
  created: 'PR FORGED',
  approved: 'REVIEW APPROVED',
  closed: 'YOU DIED',
};

const DEFAULT_SUBTITLE: Record<BannerType, string> = {
  merged: 'The pull request has been merged',
  created: 'A new pull request has been created',
  approved: 'A pull request review was approved',
  closed: 'A pull request has been closed',
};

const SHOW_CLASS_DELAY_MS = 50;
const DISPLAY_DURATION_MS = 3000;
const HIDE_ANIMATION_MS = 500;
const FRAME_DURATION_MS = 16;
const MAX_CUSTOM_TEXT_LENGTH = 48;

const sanitizeBannerText = (text?: string): string | undefined => {
  if (!text) return undefined;
  const trimmed = text.trim();
  return trimmed ? trimmed.slice(0, MAX_CUSTOM_TEXT_LENGTH) : undefined;
};

const getNow = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

const requestFrame = (callback: (time: number) => void): number => {
  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }
  return window.setTimeout(() => callback(getNow()), FRAME_DURATION_MS);
};

const cancelFrame = (frameId: number): void => {
  if (typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(frameId);
    return;
  }
  clearTimeout(frameId);
};

export const renderBanner = ({
  type,
  soundUrl,
  soundEnabled,
  soundVolume,
  customText,
  onHide,
}: RenderBannerOptions): boolean => {
  try {
    const text = sanitizeBannerText(customText) ?? DEFAULT_BANNER_TEXT[type];
    const subtitle = DEFAULT_SUBTITLE[type];
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';
    const canvas = document.createElement('canvas');
    canvas.className = 'elden-ring-banner-canvas';
    banner.appendChild(canvas);
    document.body.appendChild(banner);

    const context = canvas.getContext('2d');
    if (!context) {
      banner.remove();
      throw new Error('Canvas 2D context is unavailable');
    }

    let frameId = 0;
    let isRemoved = false;

    const renderFrame = (timestamp: number): void => {
      if (isRemoved) {
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const progress = (timestamp % 2000) / 2000;
      const centerX = width / 2;
      const centerY = height / 2;
      const glowSize = Math.min(width, height) * 0.22;

      const background = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowSize,
      );
      background.addColorStop(0, 'rgba(212, 175, 55, 0.20)');
      background.addColorStop(0.6, 'rgba(35, 28, 16, 0.55)');
      background.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(centerX, centerY);
      context.rotate(progress * Math.PI * 2);
      context.lineWidth = 2;
      context.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      context.beginPath();
      context.arc(0, 0, glowSize * 0.75, 0, Math.PI * 1.5);
      context.stroke();
      context.rotate(-progress * Math.PI * 3.4);
      context.strokeStyle = 'rgba(255, 240, 180, 0.35)';
      context.beginPath();
      context.arc(0, 0, glowSize * 0.58, 0, Math.PI * 1.3);
      context.stroke();
      context.restore();

      const titleFontSize = Math.max(42, Math.min(width * 0.085, 110));
      const subtitleFontSize = Math.max(16, Math.min(width * 0.024, 28));
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      context.font = `700 ${titleFontSize}px "Cinzel", "Times New Roman", serif`;
      context.strokeStyle = 'rgba(20, 12, 2, 0.95)';
      context.lineWidth = 8;
      context.strokeText(text, centerX, centerY - subtitleFontSize);
      context.fillStyle = '#f2d87f';
      context.shadowColor = 'rgba(243, 206, 84, 0.85)';
      context.shadowBlur = 24 + Math.sin(progress * Math.PI * 2) * 7;
      context.fillText(text, centerX, centerY - subtitleFontSize);

      context.shadowBlur = 0;
      context.font = `500 ${subtitleFontSize}px "Times New Roman", serif`;
      context.fillStyle = 'rgba(232, 215, 160, 0.95)';
      context.fillText(subtitle, centerX, centerY + titleFontSize * 0.5);

      frameId = requestFrame(renderFrame);
    };

    if (soundEnabled) {
      const audio = new Audio(soundUrl);
      audio.volume = Math.min(1, Math.max(0, soundVolume ?? 1));
      audio.play().catch((err) => console.log('Sound playback failed:', err));
    }

    frameId = requestFrame(renderFrame);
    setTimeout(() => banner.classList.add('show'), SHOW_CLASS_DELAY_MS);
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => {
        isRemoved = true;
        cancelFrame(frameId);
        if (banner.parentNode) {
          banner.remove();
        }
        onHide();
      }, HIDE_ANIMATION_MS);
    }, DISPLAY_DURATION_MS);

    return true;
  } catch (error) {
    console.error('Banner rendering failed:', error);
    return false;
  }
};
