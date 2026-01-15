"use client";

import { useCart } from "@/context/CartContext";
import { checkoutSchema, type CheckoutFormData } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Order placed:", { data, cart, total: cartTotal });
    clearCart();
    router.push("/checkout/success");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Your cart is empty</h1>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  {...register("email")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    {...register("firstName")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    {...register("lastName")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="address" className="text-sm font-medium text-foreground">
                  Address
                </label>
                <input
                  id="address"
                  {...register("address")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="city" className="text-sm font-medium text-foreground">
                    City
                  </label>
                  <input
                    id="city"
                    {...register("city")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="zipCode" className="text-sm font-medium text-foreground">
                    Zip Code
                  </label>
                  <input
                    id="zipCode"
                    {...register("zipCode")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="country" className="text-sm font-medium text-foreground">
                    Country
                  </label>
                  <input
                    id="country"
                    {...register("country")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Payment Details</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="cardNumber" className="text-sm font-medium text-foreground">
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  {...register("cardNumber")}
                  placeholder="0000 0000 0000 0000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.cardNumber && (
                  <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="expiryDate" className="text-sm font-medium text-foreground">
                    Expiry Date
                  </label>
                  <input
                    id="expiryDate"
                    {...register("expiryDate")}
                    placeholder="MM/YY"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="cvv" className="text-sm font-medium text-foreground">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    {...register("cvv")}
                    placeholder="123"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.cvv && (
                    <p className="text-sm text-destructive">{errors.cvv.message}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : `Pay $${cartTotal}`}
            </button>
          </form>
        </div>

        <div className="bg-muted p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-foreground">Order Summary</h2>
          <div className="space-y-4 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  ${item.price * item.quantity}
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
