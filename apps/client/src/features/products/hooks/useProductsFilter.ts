"use client";

import { useEffect, useReducer, useCallback, useMemo } from "react";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useDebounce } from "@/hooks/useDebounce";
import {
  filterReducer,
  initialFilterState,
  type FilterState,
} from "../reducers/filterReducer";

/**
 * Domain hook encapsulating search, category, price range, and sort
 * state synchronized with URL search params and debounced execution.
 */
export function useProductsFilter() {
  const { searchParams, setParams } = useQueryParams();

  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "all";
  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  const urlSort = searchParams.get("sort") || "newest";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlInStock = searchParams.get("inStock") === "true";

  const [state, dispatch] = useReducer(filterReducer, {
    search: urlSearch,
    category: urlCategory,
    minPrice: urlMinPrice,
    maxPrice: urlMaxPrice,
    sort: urlSort,
    page: isNaN(urlPage) ? 1 : urlPage,
    inStockOnly: urlInStock,
  });

  // Debounce rapid user typing in search input
  const debouncedSearch = useDebounce(state.search, 400);
  // Debounce price input modifications
  const debouncedMinPrice = useDebounce(state.minPrice, 600);
  const debouncedMaxPrice = useDebounce(state.maxPrice, 600);

  // Sync internal state to URL parameters
  const syncToUrl = useCallback(
    (updates: Partial<FilterState>) => {
      const paramUpdates: Record<string, string | null> = {};

      if (updates.search !== undefined) {
        paramUpdates.search = updates.search || null;
      }
      if (updates.category !== undefined) {
        paramUpdates.category = updates.category === "all" ? null : updates.category;
      }
      if (updates.minPrice !== undefined) {
        paramUpdates.minPrice = updates.minPrice || null;
      }
      if (updates.maxPrice !== undefined) {
        paramUpdates.maxPrice = updates.maxPrice || null;
      }
      if (updates.sort !== undefined) {
        paramUpdates.sort = updates.sort === "newest" ? null : updates.sort;
      }
      if (updates.page !== undefined) {
        paramUpdates.page = updates.page === 1 ? null : String(updates.page);
      }
      if (updates.inStockOnly !== undefined) {
        paramUpdates.inStock = updates.inStockOnly ? "true" : null;
      }

      setParams(paramUpdates);
    },
    [setParams]
  );

  // Push debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      syncToUrl({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, urlSearch, syncToUrl]);

  // Push debounced price range to URL
  useEffect(() => {
    if (debouncedMinPrice !== urlMinPrice || debouncedMaxPrice !== urlMaxPrice) {
      syncToUrl({ minPrice: debouncedMinPrice, maxPrice: debouncedMaxPrice, page: 1 });
    }
  }, [debouncedMinPrice, debouncedMaxPrice, urlMinPrice, urlMaxPrice, syncToUrl]);

  // Sync category changes immediately
  const handleCategoryChange = useCallback(
    (category: string) => {
      dispatch({ type: "SET_CATEGORY", payload: category });
      syncToUrl({ category, page: 1 });
    },
    [syncToUrl]
  );

  // Sync sort changes immediately
  const handleSortChange = useCallback(
    (sort: string) => {
      dispatch({ type: "SET_SORT", payload: sort });
      syncToUrl({ sort, page: 1 });
    },
    [syncToUrl]
  );

  // Sync page changes immediately
  const handlePageChange = useCallback(
    (page: number) => {
      dispatch({ type: "SET_PAGE", payload: page });
      syncToUrl({ page });
    },
    [syncToUrl]
  );

  // Clear all filters
  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    setParams({
      search: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      sort: null,
      page: null,
      inStock: null,
    });
  }, [setParams]);

  const isFiltered = useMemo(() => {
    return !!(
      urlSearch ||
      (urlCategory && urlCategory !== "all") ||
      urlMinPrice ||
      urlMaxPrice ||
      urlSort !== "newest" ||
      urlInStock
    );
  }, [urlSearch, urlCategory, urlMinPrice, urlMaxPrice, urlSort, urlInStock]);

  return {
    state,
    dispatch,
    urlParams: {
      search: urlSearch,
      category: urlCategory,
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
      sort: urlSort,
      page: String(urlPage),
      inStock: urlInStock,
    },
    isFiltered,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
    handleReset,
  };
}
