export const CANVAS_SIZE = 800;
export const CIRCLE_RADIUS = 336;
export const CIRCLE_DIAMETER_RATIO = (CIRCLE_RADIUS * 2) / CANVAS_SIZE;

export type PhotoTransform = {
  zoom: number;
  panX: number;
  panY: number;
};

export const DEFAULT_TRANSFORM: PhotoTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export function clampTransform(
  transform: PhotoTransform,
  imageWidth: number,
  imageHeight: number
): PhotoTransform {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, transform.zoom));
  const baseScale = (CIRCLE_RADIUS * 2) / Math.min(imageWidth, imageHeight);
  const scale = baseScale * zoom;
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const maxPanX = Math.max(0, width / 2 - CIRCLE_RADIUS);
  const maxPanY = Math.max(0, height / 2 - CIRCLE_RADIUS);

  return {
    zoom,
    panX: Math.min(maxPanX, Math.max(-maxPanX, transform.panX)),
    panY: Math.min(maxPanY, Math.max(-maxPanY, transform.panY)),
  };
}

export function drawPhotoInCircle(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  transform: PhotoTransform
) {
  const center = CANVAS_SIZE / 2;
  const baseScale = (CIRCLE_RADIUS * 2) / Math.min(imageWidth, imageHeight);
  const scale = baseScale * transform.zoom;
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, CIRCLE_RADIUS, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    image,
    center + transform.panX - width / 2,
    center + transform.panY - height / 2,
    width,
    height
  );
  ctx.restore();
}

export function getImageLayout(
  imageWidth: number,
  imageHeight: number,
  transform: PhotoTransform,
  viewportSize: number
) {
  const scaleFactor = viewportSize / CANVAS_SIZE;
  const circleRadius = CIRCLE_RADIUS * scaleFactor;
  const baseScale = (circleRadius * 2) / Math.min(imageWidth, imageHeight);
  const scale = baseScale * transform.zoom;
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const center = viewportSize / 2;

  return {
    left: center + transform.panX * scaleFactor - width / 2,
    top: center + transform.panY * scaleFactor - height / 2,
    width,
    height,
    scaleFactor,
  };
}
