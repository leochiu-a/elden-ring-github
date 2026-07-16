/**
 * Canvas-based renderer for the Elden Ring "Noun Verbed" (Victory) banner style,
 * inspired by https://sibert-aerts.github.io/new-area/image-creator/.
 *
 * Matches the in-game look: an elegant, wide-tracked serif in flat, matte amber
 * gold with a faint horizontal sheen echo, floating over a broad, soft, smoky
 * dark band — so it reads like an ancient sigil rising over the page beneath.
 */

// Rendered at 2x (3840x2160) so the banner stays sharp when CSS upscales it to
// full viewport width on 2K/high-DPI displays. All draw sizes derive from
// canvas.height / 1080, so the higher resolution keeps proportions identical.
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;

const FONT_FAMILY = "'Agmena Pro', Georgia, 'Times New Roman', serif";
const FONT_SIZE = 80;
const FONT_WEIGHT = 400;
const LETTER_SPACING = 0.08; // fraction of font size — the wide in-game tracking

// --- Smoky dark band ---
const BAR_HEIGHT_RATIO = 0.34; // broad, soft vertical falloff
const BAR_CORE_COLOR = '0, 0, 0'; // pure black, like the in-game shadow bar
const BAR_CORE_OPACITY = 0.78;
const BAR_BLUR = 10; // px at 1080p, scaled up
const GRAIN_TILE_W = 520;
const GRAIN_TILE_H = 140;
const GRAIN_MAX_ALPHA = 22; // 0-255 per-pixel noise alpha (subtle dust)
const GRAIN_OPACITY = 0.3;
const SPECK_COUNT = 45;
const SPECK_COLOR = '225, 195, 140';

// --- Matte gold caption ---
const SHEEN_COLOR = 'rgb(230, 190, 120)';
const SHEEN_OPACITY = 0.12;
// The sheen's horizontal spread (SHEEN_SCALE_X) is applied in CSS as an
// animated transform, so the sheen image itself is drawn aligned (scaleX 1).
const GLOW_COLOR = 'rgba(255, 205, 110, 0.35)';
const GLOW_BLUR = 0.14; // fraction of font size
const SHADOW_FILL = 'rgba(60, 40, 18, 0.55)'; // soft dark base for legibility

// Flat, matte amber gold — the near-uniform in-game caption colour (the
// image-creator's Elden "Victory" preset textColor), deeper than a pastel gold.
const GOLD_COLOR = 'rgb(220, 175, 45)';

const applyFont = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number => {
  const fontSize = FONT_SIZE * (canvas.height / 1080);
  ctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${fontSize * LETTER_SPACING}px`;
  return fontSize;
};

const drawShadowBar = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
  const scale = canvas.height / 1080;
  const barHeight = canvas.height * BAR_HEIGHT_RATIO;
  const centerY = canvas.height / 2;
  const top = centerY - barHeight / 2;

  // Smoky core: a broad, soft, blurred vertical band.
  ctx.save();
  ctx.filter = `blur(${BAR_BLUR * scale}px)`;
  const core = ctx.createLinearGradient(0, top, 0, top + barHeight);
  core.addColorStop(0, `rgba(${BAR_CORE_COLOR}, 0)`);
  core.addColorStop(0.5, `rgba(${BAR_CORE_COLOR}, ${BAR_CORE_OPACITY})`);
  core.addColorStop(1, `rgba(${BAR_CORE_COLOR}, 0)`);
  ctx.fillStyle = core;
  ctx.fillRect(0, top, canvas.width, barHeight);
  ctx.restore();

  // Faint film grain / dust, tiled from a small noise buffer and stretched.
  const noise = document.createElement('canvas');
  noise.width = GRAIN_TILE_W;
  noise.height = GRAIN_TILE_H;
  const noiseCtx = noise.getContext('2d');
  if (noiseCtx) {
    const image = noiseCtx.createImageData(GRAIN_TILE_W, GRAIN_TILE_H);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = Math.floor(Math.random() * GRAIN_MAX_ALPHA);
    }
    noiseCtx.putImageData(image, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = GRAIN_OPACITY;
    ctx.drawImage(noise, 0, top, canvas.width, barHeight);
    ctx.restore();
  }

  // Sparse, faint light specks / dust motes.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < SPECK_COUNT; i++) {
    const x = canvas.width * (0.1 + Math.random() * 0.8);
    const y = centerY + (Math.random() - 0.5) * barHeight * 0.6;
    const r = (0.5 + Math.random() * 1.8) * scale * 4;
    const a = 0.02 + Math.random() * 0.08;
    const speck = ctx.createRadialGradient(x, y, 0, x, y, r);
    speck.addColorStop(0, `rgba(${SPECK_COLOR}, ${a})`);
    speck.addColorStop(1, `rgba(${SPECK_COLOR}, 0)`);
    ctx.fillStyle = speck;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Fade the band only at the top and bottom; it spans the full width and runs
  // edge to edge horizontally, like the in-game vignette.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  const vMask = ctx.createLinearGradient(0, top, 0, top + barHeight);
  vMask.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vMask.addColorStop(0.35, 'rgba(0, 0, 0, 1)');
  vMask.addColorStop(0.65, 'rgba(0, 0, 0, 1)');
  vMask.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = vMask;
  ctx.fillRect(0, top, canvas.width, barHeight);
  ctx.restore();
};

const drawEldenText = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  caption: string,
): void => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const fontSize = applyFont(ctx, canvas);

  // Warm halo plus a soft dark base so the text stays legible over any page.
  ctx.save();
  applyFont(ctx, canvas);
  ctx.shadowColor = GLOW_COLOR;
  ctx.shadowBlur = fontSize * GLOW_BLUR;
  ctx.fillStyle = SHADOW_FILL;
  ctx.fillText(caption, centerX, centerY + fontSize * 0.012);
  ctx.restore();

  // Flat, matte gold face.
  ctx.save();
  applyFont(ctx, canvas);
  ctx.fillStyle = GOLD_COLOR;
  ctx.fillText(caption, centerX, centerY);
  ctx.restore();
};

const drawSheenEcho = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  caption: string,
): void => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Aligned (scaleX 1) faint echo; the outward spread is animated in CSS.
  ctx.save();
  applyFont(ctx, canvas);
  ctx.globalAlpha = SHEEN_OPACITY;
  ctx.fillStyle = SHEEN_COLOR;
  ctx.fillText(caption, centerX, centerY);
  ctx.restore();
};

const withCanvas = (
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  draw(ctx, canvas);

  return canvas.toDataURL('image/png');
};

/** Bottom layer: the smoky dark band only, on a transparent canvas. */
export const generateBandDataUrl = (): string => withCanvas(drawShadowBar);

/**
 * Middle layer: only the faint echo of the caption on a transparent canvas,
 * drawn aligned with the caption. Rendered as its own element, stacked *below*
 * the opaque caption, so the caption masks its centre and only the outward
 * horizontal spread emerges from behind the letters (see .banner-sheen in
 * styles.css).
 */
export const generateSheenDataUrl = (caption: string): string =>
  withCanvas((ctx, canvas) => drawSheenEcho(ctx, canvas, caption));

/** Top layer: the opaque gold caption (with its glow/shadow), transparent bg. */
export const generateCaptionDataUrl = (caption: string): string =>
  withCanvas((ctx, canvas) => drawEldenText(ctx, canvas, caption));
