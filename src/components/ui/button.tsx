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
  outline: "border border-gray-300 hover:bg-gray-50",
  ghost: "hover:bg-black/5",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-gray-100 hover:bg-gray-200"
};

const classesBySize: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-lg"
};

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
