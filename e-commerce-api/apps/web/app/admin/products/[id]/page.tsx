import { ProductForm } from "@/components/admin/product-form";
import { fetchCategories } from "@/lib/category";
import { getProductById } from "@/lib/data";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const response = await getProductById(id);
  const categories = await fetchCategories();

  if (!response) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      <ProductForm initialData={response.data} categories={categories} />
    </div>
  );
}
