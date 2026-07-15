/**
 * Canvas-based renderer for the Elden Ring "Noun Verbed" (Victory) banner style,
 * ported from https://sibert-aerts.github.io/new-area/image-creator/ (js/drawFunctions.js).
 */

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const FONT_FAMILY = "'Agmena Pro', Georgia, 'Times New Roman', serif";
const TEXT_COLOR = 'rgb(220, 175, 45)';
const SHEEN_COLOR = 'rgb(255, 208, 66)';

const SHADOW_SIZE = 0.7;
const SHADOW_OPACITY = 0.65;
const SHADOW_OFFSET = -0.006;
const SHADOW_SOFTNESS = 1.05;

const FONT_SIZE = 88;
const FONT_WEIGHT = 300;

const SHEEN_OPACITY = 0.18;
const SHEEN_SIZE = 1.11;

const drawShadowBar = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
  const scale = canvas.height / 1080;
  const barHeight = canvas.height * SHADOW_SIZE * 0.15;
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

  ctx.save();
  applyFontSliders(ctx, canvas);
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText(caption, centerX, centerY);
  ctx.restore();

  // Additive horizontal "sheen" pass, mirroring drawEldenNounVerbed's glow.
  ctx.save();
  applyFontSliders(ctx, canvas);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = SHEEN_OPACITY;
  ctx.fillStyle = SHEEN_COLOR;
  ctx.translate(centerX, centerY);
  ctx.scale(SHEEN_SIZE, 1 + (SHEEN_SIZE - 1) / 2);
  ctx.fillText(caption, 0, 0);
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
