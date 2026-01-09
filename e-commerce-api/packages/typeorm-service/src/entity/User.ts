import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Cart } from './Cart'
import { Order } from './Order'

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  username: string

  @Column({ name: 'first_name' })
  firstName: string

  @Column({ name: 'last_name', nullable: true })
  lastName: string

  @Column({ nullable: true })
  age?: number

  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  phone: string

  @Column({ nullable: true })
  avatar: string

  @Column()
  password?: string

  @OneToOne(() => Cart, (cart) => cart.userId)
  cart?: Cart

  @OneToMany(() => Order, (order) => order.userId)
  orders?: Order[]

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'datetime' })
  @UpdateDateColumn({ name: 'updated_at' })
  'updatedAt': Date

  constructor(user: User) {
    if (user) {
      Object.assign(this, user)
    }
  }
}
