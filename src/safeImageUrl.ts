export function isSafeImageUrl(url: string): boolean {
  return url.startsWith('blob:') || url.startsWith('data:image/png;') || url.startsWith('/');
}

export function toSafeImageUrl(url: string): string {
  if (!isSafeImageUrl(url)) {
    throw new Error('Unsafe image URL');
  }

  return url;
}
