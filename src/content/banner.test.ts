import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderBanner, type BannerType } from './banner';

describe('renderBanner', () => {
  const soundUrl = 'chrome-extension://mock/sound.mp3';
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let audioInstances: HTMLAudioElement[];

  const createMockGradient = () => ({
    addColorStop: vi.fn(),
  });

  const createMockContext = () =>
    ({
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      createRadialGradient: vi.fn().mockImplementation(createMockGradient),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      strokeText: vi.fn(),
      fillText: vi.fn(),
      textAlign: 'center',
      textBaseline: 'middle',
      lineWidth: 0,
      fillStyle: '',
      strokeStyle: '',
      font: '',
      shadowBlur: 0,
      shadowColor: '',
    }) as unknown as CanvasRenderingContext2D;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();

    const chromeGlobal = globalThis as unknown as {
      chrome?: { runtime?: { getURL?: (path: string) => string } };
    };
    chromeGlobal.chrome = chromeGlobal.chrome || {};
    chromeGlobal.chrome.runtime = chromeGlobal.chrome.runtime || {};
    chromeGlobal.chrome.runtime.getURL = vi.fn((path: string) => `chrome-extension://mock/${path}`);

    audioInstances = [];
    global.Audio = vi.fn().mockImplementation(() => {
      const instance = {
        play: vi.fn().mockResolvedValue(undefined),
        volume: 0,
      } as unknown as HTMLAudioElement;
      audioInstances.push(instance);
      return instance;
    });

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => createMockContext());
  });

  afterEach(() => {
    vi.useRealTimers();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
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
      expect(banner?.querySelector('canvas')).toBeTruthy();

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

  it('should use custom text when provided', () => {
    const onHide = vi.fn();
    renderBanner({
      type: 'merged',
      soundUrl,
      soundEnabled: false,
      customText: 'LEGENDARY DEPLOY',
      onHide,
    });

    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
    vi.runOnlyPendingTimers();
    expect(onHide).not.toHaveBeenCalled();
  });

  it('should fall back to default text when customText is blank', () => {
    renderBanner({
      type: 'merged',
      soundUrl,
      soundEnabled: false,
      customText: '   ',
      onHide: vi.fn(),
    });

    expect(document.getElementById('elden-ring-banner')).toBeTruthy();
  });

  it('should truncate customText beyond 48 characters', () => {
    const longText = 'A'.repeat(60);
    renderBanner({
      type: 'merged',
      soundUrl,
      soundEnabled: false,
      customText: longText,
      onHide: vi.fn(),
    });

    expect(document.getElementById('elden-ring-banner')).toBeTruthy();
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
