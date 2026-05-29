import Image from "next/image";

interface AssetIconProps {
  alt?: string;
  className?: string;
  size?: number;
  src: string;
}

/** Points packaged PNG icons at cleaned transparent derivatives when available. */
function resolveIconSource(src: string): string {
  return src.startsWith("/assets/icons/") ? src.replace("/assets/icons/", "/assets/icons-clean/") : src;
}

/** Renders one of the packaged raster icon assets with consistent sizing. */
export function AssetIcon({ alt = "", className = "", size = 24, src }: AssetIconProps) {
  return <Image src={resolveIconSource(src)} alt={alt} width={size} height={size} className={`object-contain ${className}`} />;
}
