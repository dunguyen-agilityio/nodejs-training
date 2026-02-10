import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Base, type BaseProps } from './Base'
import { Cart } from './Cart'
import { Product } from './Product'

@Entity({ name: 'cart_items' })
export class CartItem extends Base {
  @Column({ name: 'cart_id', type: 'int' })
  cartId: number

  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ referencedColumnName: 'id', name: 'cart_id' })
  cart: Cart

  @Column({ name: 'product_id', type: 'varchar' })
  productId: string

  @ManyToOne(() => Product, (product) => product.cartItems)
  @JoinColumn({ name: 'product_id' })
  product: Product

  @Column({ type: 'int' })
  quantity: number

  constructor(cartItem: BaseProps<CartItem>) {
    super()
    if (cartItem) {
      Object.assign(this, cartItem)
    }
  }
}
