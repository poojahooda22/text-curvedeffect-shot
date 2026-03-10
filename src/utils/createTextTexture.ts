import * as THREE from "three";

interface TextTextureOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  blur?: number;
}

/**
 * Draws a B&W smiley face directly onto the canvas context (no downscaling).
 */
function drawSmiley(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = radius * 0.12;

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Eyes
  const eyeR = radius * 0.1;
  const eyeX = radius * 0.35;
  const eyeY = radius * 0.25;
  ctx.beginPath();
  ctx.arc(cx - eyeX, cy - eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeX, cy - eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.5, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders left-aligned text + smiley on a single 2048x2048 canvas.
 */
function renderToCanvas(options: TextTextureOptions & { drawSmileyFace?: boolean }) {
  const {
    text,
    fontSize = 240,
    fontFamily = "'Noto Sans', sans-serif",
    fontWeight = "bold",
    color = "#000000",
    canvasWidth = 2048,
    canvasHeight = 2048,
    blur,
    drawSmileyFace = true,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (blur) ctx.filter = `blur(${blur}px)`;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.letterSpacing = `${-fontSize * 0.02}px`;

  const lines = text.split("\n");
  const lineHeight = fontSize * 1.6;
  const totalHeight = lines.length * lineHeight;
  const startY = (canvasHeight - totalHeight) / 2 + lineHeight / 2;

  // Measure all lines to find the widest (including smiley on last line)
  const smileyRadius = fontSize * 0.22;
  const smileyGap = smileyRadius * 1.4;
  const smileyDiameter = smileyRadius * 2;

  const lineWidths = lines.map((line) => ctx.measureText(line).width);
  const lastLineTotal = lineWidths[lineWidths.length - 1] + (drawSmileyFace ? smileyGap + smileyDiameter : 0);
  const maxWidth = Math.max(...lineWidths.slice(0, -1), lastLineTotal);

  // Left edge so the block is centered on canvas
  const leftX = (canvasWidth - maxWidth) / 2;

  // Draw left-aligned text
  ctx.textAlign = "left";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], leftX, startY + i * lineHeight);
  }

  // Draw smiley after the last line's text
  if (drawSmileyFace) {
    const lastLineWidth = lineWidths[lineWidths.length - 1];
    const lastLineY = startY + (lines.length - 1) * lineHeight;
    const smileyX = leftX + lastLineWidth + smileyGap + smileyRadius;
    const smileyY = lastLineY;

    drawSmiley(ctx, smileyX, smileyY, smileyRadius, color);
  }

  return canvas;
}

export function createTextTexture(options: TextTextureOptions): THREE.CanvasTexture {
  const canvas = renderToCanvas(options);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createShadowTexture(options: TextTextureOptions): THREE.CanvasTexture {
  const canvas = renderToCanvas({
    ...options,
    blur: options.blur ?? 12,
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
