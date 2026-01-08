import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

import { Base, BaseProps } from './Base'
import { Order } from './Order'
import { Product } from './Product'

@Entity({ name: 'order_items' })
export class OrderItem extends Base {
  @OneToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  orderId: number

  @OneToOne(() => Product, (product) => product.orderItem)
  @Column({ name: 'product_id' })
  productId: number

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
