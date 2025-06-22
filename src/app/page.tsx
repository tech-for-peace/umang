'use client';

import { useState } from 'react';


type Frame = {
  dataUrl: string;
  name: string;
};

type ImageState = {
  frame: Frame | null;
  isLoading: boolean;
};

// Canvas utility functions
const createCanvas = (
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
        // Process the uploaded image: scale, center, and mask to fit the frame's transparent circle

        const [canvas, ctx] = createCanvas(800, 800);

        // === Match the frame's transparent circle to canvas scale ===
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

        // Frame: breath-frame (only one)
        const breathFrame = document.createElement('img');
        await new Promise<void>((resolve) => {
          breathFrame.onload = () => resolve();
          breathFrame.src = '/prem-abhaar-frame.png';
        });
        ctx.drawImage(breathFrame, 0, 0, canvas.width, canvas.height);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">DP Generator</h1>

        <div className="flex flex-col items-center gap-8">
          <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl">
            Upload Image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageState.isLoading}
            />
          </label>

          {imageState.isLoading && (
            <div className="text-center text-gray-600">
              <p>Processing image...</p>
            </div>
          )}

          {imageState.frame && (
            <div className="w-full max-w-md mx-auto border border-gray-200 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Breath Frame</h2>
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={imageState.frame.dataUrl}
                  alt="Breath Frame"
                  style={{ width: '100%', height: 'auto', borderRadius: '1rem', background: '#eee' }}
                />
              </div>
              <button
                onClick={() => handleDownload(imageState.frame!)}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg"
              >
                Download Frame
              </button>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
