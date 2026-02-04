import { Edit, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getCategories, getProducts } from '@/lib/data'

import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { DuplicateProductButton } from '@/components/admin/duplicate-product-button'
import { CategoryFilter } from '@/components/category-filter'
import { PaginationControls } from '@/components/pagination-controls'
import { SearchInput } from '@/components/search-input'
import { SortSelect } from '@/components/sort-select'

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    sort?: string
    page?: string
  }>
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const { search, category, sort, page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10

  const { products, pagination } = await getProducts({
    search,
    category,
    sort,
    page: currentPage,
    limit,
  })

  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-lg border">
        <SearchInput />
        <div className="flex gap-4 w-full md:w-auto">
          <CategoryFilter categories={categories} />
          <div className="w-[200px]">
            <SortSelect />
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Category
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Price
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex gap-4 items-center">
                        <figure className="w-20 h-14 relative">
                          <Image
                            src={product.images[0] || '/file-text.svg'}
                            alt={product.name}
                            fill
                            sizes="100%"
                            objectFit="contain"
                          />
                        </figure>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{product.category}</td>
                    <td className="p-4 align-middle">${product.price}</td>
                    <td className="p-4 align-middle">{product.stock}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <DuplicateProductButton product={product} />
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <PaginationControls
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
        />
      )}
    </div>
  )
}
