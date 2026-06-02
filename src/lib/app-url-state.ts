import { isAppView, type AppView } from "../components/layout/types";

export const APP_VIEW_QUERY_PARAM = "view";
export const MENU_ITEM_QUERY_PARAM = "item";

const URL_STATE_BASE = "https://sushi-bliss.local";

export interface AppUrlState {
  view: AppView;
  itemId: string | null;
}

export interface AppUrlStatePatch {
  view?: AppView;
  itemId?: string | null;
}

/** Parses the supported Sushi Bliss URL state while safely falling back to the home screen. */
export function getAppUrlState(search: string): AppUrlState {
  const params = new URLSearchParams(search);
  const rawView = params.get(APP_VIEW_QUERY_PARAM);
  const rawItemId = params.get(MENU_ITEM_QUERY_PARAM)?.trim() || null;

  return {
    view: isAppView(rawView) ? rawView : "home",
    itemId: rawItemId,
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
    else url.searchParams.delete(MENU_ITEM_QUERY_PARAM);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

/** Normalizes a browser location object into the relative URL string used for comparisons. */
export function getRelativeHrefFromLocation(location: Pick<Location, "pathname" | "search" | "hash">): string {
  return `${location.pathname}${location.search}${location.hash}`;
}
