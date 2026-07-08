import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import SafeImage from './SafeImage.tsx';
import {
  CIRCLE_DIAMETER_RATIO,
  clampTransform,
  DEFAULT_TRANSFORM,
  getImageLayout,
  MAX_ZOOM,
  MIN_ZOOM,
  type PhotoTransform,
} from './imageTransform.ts';

type PhotoEditorProps = {
  imageUrl: string;
  frameSrc: string;
  initialTransform?: PhotoTransform;
  confirmLabel?: string;
  onConfirm: (transform: PhotoTransform) => void;
  onChangePhoto: () => void;
};

type ImageSize = {
  width: number;
  height: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
};

type PinchState = {
  distance: number;
  zoom: number;
};

export default function PhotoEditor({
  imageUrl,
  frameSrc,
  initialTransform = DEFAULT_TRANSFORM,
  confirmLabel = 'Next',
  onConfirm,
  onChangePhoto,
}: PhotoEditorProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [viewportSize, setViewportSize] = useState(0);
  const [transform, setTransform] = useState<PhotoTransform>(initialTransform);
  const dragRef = useRef<DragState | null>(null);
  const pinchRef = useRef<PinchState | null>(null);
  const transformRef = useRef(transform);
  const imageSizeRef = useRef(imageSize);

  transformRef.current = transform;
  imageSizeRef.current = imageSize;

  useEffect(() => {
    const interaction = interactionRef.current;
    if (!interaction) return;

    const handleTouchMove = (event: TouchEvent) => {
      const pinch = pinchRef.current;
      const size = imageSizeRef.current;
      if (!pinch || !size || event.touches.length !== 2) return;

      event.preventDefault();
      const first = event.touches[0];
      const second = event.touches[1];
      if (!first || !second) return;
      const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
      const zoom = pinch.zoom * (distance / pinch.distance);

      setTransform(clampTransform({ ...transformRef.current, zoom }, size.width, size.height));
    };

    interaction.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      interaction.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateSize = () => setViewportSize(viewport.clientWidth);
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const updateTransform = (next: PhotoTransform) => {
    if (!imageSize) {
      setTransform(next);
      return;
    }

    setTransform(clampTransform(next, imageSize.width, imageSize.height));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: transformRef.current.panX,
      startPanY: transformRef.current.panY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !imageSize || viewportSize === 0) return;

    const { scaleFactor } = getImageLayout(
      imageSize.width,
      imageSize.height,
      transformRef.current,
      viewportSize
    );
    const deltaX = (event.clientX - drag.startX) / scaleFactor;
    const deltaY = (event.clientY - drag.startY) / scaleFactor;

    updateTransform({
      ...transformRef.current,
      panX: drag.startPanX + deltaX,
      panY: drag.startPanY + deltaY,
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;

    const first = event.touches[0];
    const second = event.touches[1];
    if (!first || !second) return;

    pinchRef.current = {
      distance: Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY),
      zoom: transformRef.current.zoom,
    };
    dragRef.current = null;
  };

  const handleTouchEnd = () => {
    pinchRef.current = null;
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    const current = transformRef.current;
    updateTransform({ ...current, zoom: current.zoom + delta });
  };

  const layout =
    imageSize && viewportSize > 0
      ? getImageLayout(imageSize.width, imageSize.height, transform, viewportSize)
      : null;

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Position your photo in the frame</p>
        <p className="text-xs text-slate-500">Drag to move · Pinch or slide to zoom</p>
      </div>

      <div
        ref={viewportRef}
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: `circle(${(CIRCLE_DIAMETER_RATIO / 2) * 100}% at 50% 50%)` }}
        >
          <SafeImage
            src={imageUrl}
            alt="Photo preview"
            draggable={false}
            className={`absolute max-w-none select-none ${layout ? '' : 'invisible'}`}
            style={
              layout
                ? {
                    left: layout.left,
                    top: layout.top,
                    width: layout.width,
                    height: layout.height,
                  }
                : { left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }
            }
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              setImageSize({ width: naturalWidth, height: naturalHeight });
              setTransform((current) => clampTransform(current, naturalWidth, naturalHeight));
            }}
          />
        </div>

        <SafeImage
          src={frameSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full select-none"
        />

        <div
          ref={interactionRef}
          className="absolute inset-0 z-[2] touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onWheel={handleWheel}
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Zoom</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step="0.01"
          value={transform.zoom}
          onChange={(event) => updateTransform({ ...transform, zoom: Number(event.target.value) })}
          className="h-2 flex-1 cursor-pointer accent-umang-cyan"
          aria-label="Zoom"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateTransform(DEFAULT_TRANSFORM)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onChangePhoto}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Change photo
        </button>
        <button
          type="button"
          onClick={() => onConfirm(transform)}
          disabled={!imageSize}
          className="ml-auto rounded-xl bg-umang-cyan px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
