import * as React from "react";
import { cn } from "../utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/** Shared text input styled for the Sushi Bliss dark glass UI. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-[var(--sb-border)] bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-[var(--sb-muted)] focus:ring-2 focus:ring-[var(--sb-red-bright)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export default Input;
