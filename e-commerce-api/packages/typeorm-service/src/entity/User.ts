import { Column, Entity, OneToMany, OneToOne } from 'typeorm'

import {
  BaseWithCreatedAndUpdated,
  BaseWithCreatedAndUpdatedProps,
} from './Base'
import { Cart } from './Cart'
import { Order } from './Order'

@Entity({ name: 'users' })
export class User extends BaseWithCreatedAndUpdated {
  @Column({ unique: true })
  username: string

  @Column({ name: 'first_name' })
  firstName: string

  @Column({ name: 'last_name', nullable: true })
  lastName: string

  @Column({ nullable: true })
  age: number

  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  phone: string

  @Column({ nullable: true })
  avatar: string

  @Column()
  password: string

  @OneToOne(() => Cart, (cart) => cart.userId)
  cart?: Cart

  @OneToMany(() => Order, (order) => order.userId)
  orders?: Order[]

  constructor(user: BaseWithCreatedAndUpdatedProps<User>) {
    super()
    if (user) {
      Object.assign(this, user)
    }
  }
}
