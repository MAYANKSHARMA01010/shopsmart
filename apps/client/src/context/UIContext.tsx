"use client";

import React, { createContext, useContext, useReducer, useMemo, useCallback } from "react";
import { uiReducer, initialUIState, type UIState, type UIAction } from "@/reducers/uiReducer";
import type { Product } from "@/features/products/types/productSchema";

interface UIContextValue extends UIState {
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  toggleMobileNav: () => void;
  setMobileNav: (open: boolean) => void;
  openSearchOverlay: () => void;
  closeSearchOverlay: () => void;
  toggleFilterDrawer: () => void;
  setFilterDrawer: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  closeAll: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  const openQuickView = useCallback((product: Product) => {
    dispatch({ type: "OPEN_QUICK_VIEW", payload: product });
  }, []);

  const closeQuickView = useCallback(() => {
    dispatch({ type: "CLOSE_QUICK_VIEW" });
  }, []);

  const toggleMobileNav = useCallback(() => {
    dispatch({ type: "TOGGLE_MOBILE_NAV" });
  }, []);

  const setMobileNav = useCallback((open: boolean) => {
    dispatch({ type: "SET_MOBILE_NAV", payload: open });
  }, []);

  const openSearchOverlay = useCallback(() => {
    dispatch({ type: "OPEN_SEARCH_OVERLAY" });
  }, []);

  const closeSearchOverlay = useCallback(() => {
    dispatch({ type: "CLOSE_SEARCH_OVERLAY" });
  }, []);

  const toggleFilterDrawer = useCallback(() => {
    dispatch({ type: "TOGGLE_FILTER_DRAWER" });
  }, []);

  const setFilterDrawer = useCallback((open: boolean) => {
    dispatch({ type: "SET_FILTER_DRAWER", payload: open });
  }, []);

  const openModal = useCallback((modalId: string) => {
    dispatch({ type: "OPEN_MODAL", payload: modalId });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);

  const closeAll = useCallback(() => {
    dispatch({ type: "CLOSE_ALL" });
  }, []);

  const value = useMemo<UIContextValue>(
    () => ({
      ...state,
      openQuickView,
      closeQuickView,
      toggleMobileNav,
      setMobileNav,
      openSearchOverlay,
      closeSearchOverlay,
      toggleFilterDrawer,
      setFilterDrawer,
      openModal,
      closeModal,
      closeAll,
    }),
    [
      state,
      openQuickView,
      closeQuickView,
      toggleMobileNav,
      setMobileNav,
      openSearchOverlay,
      closeSearchOverlay,
      toggleFilterDrawer,
      setFilterDrawer,
      openModal,
      closeModal,
      closeAll,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

const fallbackUIContext: UIContextValue = {
  ...initialUIState,
  openQuickView: () => {},
  closeQuickView: () => {},
  toggleMobileNav: () => {},
  setMobileNav: () => {},
  openSearchOverlay: () => {},
  closeSearchOverlay: () => {},
  toggleFilterDrawer: () => {},
  setFilterDrawer: () => {},
  openModal: () => {},
  closeModal: () => {},
  closeAll: () => {},
};

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  return context || fallbackUIContext;
}

