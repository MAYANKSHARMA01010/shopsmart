import React from "react";
import { useInitializeCheckout, useVerifyPayment } from "../hooks/useCheckout";
import { useCheckoutStore } from "../store/checkoutStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useCartStore } from "../../cart/store/cartStore";
import { loadRazorpay } from "../../../lib/razorpay";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { env } from "../../../lib/env";

export const PaymentButton: React.FC = () => {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const { addressId, couponCode, paymentStatus, setPaymentStatus, setError } = useCheckoutStore();
  const initializeCheckout = useInitializeCheckout();
  const verifyPayment = useVerifyPayment();

  const handlePayment = async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      toast.error("Please sign in to complete checkout");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!addressId) {
      toast.error("Please add and select a delivery address");
      return;
    }

    try {
      setPaymentStatus("processing");
      // 1. Initialize Checkout (Backend)
      const checkoutRes: any = await initializeCheckout.mutateAsync({
        addressId,
        gatewayProvider: "RAZORPAY",
        couponCode: couponCode || undefined,
      });

      const responsePayload = checkoutRes?.data || checkoutRes;
      const orderData = responsePayload?.order;
      const gatewayOrderId = responsePayload?.gatewayOrderId || responsePayload?.payment?.gatewayOrderId;
      const totalPaise = Math.round(Number(orderData?.totalAmount || orderData?.total || 0) * 100);

      if (!gatewayOrderId || !orderData) {
        throw new Error("Invalid checkout response from server");
      }

      // 2. Load Razorpay dynamically
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // 3. Open Razorpay Modal
      const options = {
        key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TUdtEncDnM7HM0",
        amount: totalPaise,
        currency: env.NEXT_PUBLIC_DEFAULT_CURRENCY || "INR",
        name: env.NEXT_PUBLIC_DEFAULT_APP_NAME || "ShopSmart",
        description: `Order Payment for #${orderData?.id ? String(orderData.id).slice(0, 8) : "Order"}`,
        order_id: gatewayOrderId,

        // Enable all payment methods including UPI
        // Note: config.display blocks API requires production-level merchant setup
        // — simply enabling method.upi is sufficient for UPI + QR to appear.
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: true,
        },

        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(`/checkout/success?orderId=${orderData?.id || ""}`);
          } catch {
            router.push("/checkout/failure");
          }
        },
        prefill: {
          name: user?.name || "ShopSmart Customer",
          email: user?.email || "customer@example.com",
          contact: user?.phone || "+919876543210",
        },
        theme: {
          color: "#1A5C52",
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("idle");
            toast("Payment cancelled");
          },
        },
      };


      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void; on: (event: string, handler: (resp: { error: { description: string } }) => void) => void } }).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.on("payment.failed", (response: { error: { description: string } }) => {
        setPaymentStatus("failure");
        setError(response.error.description);
        router.push("/checkout/failure");
      });

      rzp.open();
      // Sync cart store with backend (since checkout clears DB cart items)
      useCartStore.getState().fetchCart();
    } catch (error: any) {
      setPaymentStatus("idle");
      const serverMsg = error?.response?.data?.message || error?.message || "Payment initiation failed";
      toast.error(serverMsg);
      if (typeof serverMsg === "string" && serverMsg.toLowerCase().includes("cart is empty")) {
        useCartStore.getState().fetchCart();
      }
    }
  };

  const isProcessing = paymentStatus === "processing";

  let buttonLabel = "Pay Now";
  if (isProcessing) {
    buttonLabel = "Processing...";
  } else if (!token) {
    buttonLabel = "Sign In to Place Order →";
  } else if (!addressId) {
    buttonLabel = "Select Delivery Address to Pay";
  }

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={isProcessing}
      aria-label={buttonLabel}
      className={`btn btn-primary${isProcessing ? " btn-loading" : ""}`}
      style={{
        width: "100%",
        height: "50px",
        fontSize: "1rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isProcessing ? "not-allowed" : "pointer",
        borderRadius: "var(--radius-lg)",
      }}
    >
      {buttonLabel}
    </button>
  );
};
