import { useState } from 'react';
import Footer from './Footer';

const FRAME_SRC = '/prem-abhaar-frame.png';
const OUTPUT_NAME = 'prem-abhaar-dp.png';
const CANVAS_SIZE = 800;
const CIRCLE_RADIUS = 336; // 2625 * (800 / 6250)

type Frame = {
  dataUrl: string;
  name: string;
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

async function frameImage(file: File): Promise<Frame> {
  const [sourceImg, frameImg] = await Promise.all([imageFromFile(file), loadImage(FRAME_SRC)]);

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

  return {
    dataUrl: canvas.toDataURL('image/png'),
    name: OUTPUT_NAME,
  };
}

function downloadFrame(frame: Frame) {
  const link = document.createElement('a');
  link.href = frame.dataUrl;
  link.download = frame.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function App() {
  const [frame, setFrame] = useState<Frame | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      setFrame(await frameImage(file));
    } catch {
      alert('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 pb-16">
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-blue-700">#PremAbhaar</h1>
        <p className="text-lg text-gray-500">Upload your photo to begin.</p>

        <label className="cursor-pointer rounded-xl bg-blue-600 px-14 py-5 text-2xl font-semibold text-white shadow transition-colors hover:bg-blue-700">
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isLoading}
            onChange={handleUpload}
          />
        </label>

        {isLoading && (
          <p className="animate-pulse text-xl font-medium text-blue-600">Processing image...</p>
        )}

        {frame && (
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-center text-2xl font-bold text-blue-700">Preview</h2>
            <img
              src={frame.dataUrl}
              alt="Prem Abhaar DP"
              className="mb-5 aspect-square w-full rounded-xl border border-gray-200 bg-gray-100 object-cover"
            />
            <button
              onClick={() => downloadFrame(frame)}
              className="w-full rounded-xl bg-green-600 px-10 py-5 text-2xl font-semibold text-white shadow transition-colors hover:bg-green-700"
            >
              Download Your DP
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
