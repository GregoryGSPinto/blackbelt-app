'use client';

interface BlackBeltLogoProps {
  variant?: 'full' | 'navbar' | 'icon';
  mode?: 'dark' | 'light';
  className?: string;
  height?: number;
}

export function BlackBeltLogo({ variant = 'navbar', mode = 'dark', className = '', height = 36 }: BlackBeltLogoProps) {
  const textColor = mode === 'dark' ? '#FFFFFF' : '#0A0A0A';
  const goldOpacity = mode === 'dark' ? 0.6 : 0.4;

  if (variant === 'icon') {
    return (
      <svg width={height} height={height} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="scale(0.94)">
          <path d="M8 32 C8 14, 22 4, 32 4 L48 4 C58 4, 62 14, 62 22 C62 30, 58 36, 48 36 L32 36 C22 36, 18 42, 18 50 C18 58, 26 62, 36 62 L52 62 C62 62, 68 52, 68 42 L68 22 C68 10, 58 0, 46 0 L24 0 C10 0, 0 14, 0 32 C0 50, 10 64, 24 64 L46 64" stroke="#C62828" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28 22 C28 18, 32 16, 36 16 L44 16 C48 16, 50 20, 50 24 C50 28, 46 32, 42 32 L36 32 C30 32, 28 36, 28 40 C28 46, 34 48, 40 48 L48 48" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={goldOpacity}/>
        </g>
      </svg>
    );
  }

  if (variant === 'navbar') {
    const w = Math.round(height * 5);
    return (
      <svg width={w} height={height} viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(0, 2) scale(0.55)">
          <path d="M8 32 C8 14, 22 4, 32 4 L48 4 C58 4, 62 14, 62 22 C62 30, 58 36, 48 36 L32 36 C22 36, 18 42, 18 50 C18 58, 26 62, 36 62 L52 62 C62 62, 68 52, 68 42 L68 22 C68 10, 58 0, 46 0 L24 0 C10 0, 0 14, 0 32 C0 50, 10 64, 24 64 L46 64" stroke="#C62828" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
          <path d="M28 22 C28 18, 32 16, 36 16 L44 16 C48 16, 50 20, 50 24 C50 28, 46 32, 42 32 L36 32 C30 32, 28 36, 28 40 C28 46, 34 48, 40 48 L48 48" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={goldOpacity}/>
        </g>
        <text x="48" y="27" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="22" fill={textColor} letterSpacing="1.5">BLACK</text>
        <text x="122" y="27" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="22" fill="#C62828" letterSpacing="1.5">BELT</text>
      </svg>
    );
  }

  // variant === 'full'
  const w = Math.round(height * 4);
  return (
    <svg width={w} height={height} viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(0, 8)">
        <path d="M8 32 C8 14, 22 4, 32 4 L48 4 C58 4, 62 14, 62 22 C62 30, 58 36, 48 36 L32 36 C22 36, 18 42, 18 50 C18 58, 26 62, 36 62 L52 62 C62 62, 68 52, 68 42 L68 22 C68 10, 58 0, 46 0 L24 0 C10 0, 0 14, 0 32 C0 50, 10 64, 24 64 L46 64" stroke="#C62828" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M28 22 C28 18, 32 16, 36 16 L44 16 C48 16, 50 20, 50 24 C50 28, 46 32, 42 32 L36 32 C30 32, 28 36, 28 40 C28 46, 34 48, 40 48 L48 48" stroke="#D4AF37" strokeWidth="2" fill="none" strokeLinecap="round" opacity={goldOpacity}/>
        <rect x="50" y="58" width="14" height="6" rx="2" fill="#C62828" opacity="0.5"/>
      </g>
      <text x="88" y="52" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="42" fill={textColor} letterSpacing="3">BLACK</text>
      <text x="232" y="52" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="42" fill="#C62828" letterSpacing="3">BELT</text>
    </svg>
  );
}
