import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'

import { CreatedAndUpdated } from './Base'
import { CartItem } from './CartItem'
import { OrderItem } from './OrderItem'
import { Category } from './Category'

@Entity({ name: 'products' })
export class Product extends CreatedAndUpdated {
  @PrimaryColumn({ type: 'varchar' })
  id: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  description: string

  @Column({ type: 'decimal' })
  price: number

  @Column({ type: 'int' })
  stock: number

  @Column({ type: 'int', default: 0 })
  reservedStock: number

  @Column({ type: 'simple-array', nullable: true })
  images: string[]

  @OneToMany(() => CartItem, (cartItem: CartItem) => cartItem.product)
  cartItems?: CartItem[]

  @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.product)
  orderItems?: OrderItem[]

  @JoinColumn({ referencedColumnName: 'name', name: 'category' })
  @ManyToOne(() => Category, (category) => category.products)
  category: Category

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean

  constructor(product: Product) {
    super()
    if (product) {
      Object.assign(this, product)
    }
  }
}
