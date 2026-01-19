"use client";

import { useCart } from "@/context/CartContext";

import Link from "next/link";

import { useAuth } from "@clerk/nextjs";

import { useEffect, useState } from "react";
import { post } from "@/lib/api";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();

  const { getToken } = useAuth();

  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const getClientSecret = async () => {
      await post<{ clientSecret: string }>(
        "/create-payment-intent",
        { amount: 200 },
        {
          Authorization: `Bearer ${await getToken({ template: process.env.NEXT_PUBLIC_CLERK_TOKEN_TEMPLATE })}`,
        }
      ).then((data) => setClientSecret(data.clientSecret));
    };
    getClientSecret();
  }, [getToken]);

  // const onSubmit = async (data: CheckoutFormData) => {
  //   if (!userId) {
  //     toast.error("You must be logged in to place an order.");
  //     return;
  //   }

  //   try {
  //     const newOrder: Order = {
  //       id: `ORD-${Date.now()}`,
  //       userId: userId,
  //       date: new Date().toISOString(),
  //       status: "Pending",
  //       total: cartTotal,
  //       items: cart.map((item) => ({
  //         productId: item.product.id,
  //         name: item.product.name,
  //         price: item.product.price,
  //         quantity: item.quantity,
  //         image: item.product.image,
  //       })),
  //       shippingAddress: {
  //         name: `${data.firstName} ${data.lastName}`,
  //         address: data.address,
  //         city: data.city,
  //         zipCode: data.zipCode,
  //         country: data.country,
  //       },
  //     };

  //     await createOrderAction(newOrder);
  //     clearCart();
  //     toast.success("Order placed successfully!");
  //     router.push("/checkout/success");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to place order. Please try again.");
  //   }
  // };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          Your cart is empty
        </h1>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                loader: "auto",
                appearance: { theme: "stripe" },
                clientSecret,
              }}
            >
              <CheckoutForm cartTotal={cartTotal} />
            </Elements>
          )}
        </div>

        <div className="bg-muted p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Order Summary
          </h2>
          <div className="space-y-4 mb-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-muted-foreground">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  ${item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">${cartTotal}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
