"use client";

import { useCart } from "@/context/CartContext";
import { redirect } from "next/navigation";
import { useEffect } from "react";

function Redirect() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    setTimeout(() => redirect("/"), 3000);
  }, [clearCart]);

  return null;
}

export default Redirect;
