import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateBannerDataUrl } from './eldenBanner';

describe('generateBannerDataUrl', () => {
  let fillTextCalls: unknown[][];

  beforeEach(() => {
    fillTextCalls = [];

    const fakeCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn((...args: unknown[]) => {
        fillTextCalls.push(args);
      }),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      set filter(_value: string) {},
      set fillStyle(_value: unknown) {},
      set font(_value: string) {},
      set textAlign(_value: string) {},
      set textBaseline(_value: string) {},
      set globalCompositeOperation(_value: string) {},
      set globalAlpha(_value: number) {},
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCtx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,mock',
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws the caption text and returns a PNG data URL', () => {
    const result = generateBannerDataUrl('PULL REQUEST MERGED');

    expect(result).toBe('data:image/png;base64,mock');
    expect(fillTextCalls.some((args) => args[0] === 'PULL REQUEST MERGED')).toBe(true);
    // main text pass + sheen pass
    expect(fillTextCalls.length).toBe(2);
  });

  it('returns an empty string when a 2d context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(generateBannerDataUrl('PULL REQUEST CREATED')).toBe('');
  });
});
