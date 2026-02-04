'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import { ProductCardWithCart } from '../../components/ProductCard'
import { PaginationControls } from '../../components/pagination-controls'
import { SearchInput } from '../../components/search-input'
import { SortSelect } from '../../components/sort-select'
import { getProducts } from '../../lib/data'

export default function ProductList() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? undefined
  const sort = searchParams.get('sort') ?? undefined
  const category = searchParams.get('category') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const { data, error, isLoading } = useQuery({
    queryKey: ['products', { search, sort, category, page }],
    queryFn: () => getProducts({ search, sort, category, page, limit: 10 }),
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const { products, pagination } = data!

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Products</h1>
        <div className="flex gap-4">
          <SearchInput />
          <SortSelect />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCardWithCart key={product.id} product={product} />
        ))}
      </div>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  )
}
