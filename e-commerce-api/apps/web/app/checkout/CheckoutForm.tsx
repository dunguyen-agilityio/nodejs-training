"use client";

import { post } from "@/lib/api";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { FormEvent, useState } from "react";

import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

function CheckoutForm({ cartTotal }: { cartTotal: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    try {
      await post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/orders/prepare`,
        {},
      );

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        },
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (error.type === "card_error" || error.type === "validation_error") {
        toast.error(error.message || "An unexpected error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error: ", error);
      let message = "An unexpected error occurred.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      // onSubmit1={handleSubmit(onSubmit)}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <PaymentElement options={{ layout: "accordion" }} />

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Processing..." : `Pay ${formatCurrency(cartTotal)}`}
      </button>
    </form>
  );
}

export default CheckoutForm;
