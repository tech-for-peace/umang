export const CANVAS_SIZE = 800;
const CIRCLE_RADIUS = 336;
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

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;

function getScaledPhotoSize(
  imageWidth: number,
  imageHeight: number,
  zoom: number,
  circleRadius: number
) {
  const scale = ((circleRadius * 2) / Math.min(imageWidth, imageHeight)) * zoom;
  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
  };
}

export function clampTransform(
  transform: PhotoTransform,
  imageWidth: number,
  imageHeight: number
): PhotoTransform {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, transform.zoom));
  const { width, height } = getScaledPhotoSize(imageWidth, imageHeight, zoom, CIRCLE_RADIUS);
  const maxPanX = Math.abs(width / 2 - CIRCLE_RADIUS);
  const maxPanY = Math.abs(height / 2 - CIRCLE_RADIUS);

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
  const { width, height } = getScaledPhotoSize(
    imageWidth,
    imageHeight,
    transform.zoom,
    CIRCLE_RADIUS
  );

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, CIRCLE_RADIUS, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
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
  const { width, height } = getScaledPhotoSize(
    imageWidth,
    imageHeight,
    transform.zoom,
    CIRCLE_RADIUS * scaleFactor
  );
  const center = viewportSize / 2;

  return {
    left: center + transform.panX * scaleFactor - width / 2,
    top: center + transform.panY * scaleFactor - height / 2,
    width,
    height,
    scaleFactor,
  };
}
