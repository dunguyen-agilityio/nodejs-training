import { CartItem } from '#entities'

export class CartItemDto extends CartItem {
  constructor(cartItem: CartItem) {
    super(cartItem)
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.product.id,
      productName: this.product.name,
      productImage: this.product.images[0],
      productPrice: this.product.price,
      productStock: this.product.stock,
      quantity: this.quantity,
    }
  }
}
