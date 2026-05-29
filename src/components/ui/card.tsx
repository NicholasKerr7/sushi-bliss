import * as React from "react";
import { cn } from "../utils";

/** Shared card wrapper retained for legacy sushi components. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border bg-white text-gray-900", className)} {...props} />;
}

/** Shared card content padding wrapper retained for legacy sushi components. */
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export default Card;
