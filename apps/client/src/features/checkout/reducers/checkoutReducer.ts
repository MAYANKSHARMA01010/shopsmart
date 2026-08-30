"use client";

export type CheckoutStep = "address" | "payment" | "review" | "processing" | "success" | "failure";

export interface CheckoutState {
  currentStep: CheckoutStep;
  selectedAddressId: string | null;
  couponCode: string;
  isCouponApplied: boolean;
  discountAmount: number;
  paymentMethod: "RAZORPAY" | "COD" | "UPI";
  isProcessing: boolean;
  errorMessage: string | null;
  orderId: string | null;
}

export type CheckoutAction =
  | { type: "SET_STEP"; payload: CheckoutStep }
  | { type: "SELECT_ADDRESS"; payload: string }
  | { type: "SET_COUPON_CODE"; payload: string }
  | { type: "APPLY_COUPON"; payload: { code: string; discountAmount: number } }
  | { type: "REMOVE_COUPON" }
  | { type: "SET_PAYMENT_METHOD"; payload: "RAZORPAY" | "COD" | "UPI" }
  | { type: "START_PROCESSING" }
  | { type: "SET_PAYMENT_SUCCESS"; payload: { orderId: string } }
  | { type: "SET_PAYMENT_FAILURE"; payload: { errorMessage: string } }
  | { type: "RESET_CHECKOUT" };

export const initialCheckoutState: CheckoutState = {
  currentStep: "address",
  selectedAddressId: null,
  couponCode: "",
  isCouponApplied: false,
  discountAmount: 0,
  paymentMethod: "RAZORPAY",
  isProcessing: false,
  errorMessage: null,
  orderId: null,
};

export function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
        errorMessage: null,
      };

    case "SELECT_ADDRESS":
      return {
        ...state,
        selectedAddressId: action.payload,
        errorMessage: null,
      };

    case "SET_COUPON_CODE":
      return {
        ...state,
        couponCode: action.payload,
      };

    case "APPLY_COUPON":
      return {
        ...state,
        couponCode: action.payload.code,
        isCouponApplied: true,
        discountAmount: action.payload.discountAmount,
        errorMessage: null,
      };

    case "REMOVE_COUPON":
      return {
        ...state,
        couponCode: "",
        isCouponApplied: false,
        discountAmount: 0,
      };

    case "SET_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case "START_PROCESSING":
      return {
        ...state,
        isProcessing: true,
        currentStep: "processing",
        errorMessage: null,
      };

    case "SET_PAYMENT_SUCCESS":
      return {
        ...state,
        isProcessing: false,
        currentStep: "success",
        orderId: action.payload.orderId,
        errorMessage: null,
      };

    case "SET_PAYMENT_FAILURE":
      return {
        ...state,
        isProcessing: false,
        currentStep: "failure",
        errorMessage: action.payload.errorMessage,
      };

    case "RESET_CHECKOUT":
      return {
        ...initialCheckoutState,
      };

    default:
      return state;
  }
}
