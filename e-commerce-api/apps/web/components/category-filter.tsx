'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface CategoryFilterProps {
  categories: string[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.getAll('category') || ['All']

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)

    if (category && category !== 'All') {
      if (!params.has('category')) {
        params.set('category', category)
      } else {
        const categories = params.getAll('category')

        params.delete('category')

        categories.forEach((c) => {
          if (c !== category) {
            params.append('category', c)
          }
        })

        if (!categories.includes(category)) {
          params.append('category', category)
        }
      }
    } else {
      params.delete('category')
    }
    params.set('page', '1') // Reset to page 1

    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex-1 flex flex-wrap gap-1">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentCategory.includes(category) ||
            (category === 'All' && currentCategory.length < 1)
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
