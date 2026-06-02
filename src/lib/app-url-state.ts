import { isAppView, type AppView } from "../components/layout/types";

export const APP_VIEW_QUERY_PARAM = "view";
export const MENU_ITEM_QUERY_PARAM = "item";
export const APP_PANEL_QUERY_PARAM = "panel";
export const ITEM_MODE_QUERY_PARAM = "mode";

const URL_STATE_BASE = "https://sushi-bliss.local";
const appPanels = ["cart", "checkout"] as const;
const itemModes = ["detail", "customize"] as const;

export type AppPanel = (typeof appPanels)[number];
export type ItemMode = (typeof itemModes)[number];

export interface AppUrlState {
  view: AppView;
  itemId: string | null;
  panel: AppPanel | null;
  itemMode: ItemMode | null;
}

export interface AppUrlStatePatch {
  view?: AppView;
  itemId?: string | null;
  panel?: AppPanel | null;
  itemMode?: ItemMode | null;
}

/** Validates overlay panel values read from shared URLs. */
function isAppPanel(value: string | null | undefined): value is AppPanel {
  return typeof value === "string" && (appPanels as readonly string[]).includes(value);
}

/** Validates item detail mode values before they affect the modal UI. */
function isItemMode(value: string | null | undefined): value is ItemMode {
  return typeof value === "string" && (itemModes as readonly string[]).includes(value);
}

/** Parses the supported Sushi Bliss URL state while safely falling back to the home screen. */
export function getAppUrlState(search: string): AppUrlState {
  const params = new URLSearchParams(search);
  const rawView = params.get(APP_VIEW_QUERY_PARAM);
  const rawItemId = params.get(MENU_ITEM_QUERY_PARAM)?.trim() || null;
  const rawPanel = params.get(APP_PANEL_QUERY_PARAM);
  const rawItemMode = params.get(ITEM_MODE_QUERY_PARAM);

  return {
    view: isAppView(rawView) ? rawView : "home",
    itemId: rawItemId,
    panel: isAppPanel(rawPanel) ? rawPanel : null,
    itemMode: rawItemId ? (isItemMode(rawItemMode) ? rawItemMode : "detail") : null,
  };
}

/** Creates a relative href after applying a view or menu-item state update. */
export function createAppStateHref(currentHref: string, patch: AppUrlStatePatch): string {
  const url = new URL(currentHref, URL_STATE_BASE);

  if (patch.view !== undefined) {
    if (patch.view === "home") url.searchParams.delete(APP_VIEW_QUERY_PARAM);
    else url.searchParams.set(APP_VIEW_QUERY_PARAM, patch.view);
  }

  if (patch.itemId !== undefined) {
    if (patch.itemId) url.searchParams.set(MENU_ITEM_QUERY_PARAM, patch.itemId);
    else {
      url.searchParams.delete(MENU_ITEM_QUERY_PARAM);
      url.searchParams.delete(ITEM_MODE_QUERY_PARAM);
    }
  }

  if (patch.panel !== undefined) {
    if (patch.panel) url.searchParams.set(APP_PANEL_QUERY_PARAM, patch.panel);
    else url.searchParams.delete(APP_PANEL_QUERY_PARAM);
  }

  if (patch.itemMode !== undefined) {
    if (patch.itemMode && patch.itemMode !== "detail") url.searchParams.set(ITEM_MODE_QUERY_PARAM, patch.itemMode);
    else url.searchParams.delete(ITEM_MODE_QUERY_PARAM);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

/** Normalizes a browser location object into the relative URL string used for comparisons. */
export function getRelativeHrefFromLocation(location: Pick<Location, "pathname" | "search" | "hash">): string {
  return `${location.pathname}${location.search}${location.hash}`;
}
