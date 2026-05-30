import Image from "next/image";

interface AssetIconProps {
  alt?: string;
  className?: string;
  size?: number;
  src: string;
}

/** Renders one of the packaged raster icon assets with consistent sizing. */
export function AssetIcon({ alt = "", className = "", size = 24, src }: AssetIconProps) {
  return <Image src={src} alt={alt} width={size} height={size} className={`object-contain ${className}`} />;
}
