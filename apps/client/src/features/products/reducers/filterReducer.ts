"use client";

export interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
  inStockOnly: boolean;
}

export type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_MIN_PRICE"; payload: string }
  | { type: "SET_MAX_PRICE"; payload: string }
  | { type: "SET_PRICE_RANGE"; payload: { minPrice: string; maxPrice: string } }
  | { type: "SET_SORT"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "TOGGLE_IN_STOCK" }
  | { type: "HYDRATE_FROM_PARAMS"; payload: Partial<FilterState> }
  | { type: "RESET_FILTERS" };

export const initialFilterState: FilterState = {
  search: "",
  category: "all",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 1,
  inStockOnly: false,
};

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return {
        ...state,
        search: action.payload,
        page: 1,
      };

    case "SET_CATEGORY":
      return {
        ...state,
        category: action.payload,
        page: 1,
      };

    case "SET_MIN_PRICE":
      return {
        ...state,
        minPrice: action.payload,
        page: 1,
      };

    case "SET_MAX_PRICE":
      return {
        ...state,
        maxPrice: action.payload,
        page: 1,
      };

    case "SET_PRICE_RANGE":
      return {
        ...state,
        minPrice: action.payload.minPrice,
        maxPrice: action.payload.maxPrice,
        page: 1,
      };

    case "SET_SORT":
      return {
        ...state,
        sort: action.payload,
        page: 1,
      };

    case "SET_PAGE":
      return {
        ...state,
        page: action.payload,
      };

    case "TOGGLE_IN_STOCK":
      return {
        ...state,
        inStockOnly: !state.inStockOnly,
        page: 1,
      };

    case "HYDRATE_FROM_PARAMS":
      return {
        ...state,
        ...action.payload,
      };

    case "RESET_FILTERS":
      return {
        ...initialFilterState,
      };

    default:
      return state;
  }
}
