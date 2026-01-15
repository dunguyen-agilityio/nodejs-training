import { products } from "@/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import AddToCartButton from "./AddToCartButton";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-[500px]">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
        <div className="space-y-6">
          <nav className="text-sm text-gray-500">
            Home / {product.category} / {product.name}
          </nav>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold">${product.price}</p>
          <div className="border-y py-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  );
}
