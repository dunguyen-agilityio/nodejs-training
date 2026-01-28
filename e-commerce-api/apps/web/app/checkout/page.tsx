import Link from "next/link";

import { post } from "@/lib/api";
import CheckoutForm from "./CheckoutForm";
import { auth } from "@clerk/nextjs/server";
import Provider from "./Provider";
import { getCarts } from "@/lib/cart";
import { getCartTotal } from "@/lib/utils";

export default async function CheckoutPage() {
  const { getToken } = await auth();

  const getClientSecret = async () => {
    const token = await getToken({
      template: process.env.NEXT_PUBLIC_CLERK_TOKEN_TEMPLATE,
    });
    return await post<{ clientSecret: string }>(
      "/create-payment-intent",
      { amount: 200 },
      {
        Authorization: `Bearer ${token}`,
      },
    ).then((data) => data.clientSecret);
  };
  const clientSecret = await getClientSecret();

  const cartItems = await getCarts();

  const cartTotal = getCartTotal(cartItems);

  if (cartItems.length === 0) {
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
          <Provider clientSecret={clientSecret}>
            <CheckoutForm cartTotal={cartTotal} />
          </Provider>
        </div>

        <div className="bg-muted p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Order Summary
          </h2>
          <div className="space-y-4 mb-4">
            {cartItems.map((item) => (
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
