/**
 * Generate a shimmer SVG placeholder for images (blur effect).
 */
export function getImagePlaceholder(width: number, height: number): string {
  const shimmerSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(30,30,30);stop-opacity:1">
            <animate attributeName="offset" values="-2;1" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style="stop-color:rgb(50,50,50);stop-opacity:1">
            <animate attributeName="offset" values="-1;2" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:rgb(30,30,30);stop-opacity:1">
            <animate attributeName="offset" values="0;3" dur="2s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
    </svg>`;
  const base64 = typeof btoa !== 'undefined'
    ? btoa(shimmerSvg)
    : Buffer.from(shimmerSvg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get optimized image URL for CDN delivery.
 */
export function getOptimizedImageUrl(src: string, width: number): string {
  // In production, this would prepend a CDN URL with image optimization params
  if (src.startsWith('http')) {
    return src;
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

/**
 * Generate initials from a name for avatar placeholders.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
