import { Suspense } from 'react'

import ProductList from './product-list'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductList />
    </Suspense>
  )
}
