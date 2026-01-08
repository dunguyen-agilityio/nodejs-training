import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm'

import {
  BaseWithCreatedAndUpdated,
  BaseWithCreatedAndUpdatedProps,
} from './Base'
import { CartItem } from './CartItem'
import { User } from './User'

@Entity({ name: 'carts' })
export class Cart extends BaseWithCreatedAndUpdated {
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  userId: number

  @Column()
  status: 'active' | 'abandoned' | 'converted'

  @OneToMany(() => CartItem, (cartItem) => cartItem.cartId)
  items?: CartItem[]

  constructor(cart: BaseWithCreatedAndUpdatedProps<Cart>) {
    super()
    if (cart) {
      Object.assign(this, cart)
    }
  }
}
