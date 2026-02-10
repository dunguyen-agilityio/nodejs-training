import { Product } from '#entities'

export class ProductResponseDto extends Product {
  constructor(product: Product) {
    super(product)
  }

  toJSON() {
    return { ...this, category: this.category.name, image: this.images[0] }
  }
}

export const productToObject = (product: Product) => {
  return new ProductResponseDto(product).toJSON()
}
