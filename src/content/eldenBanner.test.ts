import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBannerCanvas, drawBand, drawCaption, drawSheen } from './eldenBanner';

let fillTextCalls: unknown[][];
let drawImageCalls: unknown[][];
let filters: string[];

beforeEach(() => {
  fillTextCalls = [];
  drawImageCalls = [];
  filters = [];
  const fakeCtx = {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn((...args: unknown[]) => {
      fillTextCalls.push(args);
    }),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createImageData: vi.fn((w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
    })),
    putImageData: vi.fn(),
    drawImage: vi.fn((...args: unknown[]) => {
      drawImageCalls.push(args);
    }),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    set filter(value: string) {
      filters.push(value);
    },
    set fillStyle(_value: unknown) {},
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
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createBannerCanvas', () => {
  it('sizes the canvas to the viewport width in device pixels, cropped to the band', () => {
    const canvas = createBannerCanvas(1280, 1);

    expect(canvas.width).toBe(1280);
    // 1280 wide stage -> 720 tall; the canvas keeps 40% of it.
    expect(canvas.height).toBe(288);
  });

  it('caps the pixel ratio at 2x', () => {
    expect(createBannerCanvas(1000, 3).width).toBe(2000);
    expect(createBannerCanvas(1000, 1.5).width).toBe(1500);
  });
});

describe('drawCaption', () => {
  it('draws the caption text', () => {
    expect(drawCaption(createBannerCanvas(1920, 1), 'PULL REQUEST MERGED')).toBe(true);
    expect(fillTextCalls.some((args) => args[0] === 'PULL REQUEST MERGED')).toBe(true);
  });

  it('reports failure when a 2d context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(drawCaption(createBannerCanvas(1920, 1), 'PULL REQUEST CREATED')).toBe(false);
  });
});

describe('drawSheen', () => {
  it('draws the caption echo', () => {
    expect(drawSheen(createBannerCanvas(1920, 1), 'PULL REQUEST MERGED')).toBe(true);
    expect(fillTextCalls.some((args) => args[0] === 'PULL REQUEST MERGED')).toBe(true);
  });

  it('reports failure when a 2d context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(drawSheen(createBannerCanvas(1920, 1), 'PULL REQUEST CREATED')).toBe(false);
  });
});

describe('drawBand', () => {
  it('composites the band through a baked drop-shadow, with no caption text', () => {
    expect(drawBand(createBannerCanvas(1920, 1))).toBe(true);

    expect(fillTextCalls).toHaveLength(0);
    expect(filters.some((f) => f.startsWith('drop-shadow('))).toBe(true);
    expect(drawImageCalls.some((args) => args[0] instanceof HTMLCanvasElement)).toBe(true);
  });

  it('reports failure when a 2d context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(drawBand(createBannerCanvas(1920, 1))).toBe(false);
  });
});
