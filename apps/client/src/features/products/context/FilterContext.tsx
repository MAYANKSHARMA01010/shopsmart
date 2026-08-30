"use client";

import React, { createContext, useContext, useReducer, useMemo, useCallback } from "react";
import {
  filterReducer,
  initialFilterState,
  type FilterState,
  type FilterAction,
} from "../reducers/filterReducer";

interface FilterContextValue extends FilterState {
  setSearch: (query: string) => void;
  setCategory: (category: string) => void;
  setMinPrice: (min: string) => void;
  setMaxPrice: (max: string) => void;
  setPriceRange: (min: string, max: string) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  toggleInStock: () => void;
  hydrateFromParams: (params: Partial<FilterState>) => void;
  resetFilters: () => void;
  isFiltered: boolean;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: Partial<FilterState>;
}) {
  const [state, dispatch] = useReducer(filterReducer, {
    ...initialFilterState,
    ...initialState,
  });

  const setSearch = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH", payload: query });
  }, []);

  const setCategory = useCallback((category: string) => {
    dispatch({ type: "SET_CATEGORY", payload: category });
  }, []);

  const setMinPrice = useCallback((min: string) => {
    dispatch({ type: "SET_MIN_PRICE", payload: min });
  }, []);

  const setMaxPrice = useCallback((max: string) => {
    dispatch({ type: "SET_MAX_PRICE", payload: max });
  }, []);

  const setPriceRange = useCallback((min: string, max: string) => {
    dispatch({ type: "SET_PRICE_RANGE", payload: { minPrice: min, maxPrice: max } });
  }, []);

  const setSort = useCallback((sort: string) => {
    dispatch({ type: "SET_SORT", payload: sort });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", payload: page });
  }, []);

  const toggleInStock = useCallback(() => {
    dispatch({ type: "TOGGLE_IN_STOCK" });
  }, []);

  const hydrateFromParams = useCallback((params: Partial<FilterState>) => {
    dispatch({ type: "HYDRATE_FROM_PARAMS", payload: params });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const isFiltered = useMemo(() => {
    return !!(
      state.search ||
      (state.category && state.category !== "all") ||
      state.minPrice ||
      state.maxPrice ||
      state.sort !== "newest" ||
      state.inStockOnly
    );
  }, [state.search, state.category, state.minPrice, state.maxPrice, state.sort, state.inStockOnly]);

  const value = useMemo<FilterContextValue>(
    () => ({
      ...state,
      setSearch,
      setCategory,
      setMinPrice,
      setMaxPrice,
      setPriceRange,
      setSort,
      setPage,
      toggleInStock,
      hydrateFromParams,
      resetFilters,
      isFiltered,
    }),
    [
      state,
      setSearch,
      setCategory,
      setMinPrice,
      setMaxPrice,
      setPriceRange,
      setSort,
      setPage,
      toggleInStock,
      hydrateFromParams,
      resetFilters,
      isFiltered,
    ]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

const fallbackFilterContext: FilterContextValue = {
  ...initialFilterState,
  setSearch: () => {},
  setCategory: () => {},
  setMinPrice: () => {},
  setMaxPrice: () => {},
  setPriceRange: () => {},
  setSort: () => {},
  setPage: () => {},
  toggleInStock: () => {},
  hydrateFromParams: () => {},
  resetFilters: () => {},
  isFiltered: false,
};

export function useFilterContext(): FilterContextValue {
  const context = useContext(FilterContext);
  return context || fallbackFilterContext;
}
