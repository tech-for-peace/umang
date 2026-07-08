import { useRef, useState, type ChangeEvent } from 'react';
import Footer from './Footer.tsx';

const CANVAS_SIZE = 800;
const CIRCLE_RADIUS = 336; // 2625 * (800 / 6250)

const FRAMES = [
  {
    label: 'Heartfulness',
    src: '/frame-heartfulness.png',
    filename: 'umang-dp-heartfulness.png',
  },
  {
    label: 'Joy',
    src: '/frame-joy.png',
    filename: 'umang-dp-joy.png',
  },
  {
    label: 'HnP',
    src: '/frame-hnp.png',
    filename: 'umang-dp-hnp.png',
  },
  {
    label: 'Clarity',
    src: '/frame-clarity.png',
    filename: 'umang-dp-clarity.png',
  },
] as const;

type FrameOption = (typeof FRAMES)[number];

type GeneratedFrame = {
  dataUrl: string;
  file: File;
  name: string;
  label: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function imageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function frameImage(file: File, frameOption: FrameOption): Promise<GeneratedFrame> {
  const [sourceImg, frameImg] = await Promise.all([
    imageFromFile(file),
    loadImage(frameOption.src),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const center = CANVAS_SIZE / 2;
  const scale = (CIRCLE_RADIUS * 2) / Math.min(sourceImg.width, sourceImg.height);
  const width = sourceImg.width * scale;
  const height = sourceImg.height * scale;

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, CIRCLE_RADIUS, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(sourceImg, center - width / 2, center - height / 2, width, height);
  ctx.restore();

  ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Failed to create image blob'))),
      'image/png'
    );
  });

  return {
    dataUrl,
    file: new File([blob], frameOption.filename, { type: 'image/png' }),
    name: frameOption.filename,
    label: frameOption.label,
  };
}

async function generateFrames(file: File): Promise<GeneratedFrame[]> {
  return Promise.all(FRAMES.map((frameOption) => frameImage(file, frameOption)));
}

function downloadFrame(frame: GeneratedFrame) {
  const link = document.createElement('a');
  link.href = frame.dataUrl;
  link.download = frame.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function shareToWhatsApp(frame: GeneratedFrame) {
  const shareData = { files: [frame.file], title: 'Umang DP' };

  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    void navigator.share(shareData).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      shareFallback(frame);
    });
    return;
  }

  shareFallback(frame);
}

function shareFallback(frame: GeneratedFrame) {
  downloadFrame(frame);
  alert('Image saved to your device. Open WhatsApp and share it from your photos.');
}

export default function App() {
  const [frames, setFrames] = useState<GeneratedFrame[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFrames(null);
    try {
      setFrames(await generateFrames(file));
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-4">
      <header className="flex flex-col items-center py-4 text-center sm:py-6">
        <h1 className="bg-gradient-to-r from-umang-purple via-umang-cyan to-umang-green bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Umang
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-3">
        <label className="flex w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-4 text-center shadow-sm transition-colors hover:border-umang-cyan hover:bg-slate-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-umang-cyan"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">Upload your photo</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isLoading}
            onChange={handleUpload}
          />
        </label>

        {isLoading && (
          <p className="animate-pulse text-base font-medium text-umang-cyan">
            Processing your frames...
          </p>
        )}

        {frames && (
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-2 sm:gap-3">
              {frames.map((frame) => (
                <div
                  key={frame.name}
                  className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={frame.dataUrl}
                    alt={`Umang DP - ${frame.label}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    <button
                      onClick={() => downloadFrame(frame)}
                      className="rounded-full bg-white/90 p-1.5 text-umang-cyan shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                      aria-label="Download"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => shareToWhatsApp(frame)}
                      className="rounded-full bg-white/90 p-1.5 text-[#25D366] shadow-sm backdrop-blur-sm transition-colors hover:bg-white lg:hidden"
                      aria-label="Share on WhatsApp"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.13 1.58 5.943L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
