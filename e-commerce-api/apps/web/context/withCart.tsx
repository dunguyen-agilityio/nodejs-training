"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";

import { JSX } from "react";

type TChild<T> = (props: TWithCart<T>) => React.ReactNode;

export const withCart = <T,>(Comp: TChild<T>) => {
  const NewCompoent = ({ product, ...props }: { product: Product } & T) => {
    const { addToCart } = useCart();

    const handleAddToCart = (product: Product) => {
      addToCart(product, 1);
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
