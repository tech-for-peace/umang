'use client';

import { useState } from 'react';


type Frame = {
  dataUrl: string;
  name: string;
};

// Define the type for the image state
type ImageState = {
  frame: Frame | null;
  isLoading: boolean;
};

// Canvas utility functions
const createPremAbhaarCanvas = (
  width: number,
  height: number
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
};

export default function Home() {
  const [imageState, setImageState] = useState<ImageState>({
    frame: null,
    isLoading: false,
  });

  const processImage = async (file: File): Promise<Frame> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = async () => {
        // Process the uploaded image: scale, center, and mask to fit the Prem Abhaar frame's transparent circle

        const [canvas, ctx] = createPremAbhaarCanvas(800, 800);

        // === Match the Prem Abhaar frame's transparent circle to canvas scale ===
        // Frame PNG: 6250x6250px, circle center (3125,3125), radius 2625px, margin 500px
        // Canvas: 800x800px, so scale everything down by 800/6250 = 0.128
        const scaleFactor = 800 / 6250;
        const circleCenterX = 3125 * scaleFactor; // 400
        const circleCenterY = 3125 * scaleFactor; // 400
        const circleRadius = 2625 * scaleFactor;  // 336
        // ===========================================================

        // Scale the image to COVER the circle (no whitespace, even for non-square images)
        const scale = (circleRadius * 2) / Math.min(img.width, img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = circleCenterX - scaledWidth / 2;
        const y = circleCenterY - scaledHeight / 2;

        // Draw the user-uploaded image as a circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        ctx.restore();

        // Prem Abhaar Frame: prem-abhaar-frame (only one)
        const premAbhaarFrame = document.createElement('img');
        await new Promise<void>((resolve) => {
          premAbhaarFrame.onload = () => resolve();
          premAbhaarFrame.src = '/prem-abhaar-frame.png';
        });
        ctx.drawImage(premAbhaarFrame, 0, 0, canvas.width, canvas.height);
        const frame = {
          dataUrl: canvas.toDataURL('image/png'),
          name: 'prem-abhaar-dp.png',
        };
        resolve(frame);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageState((prev) => ({ ...prev, isLoading: true }));

    try {
      const frame = await processImage(file);
      setImageState({ frame, isLoading: false });
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
      setImageState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDownload = async (frame: Frame) => {
    try {
      const link = document.createElement('a');
      link.href = frame.dataUrl;
      link.download = frame.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-2 sm:p-4">
      <main className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center gap-3 mb-10 mt-6">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-1 tracking-tight">#PremAbhaar</h1>
          <div className="text-base sm:text-lg text-gray-500 mb-2">Upload your photo to begin.</div>
          <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 transition-all duration-200 text-white px-14 py-5 rounded-xl shadow text-2xl font-semibold mt-6 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
            Upload Image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageState.isLoading}
            />
          </label>
        </div>

        {imageState.isLoading && (
          <div className="text-center text-blue-600 text-xl font-medium animate-pulse mb-8">
            <p>Processing image...</p>
          </div>
        )}

        {imageState.frame && (
          <div className="w-full max-w-xl mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 tracking-tight">Preview</h2>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-blue-100 mb-5 shadow-sm flex items-center justify-center">
              <img
                src={imageState.frame.dataUrl}
                alt="Prem Abhaar Frame"
                className="w-full h-full object-cover rounded-xl border border-gray-200"
                style={{ background: '#f3f4f6' }}
              />
            </div>
            <button
              onClick={() => handleDownload(imageState.frame!)}
              className="mt-2 w-full bg-green-600 hover:bg-green-700 transition-all duration-200 text-white px-10 py-5 rounded-xl shadow text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Download Your DP
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
