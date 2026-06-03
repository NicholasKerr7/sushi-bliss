"use client";

import { useEffect, useState } from "react";

export type ResponsiveMode = "mobile" | "tablet" | "desktop";

const tabletQuery = "(min-width: 768px)";
const desktopQuery = "(min-width: 1280px)";
const homeExpandedQuery = "(min-width: 740px)";

/** Reads the current viewport band using the same breakpoints as Tailwind. */
function getResponsiveModeFromViewport(): ResponsiveMode {
  if (typeof window === "undefined") return "mobile";
  if (window.matchMedia(desktopQuery).matches) return "desktop";
  if (window.matchMedia(tabletQuery).matches) return "tablet";
  return "mobile";
}

/** Tracks the active responsive band so image-heavy duplicate layouts do not both mount. */
export function useResponsiveMode(): ResponsiveMode {
  const [mode, setMode] = useState<ResponsiveMode>("mobile");

  useEffect(() => {
    const tabletMedia = window.matchMedia(tabletQuery);
    const desktopMedia = window.matchMedia(desktopQuery);
    const updateMode = () => setMode(getResponsiveModeFromViewport());

    updateMode();
    tabletMedia.addEventListener("change", updateMode);
    desktopMedia.addEventListener("change", updateMode);

    return () => {
      tabletMedia.removeEventListener("change", updateMode);
      desktopMedia.removeEventListener("change", updateMode);
    };
  }, []);

  return mode;
}

/** Returns true when the active viewport should use tablet-or-desktop screen layouts. */
export function useIsExpandedLayout(): boolean {
  return useResponsiveMode() !== "mobile";
}

/** Uses the screenshot-specific home breakpoint so narrow tablet windows do not render the phone home. */
export function useIsHomeExpandedLayout(): boolean {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const homeExpandedMedia = window.matchMedia(homeExpandedQuery);
    const updateMode = () => setIsExpanded(homeExpandedMedia.matches);

    updateMode();
    homeExpandedMedia.addEventListener("change", updateMode);

    return () => {
      homeExpandedMedia.removeEventListener("change", updateMode);
    };
  }, []);

  return isExpanded;
}
