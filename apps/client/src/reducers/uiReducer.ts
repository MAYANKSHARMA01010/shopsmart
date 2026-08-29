"use client";

import type { Product } from "@/features/products/types/productSchema";

export interface UIState {
  quickViewProduct: Product | null;
  isMobileNavOpen: boolean;
  isSearchOverlayOpen: boolean;
  isFilterDrawerOpen: boolean;
  activeModal: string | null;
}

export type UIAction =
  | { type: "OPEN_QUICK_VIEW"; payload: Product }
  | { type: "CLOSE_QUICK_VIEW" }
  | { type: "TOGGLE_MOBILE_NAV" }
  | { type: "SET_MOBILE_NAV"; payload: boolean }
  | { type: "OPEN_SEARCH_OVERLAY" }
  | { type: "CLOSE_SEARCH_OVERLAY" }
  | { type: "TOGGLE_FILTER_DRAWER" }
  | { type: "SET_FILTER_DRAWER"; payload: boolean }
  | { type: "OPEN_MODAL"; payload: string }
  | { type: "CLOSE_MODAL" }
  | { type: "CLOSE_ALL" };

export const initialUIState: UIState = {
  quickViewProduct: null,
  isMobileNavOpen: false,
  isSearchOverlayOpen: false,
  isFilterDrawerOpen: false,
  activeModal: null,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "OPEN_QUICK_VIEW":
      return {
        ...state,
        quickViewProduct: action.payload,
        activeModal: "quick-view",
      };

    case "CLOSE_QUICK_VIEW":
      return {
        ...state,
        quickViewProduct: null,
        activeModal: state.activeModal === "quick-view" ? null : state.activeModal,
      };

    case "TOGGLE_MOBILE_NAV":
      return {
        ...state,
        isMobileNavOpen: !state.isMobileNavOpen,
      };

    case "SET_MOBILE_NAV":
      return {
        ...state,
        isMobileNavOpen: action.payload,
      };

    case "OPEN_SEARCH_OVERLAY":
      return {
        ...state,
        isSearchOverlayOpen: true,
      };

    case "CLOSE_SEARCH_OVERLAY":
      return {
        ...state,
        isSearchOverlayOpen: false,
      };

    case "TOGGLE_FILTER_DRAWER":
      return {
        ...state,
        isFilterDrawerOpen: !state.isFilterDrawerOpen,
      };

    case "SET_FILTER_DRAWER":
      return {
        ...state,
        isFilterDrawerOpen: action.payload,
      };

    case "OPEN_MODAL":
      return {
        ...state,
        activeModal: action.payload,
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        activeModal: null,
      };

    case "CLOSE_ALL":
      return {
        ...initialUIState,
      };

    default:
      return state;
  }
}
