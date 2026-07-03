// src/components/ProductImagePlaceholder.tsx
// Shown when a product has no image_url.
// Looks intentional — not a broken placeholder.

interface Props {
  name: string;
  categoryName?: string;
  categoryIcon?: string;
  brandName?: string;
  size?: 'card' | 'detail';
}

// Map category names to accent colours
function getCategoryColor(cat?: string): { bg: string; accent: string; stripe: string } {
  const c = (cat || '').toLowerCase();
  if (c.includes('marine'))       return { bg: '#0a1e3a', accent: '#0ea5e9', stripe: '#0c2a50' };
  if (c.includes('commercial') || c.includes('plywood')) return { bg: '#1a0f06', accent: '#F97316', stripe: '#241508' };
  if (c.includes('mdf'))          return { bg: '#0f1a0a', accent: '#4ADE80', stripe: '#162310' };
  if (c.includes('particle'))     return { bg: '#1a1506', accent: '#eab308', stripe: '#231e08' };
  if (c.includes('laminate'))     return { bg: '#1a0a1a', accent: '#c084fc', stripe: '#241024' };
  if (c.includes('door'))         return { bg: '#1a0c0a', accent: '#fb923c', stripe: '#23110e' };
  if (c.includes('hardware'))     return { bg: '#0a0f1a', accent: '#94a3b8', stripe: '#0d1525' };
  if (c.includes('adhesive'))     return { bg: '#1a1208', accent: '#fbbf24', stripe: '#231a0c' };
  if (c.includes('paint') || c.includes('polish')) return { bg: '#0a1a16', accent: '#34d399', stripe: '#0d2420' };
  return { bg: '#0f1620', accent: '#F97316', stripe: '#141e2c' };
}

export default function ProductImagePlaceholder({ name, categoryName, categoryIcon, brandName, size = 'card' }: Props) {
  const { bg, accent, stripe } = getCategoryColor(categoryName);
  const isDetail = size === 'detail';
  const iconSize = isDetail ? 52 : 32;
  const fontSize = isDetail ? 15 : 11;
  const brandSize = isDetail ? 11 : 9;

  // Shorten name for display
  const shortName = name.length > 28 ? name.slice(0, 26) + '…' : name;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-label={name}
    >
      <defs>
        {/* Wood grain stripes */}
        <pattern id={`grain-${name.slice(0, 4)}`} x="0" y="0" width="40" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <rect width="40" height="8" fill={bg} />
          <rect y="0"   width="40" height="1.2" fill={stripe} opacity="0.9" />
          <rect y="3"   width="40" height="0.6" fill={stripe} opacity="0.5" />
          <rect y="5.5" width="40" height="0.8" fill={stripe} opacity="0.7" />
        </pattern>
        {/* Vignette overlay */}
        <radialGradient id={`vignette-${name.slice(0, 4)}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
        {/* Accent glow */}
        <radialGradient id={`glow-${name.slice(0, 4)}`} cx="50%" cy="45%" r="45%">
          <stop offset="0%"   stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Base wood grain */}
      <rect width="400" height="300" fill={`url(#grain-${name.slice(0, 4)})`} />

      {/* Glow */}
      <rect width="400" height="300" fill={`url(#glow-${name.slice(0, 4)})`} />

      {/* Vignette */}
      <rect width="400" height="300" fill={`url(#vignette-${name.slice(0, 4)})`} />

      {/* Accent line — top */}
      <rect x="0" y="0" width="400" height="2" fill={accent} opacity="0.7" />

      {/* Brand pill — top left */}
      {brandName && (
        <>
          <rect x="14" y="12" width={brandName.length * (brandSize * 0.62) + 16} height={brandSize + 10} rx="3" fill="rgba(0,0,0,0.5)" stroke={accent} strokeWidth="0.6" strokeOpacity="0.4" />
          <text x="22" y={12 + brandSize + 1} fontFamily="monospace" fontSize={brandSize} fontWeight="700" fill={accent} letterSpacing="0.1em" opacity="0.9">
            {brandName.toUpperCase()}
          </text>
        </>
      )}

      {/* Centre icon */}
      <text x="200" y={isDetail ? 130 : 125} textAnchor="middle" fontSize={iconSize} dominantBaseline="middle">
        {categoryIcon || '📦'}
      </text>

      {/* Product name */}
      <text
        x="200" y={isDetail ? 168 : 163}
        textAnchor="middle"
        fontFamily="'Syne', 'Arial Narrow', sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        fill="#F8F9FB"
        letterSpacing="0.06em"
        opacity="0.95"
      >
        {shortName}
      </text>

      {/* Category label */}
      {categoryName && (
        <text
          x="200" y={isDetail ? 186 : 179}
          textAnchor="middle"
          fontFamily="'Syne', Arial, sans-serif"
          fontSize={brandSize + 1}
          fontWeight="600"
          fill={accent}
          letterSpacing="0.14em"
          opacity="0.75"
        >
          {categoryName.toUpperCase()}
        </text>
      )}

      {/* Corner accent lines */}
      <line x1="10" y1="10" x2="30" y2="10" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="10" y1="10" x2="10" y2="30" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="390" y1="10" x2="370" y2="10" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="390" y1="10" x2="390" y2="30" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="10" y1="290" x2="30" y2="290" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="10" y1="290" x2="10" y2="270" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="390" y1="290" x2="370" y2="290" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="390" y1="290" x2="390" y2="270" stroke={accent} strokeWidth="1.5" opacity="0.4" />

      {/* Bottom: "Photo coming soon" — subtle */}
      <text
        x="200" y="285"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fill="#ffffff"
        opacity="0.2"
        letterSpacing="0.12em"
      >
        PRODUCT IMAGE COMING SOON
      </text>
    </svg>
  );
}
