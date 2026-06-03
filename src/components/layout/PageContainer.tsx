import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "home" | "immersive";
}

/** Resolves responsive page gutters for each top-level app layout mode. */
function getPageSpacingClass(variant: PageContainerProps["variant"]): string {
  if (variant === "immersive") return "p-0";
  if (variant === "home") return "px-0 pb-3 pt-0 sm:px-4 xl:px-5 xl:pb-14 xl:pt-28";
  return "px-4 pb-32 pt-20 sm:px-6 xl:px-5 xl:pb-14 xl:pt-28";
}

/** Applies the responsive page gutters used by app views. */
export function PageContainer({ children, className = "", variant = "default" }: PageContainerProps) {
  const spacingClass = getPageSpacingClass(variant);

  return <main className={`min-h-screen w-full max-w-none ${spacingClass} ${className}`}>{children}</main>;
}
