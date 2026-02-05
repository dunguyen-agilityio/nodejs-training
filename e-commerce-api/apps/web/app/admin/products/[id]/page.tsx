import { notFound } from 'next/navigation'

import { fetchCategories } from '@/lib/category'
import { getProductById } from '@/lib/data'

import { ProductForm } from '@/components/admin/product-form'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    getProductById(id),
    fetchCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        {product.deleted && (
          <span className="text-red-600/50 leading-5 text-sm font-bold uppercase">
            Deleted
          </span>
        )}
      </div>
      <ProductForm initialData={product} categories={categories} />
    </div>
  )
}
