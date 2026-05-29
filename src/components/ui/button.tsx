import * as React from "react";
import { cn } from "../utils";

type Variant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const classesByVariant: Record<Variant, string> = {
  default: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-[var(--sb-border)] bg-black/20 text-[var(--sb-gold)] hover:bg-white/[0.06]",
  ghost: "hover:bg-white/[0.06]",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-white/[0.08] text-white hover:bg-white/[0.12]"
};

const classesBySize: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-lg"
};

/** Shared button primitive with dark-theme defaults and token-friendly overrides. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400",
        classesByVariant[variant],
        classesBySize[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export default Button;
