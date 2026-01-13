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
  @PrimaryColumn({ type: 'varchar' })
  id: string

  @Column({ unique: true, type: 'varchar', nullable: true })
  username: string

  @Column({ name: 'first_name', type: 'varchar' })
  firstName: string

  @Column({ name: 'last_name', nullable: true, type: 'varchar' })
  lastName: string

  @Column({ nullable: true, type: 'int' })
  age?: number

  @Column({ unique: true, type: 'varchar' })
  email: string

  @Column({ unique: true, type: 'varchar', nullable: true })
  phone: string

  @Column({ nullable: true, type: 'varchar' })
  avatar: string

  @Column({ type: 'varchar', nullable: true })
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
