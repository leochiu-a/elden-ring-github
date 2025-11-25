import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderBanner, type BannerType } from './banner';

describe('renderBanner', () => {
  const soundUrl = 'chrome-extension://mock/sound.mp3';

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();

    const chromeGlobal = globalThis as unknown as {
      chrome?: { runtime?: { getURL?: (path: string) => string } };
    };
    chromeGlobal.chrome = chromeGlobal.chrome || {};
    chromeGlobal.chrome.runtime = chromeGlobal.chrome.runtime || {};
    chromeGlobal.chrome.runtime.getURL = vi.fn((path: string) => `chrome-extension://mock/${path}`);

    global.Audio = vi.fn().mockImplementation(() => {
      return {
        play: vi.fn().mockResolvedValue(undefined),
        volume: 0,
      } as unknown as HTMLAudioElement;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
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
      expect(banner?.innerHTML).toContain('.png');
      const chromeRuntime = (globalThis as any).chrome.runtime;
      expect(chromeRuntime.getURL).toHaveBeenCalled();

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
});
