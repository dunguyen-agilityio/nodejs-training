import { Cart } from '#entities'

import { CartItemDto } from './cart-item'

export class CartDto extends Cart {
  constructor(cart: Cart) {
    super(cart)
  }

  toJSON() {
    return {
      id: this.id,
      items: this.items.map((item) => new CartItemDto(item).toJSON()),
      status: this.status,
      total: this.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    }
  }
}
