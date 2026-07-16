import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderBanner, type BannerType } from './banner';

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
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,mock',
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
      const base = banner?.querySelector('img.banner-base') as HTMLImageElement | null;
      const sheen = banner?.querySelector('img.banner-sheen') as HTMLImageElement | null;
      expect(base?.src).toBe('data:image/png;base64,mock');
      expect(sheen?.src).toBe('data:image/png;base64,mock');

      vi.runAllTimers();
      expect(onHide).toHaveBeenCalled();

      document.body.innerHTML = '';
    });
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

  it('defaults audio volume to 1 when soundVolume is not provided', () => {
    renderBanner({
      type: 'merged',
      soundUrl,
      soundEnabled: true,
      onHide: vi.fn(),
    });

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]!.volume).toBe(1);
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
