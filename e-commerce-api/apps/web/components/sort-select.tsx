'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    if (sort) {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }
    // Keep page if desired, or reset. Resetting is usually safer when sorting changes order.
    params.set('page', '1')

    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
      value={searchParams.get('sort') || ''}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="">Sort by...</option>
      <option value="name-asc">Name (A-Z)</option>
      <option value="name-desc">Name (Z-A)</option>
      <option value="price-asc">Price (Low to High)</option>
      <option value="price-desc">Price (High to Low)</option>
      <option value="stock-asc">Stock (Low to High)</option>
      <option value="stock-desc">Stock (High to Low)</option>
    </select>
  )
}
