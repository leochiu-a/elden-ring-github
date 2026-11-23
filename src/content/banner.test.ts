import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderBanner, type BannerType } from './banner';
import { DEFAULT_SOUND_VOLUME } from '../types/settings';

describe('renderBanner', () => {
  const soundUrl = 'chrome-extension://mock/sound.mp3';
  let audioInstances: HTMLAudioElement[];

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();

    const fakeCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createImageData: vi.fn((w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
      })),
      putImageData: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      arc: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      set filter(_value: string) {},
      set fillStyle(_value: unknown) {},
      set strokeStyle(_value: unknown) {},
      set lineWidth(_value: number) {},
      set shadowColor(_value: string) {},
      set shadowBlur(_value: number) {},
      set font(_value: string) {},
      set textAlign(_value: string) {},
      set textBaseline(_value: string) {},
      set letterSpacing(_value: string) {},
      set globalCompositeOperation(_value: string) {},
      set globalAlpha(_value: number) {},
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCtx as unknown as CanvasRenderingContext2D,
    );
    audioInstances = [];
    global.Audio = vi.fn().mockImplementation(() => {
      const instance = {
        play: vi.fn().mockResolvedValue(undefined),
        volume: 0,
      } as unknown as HTMLAudioElement;
      audioInstances.push(instance);
      return instance;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render banners for each type', () => {
    const types: BannerType[] = ['merged', 'created', 'approved', 'closed'];

    types.forEach((type) => {
      const onHide = vi.fn();
      renderBanner({
        type,
        soundUrl,
        soundEnabled: true,
        onHide,
      });

      const banner = document.getElementById('elden-ring-banner');
      expect(banner).toBeTruthy();
      const band = banner?.querySelector('canvas.banner-band');
      const sheen = banner?.querySelector('canvas.banner-sheen');
      const caption = banner?.querySelector('canvas.banner-caption');
      expect(band).toBeTruthy();
      expect(sheen).toBeTruthy();
      expect(caption).toBeTruthy();
      expect(banner?.getAttribute('aria-label')).toBeTruthy();
      // Sheen must come after the caption so its additive ghost blends on top
      // of the gold face (bright overlap tone) and spreads into the echo.
      expect(
        caption!.compareDocumentPosition(sheen!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();

      vi.runAllTimers();
      expect(onHide).toHaveBeenCalled();

      document.body.innerHTML = '';
    });
  });

  it('renders nothing and reports failure when a 2d context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const ok = renderBanner({ type: 'merged', soundUrl, soundEnabled: true, onHide: vi.fn() });

    expect(ok).toBe(false);
    expect(document.getElementById('elden-ring-banner')).toBeNull();
    expect(global.Audio).not.toHaveBeenCalled();
  });

  it('should skip audio when sound is disabled', () => {
    const onHide = vi.fn();
    renderBanner({
      type: 'merged',
      soundUrl,
      soundEnabled: false,
      onHide,
    });

    expect(global.Audio).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(onHide).toHaveBeenCalled();
  });

  it('falls back to the default volume when soundVolume is not provided', () => {
    renderBanner({
      type: 'merged',
      soundUrl,
      soundEnabled: true,
      onHide: vi.fn(),
    });

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]!.volume).toBe(DEFAULT_SOUND_VOLUME);
  });

  it.each([
    [0, 0],
    [0.5, 0.5],
    [1, 1],
    [1.5, 1],
    [-0.2, 0],
  ])('clamps soundVolume %s to %s', (input, expected) => {
    renderBanner({
      type: 'merged',
      soundUrl,
      soundEnabled: true,
      soundVolume: input,
      onHide: vi.fn(),
    });

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]!.volume).toBe(expected);
  });
});
