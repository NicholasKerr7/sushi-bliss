interface AssetIconProps {
  alt?: string;
  className?: string;
  size?: number;
  src: string;
}

/** Renders one of the packaged raster icon assets with consistent sizing. */
export function AssetIcon({ alt = "", className = "", size = 24, src }: AssetIconProps) {
  return <img src={src} alt={alt} width={size} height={size} loading="lazy" decoding="async" className={`inline-block shrink-0 object-contain ${className}`} />;
}
