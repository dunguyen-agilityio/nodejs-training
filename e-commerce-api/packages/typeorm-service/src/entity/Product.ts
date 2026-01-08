import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import {
  BaseWithCreatedAndUpdated,
  BaseWithCreatedAndUpdatedProps,
} from './Base'
import { CartItem } from './CartItem'
import { OrderItem } from './OrderItem'

@Entity({ name: 'products' })
export class Product extends BaseWithCreatedAndUpdated {
  @Column()
  name: string

  @Column()
  description: string

  @Column({ type: 'decimal' })
  price: number

  @Column({ type: 'int' })
  stock: number

  @Column('simple-array')
  images: string[]

  @ManyToOne(() => CartItem, (cartItem) => cartItem.productId)
  cartItem?: CartItem

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.productId)
  orderItem?: OrderItem

  @Column({ type: 'int', name: 'category_id' })
  @JoinColumn({ referencedColumnName: 'id' })
  categoryId: number

  constructor(product: BaseWithCreatedAndUpdatedProps<Product>) {
    super()
    if (product) {
      Object.assign(this, product)
    }
  }
}
