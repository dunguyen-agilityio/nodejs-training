"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { JSX, useMemo, useState } from "react";

type TChild<T> = (props: TWithCart<T>) => React.ReactNode;

export const withCart = <T,>(Comp: TChild<T>) => {
  const NewCompoent = ({ product, ...props }: { product: Product } & T) => {
    const { cart, addToCart } = useCart();
    const { isSignedIn } = useAuth();
    const item = useMemo(
      () => cart.find((item) => item.product.id === product.id),
      [cart, product],
    );
    const [quantity, setQuantity] = useState(item?.quantity || 1);

    const handleAddToCart = (product: Product) => {
      if (!isSignedIn) {
        redirect("/sign-in");
      }
      setQuantity(quantity + 1);
      addToCart(product, quantity);
    };

    return (
      <Comp
        {...(props as JSX.IntrinsicAttributes & T)}
        product={product}
        addToCart={handleAddToCart}
      />
    );
  };

  return NewCompoent;
};

export type TWithCart<T> = T & {
  addToCart: (product: Product) => void;
};
