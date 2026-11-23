/**
 * Canvas-based renderer for the Elden Ring "Noun Verbed" (Victory) banner style,
 * inspired by https://sibert-aerts.github.io/new-area/image-creator/.
 *
 * Matches the in-game look: an elegant, wide-tracked serif in flat, matte amber
 * gold with a faint horizontal sheen echo, floating over a broad, soft, smoky
 * dark band — so it reads like an ancient sigil rising over the page beneath.
 */

// The banner is laid out on a virtual 1920x1080 stage that spans the viewport
// width; all draw sizes are authored in those units and multiplied by
// `stageScale(canvas)`. The canvas itself is sized to the viewport in device
// pixels (capped at 2x) and cropped to the band's height, so it is never larger
// than what is actually shown — the old fixed 3840x2160 canvas cost ~4x the
// pixels on 1x screens and was mostly transparent.
const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
const MAX_PIXEL_RATIO = 2;
// Canvas height as a fraction of the stage height: the band plus headroom for
// its baked drop shadow.
const CANVAS_HEIGHT_RATIO = 0.4;
const BAND_DROP_SHADOW = 10; // CSS px around the band, like the in-game shadow

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

// --- Default caption palette (deep matte "Victory" gold) ---
// The caption face is drawn as a single clean opaque pass — matching the
// reference banner PNGs exactly (no bloom, no dark base; those made it either
// too bright or muddy). These are the renderer's built-in defaults; per-event
// palettes live in bannerThemes.ts and are threaded in as arguments.
export const GOLD_FACE_COLOR = 'rgb(220, 175, 45)';

// The .banner-sheen layer is the image-creator's additive ghost (blurTint
// [255,208,66] @ blurOpacity 0.18), stacked on top of the face and blended
// additively (mix-blend-mode:plus-lighter in CSS). Where it aligns over the
// face it adds to the deep gold -> the bright overlap tone (~255,213,57); where
// it spreads past the letters it becomes the dim offset echo. Its outward
// spread (SHEEN_SCALE_X in CSS) is animated after the fade-in.
export const GOLD_SHEEN_COLOR = 'rgb(255, 208, 66)';
export const GOLD_SHEEN_OPACITY = 0.18;

const stageScale = (canvas: HTMLCanvasElement): number => canvas.width / STAGE_WIDTH;

const applyFont = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number => {
  const fontSize = FONT_SIZE * stageScale(canvas);
  ctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${fontSize * LETTER_SPACING}px`;
  return fontSize;
};

const drawShadowBar = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
  const scale = stageScale(canvas);
  const barHeight = STAGE_HEIGHT * scale * BAR_HEIGHT_RATIO;
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
  faceColor: string,
): void => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  applyFont(ctx, canvas);

  // Opaque matte face — a single clean pass, matching the reference.
  ctx.save();
  applyFont(ctx, canvas);
  ctx.fillStyle = faceColor;
  ctx.fillText(caption, centerX, centerY);
  ctx.restore();
};

const drawSheenEcho = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  caption: string,
  sheenColor: string,
  sheenOpacity: number,
): void => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Dim warm echo, drawn aligned (scaleX 1); the outward spread is animated in
  // CSS. Stacked below the opaque caption, so its core is masked and only the
  // faint spreading fringe shows as the see-through echo.
  ctx.save();
  applyFont(ctx, canvas);
  ctx.globalAlpha = sheenOpacity;
  ctx.fillStyle = sheenColor;
  ctx.fillText(caption, centerX, centerY);
  ctx.restore();
};

/**
 * Creates a canvas sized for the current viewport: full viewport width in
 * device pixels (capped at MAX_PIXEL_RATIO), cropped to the band's height.
 * Displayed at `width: 100vw; height: auto`, so it maps 1:1 to screen pixels.
 */
export const createBannerCanvas = (
  viewportWidth: number = window.innerWidth,
  pixelRatio: number = window.devicePixelRatio || 1,
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewportWidth * Math.min(pixelRatio, MAX_PIXEL_RATIO)));
  canvas.height = Math.max(1, Math.round(STAGE_HEIGHT * stageScale(canvas) * CANVAS_HEIGHT_RATIO));
  return canvas;
};

const drawOn = (
  canvas: HTMLCanvasElement,
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
): boolean => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return false;
  }
  draw(ctx, canvas);
  return true;
};

/**
 * Bottom layer: the smoky dark band with its drop shadow baked in. The band is
 * drawn on a scratch canvas and composited through a drop-shadow filter once,
 * instead of a CSS `filter` that the compositor would re-run every frame of
 * the fade.
 */
export const drawBand = (canvas: HTMLCanvasElement): boolean =>
  drawOn(canvas, (ctx) => {
    const layer = document.createElement('canvas');
    layer.width = canvas.width;
    layer.height = canvas.height;
    if (!drawOn(layer, drawShadowBar)) {
      return;
    }
    // CSS px -> canvas px, since the canvas is displayed at the viewport width.
    const shadow = BAND_DROP_SHADOW * (canvas.width / (window.innerWidth || canvas.width));
    ctx.save();
    ctx.filter = `drop-shadow(0 0 ${shadow}px black)`;
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  });

/**
 * Sheen layer: only the faint echo of the caption on a transparent canvas,
 * drawn aligned with the caption and stacked above it (see .banner-sheen in
 * styles.css). Colors default to the gold palette; callers pass a per-theme
 * palette to restyle the echo (see bannerThemes.ts).
 */
export const drawSheen = (
  canvas: HTMLCanvasElement,
  caption: string,
  sheenColor: string = GOLD_SHEEN_COLOR,
  sheenOpacity: number = GOLD_SHEEN_OPACITY,
): boolean =>
  drawOn(canvas, (ctx) => drawSheenEcho(ctx, canvas, caption, sheenColor, sheenOpacity));

/**
 * Caption layer: the opaque caption face on a transparent bg. The face color
 * defaults to the gold palette; callers pass a per-theme color to restyle it
 * (see bannerThemes.ts).
 */
export const drawCaption = (
  canvas: HTMLCanvasElement,
  caption: string,
  faceColor: string = GOLD_FACE_COLOR,
): boolean => drawOn(canvas, (ctx) => drawEldenText(ctx, canvas, caption, faceColor));
