import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "home";
}

/** Applies the responsive page gutters used by app views. */
export function PageContainer({ children, className = "", variant = "default" }: PageContainerProps) {
  const spacingClass =
    variant === "home" ? "px-0 pb-3 pt-0 sm:px-4 lg:px-5 lg:pb-14 lg:pt-28" : "px-4 pb-32 pt-20 sm:px-6 lg:px-5 lg:pb-14 lg:pt-28";

  return <main className={`min-h-screen w-full max-w-none ${spacingClass} ${className}`}>{children}</main>;
}
