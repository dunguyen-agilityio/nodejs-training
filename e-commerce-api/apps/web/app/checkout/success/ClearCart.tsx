"use client";

import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

function ClearCart() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}

export default ClearCart;
