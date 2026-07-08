import type { ImgHTMLAttributes } from 'react';
import { isSafeImageUrl } from './safeImageUrl.ts';

export default function SafeImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src || !isSafeImageUrl(src)) {
    return null;
  }

  return <img src={src} {...props} />;
}
