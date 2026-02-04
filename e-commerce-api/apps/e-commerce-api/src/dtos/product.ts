import { Product } from '#entities'

export const productToObject = ({ category, ...product }: Product) => {
  return { ...product, category: category.name }
}
