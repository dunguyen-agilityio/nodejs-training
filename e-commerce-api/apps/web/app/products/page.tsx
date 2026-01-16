"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "../../lib/api";
import { Product } from "../../lib/types";

const getProducts = async () => {
  return get<Product[]>("/products");
};

export default function ProductsPage() {
  console.log("ProductsPage");
  const {
    data: products,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Products</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {products?.map((product) => (
          <div
            key={product.id}
            style={{ border: "1px solid #ccc", padding: "1rem" }}
          >
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
