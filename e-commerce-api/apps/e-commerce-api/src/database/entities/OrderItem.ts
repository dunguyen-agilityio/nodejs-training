import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Base, type BaseProps } from './Base'
import { Order } from './Order'
import { Product } from './Product'

@Entity({ name: 'order_items' })
export class OrderItem extends Base {
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'decimal', name: 'price_at_purchase' })
  priceAtPurchase: number

  constructor(orderItem: BaseProps<OrderItem>) {
    super()
    if (orderItem) {
      Object.assign(this, orderItem)
    }
  }
}
