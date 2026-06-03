/** Shared responsive breakpoints used by Tailwind and viewport-aware React code. */
export const responsiveBreakpoints = {
  sm: "640px",
  md: "740px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type ResponsiveBreakpoint = keyof typeof responsiveBreakpoints;

/** Creates a min-width media query from the shared breakpoint table. */
export function createMinWidthQuery(breakpoint: ResponsiveBreakpoint): string {
  return `(min-width: ${responsiveBreakpoints[breakpoint]})`;
}
