/**
 * Canvas-based renderer for the Elden Ring "Noun Verbed" (Victory) banner style,
 * ported from https://sibert-aerts.github.io/new-area/image-creator/ (js/drawFunctions.js).
 */

// Rendered at 2x (3840x2160) so the banner stays sharp when CSS upscales it to
// full viewport width on 2K/high-DPI displays. All draw sizes derive from
// canvas.height / 1080, so the higher resolution keeps proportions identical.
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;

const FONT_FAMILY = "'Agmena Pro', Georgia, 'Times New Roman', serif";
const TEXT_COLOR = 'rgb(220, 175, 45)';
const GLOW_COLOR = 'rgba(255, 208, 66, 0.45)';

const SHADOW_SIZE = 0.85;
const SHADOW_OPACITY = 1;
const SHADOW_OFFSET = -0.006;
const SHADOW_SOFTNESS = 1.1;

const FONT_SIZE = 88;
const FONT_WEIGHT = 300;

// Soft gold halo drawn directly under the opaque text (no horizontal offset),
// so the caption keeps its Elden Ring glow without a see-through duplicate.
const GLOW_BLUR = 0.16;

const drawShadowBar = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
  const scale = canvas.height / 1080;
  const barHeight = canvas.height * SHADOW_SIZE * 0.18;
  const centerY = canvas.height / 2 + SHADOW_OFFSET * canvas.height;

  ctx.save();
  ctx.filter = `blur(${SHADOW_SOFTNESS * 12 * scale}px)`;

  const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
  gradient.addColorStop(0, `rgba(20, 20, 20, 0)`);
  gradient.addColorStop(0.5, `rgba(20, 20, 20, ${SHADOW_OPACITY})`);
  gradient.addColorStop(1, `rgba(20, 20, 20, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, centerY - barHeight / 2, canvas.width, barHeight);
  ctx.restore();
};

const applyFontSliders = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number => {
  const scale = canvas.height / 1080;
  const fontSize = FONT_SIZE * scale;

  ctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  return fontSize;
};

const drawEldenText = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  caption: string,
): void => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 + SHADOW_OFFSET * canvas.height;

  const scale = canvas.height / 1080;

  ctx.save();
  applyFontSliders(ctx, canvas);
  // Aligned gold halo behind the letters — glow without an offset ghost.
  ctx.shadowColor = GLOW_COLOR;
  ctx.shadowBlur = FONT_SIZE * GLOW_BLUR * scale;
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText(caption, centerX, centerY);
  // Second opaque pass keeps the letter faces fully solid over the halo.
  ctx.shadowBlur = 0;
  ctx.fillText(caption, centerX, centerY);
  ctx.restore();
};

export const generateBannerDataUrl = (caption: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  drawShadowBar(ctx, canvas);
  drawEldenText(ctx, canvas, caption);

  return canvas.toDataURL('image/png');
};
