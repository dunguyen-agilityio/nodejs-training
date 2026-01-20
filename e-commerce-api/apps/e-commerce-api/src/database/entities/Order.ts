import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import {
  BaseWithCreatedAndUpdated,
  type BaseWithCreatedAndUpdatedProps,
} from "./Base";
import { OrderItem } from "./OrderItem";
import { User } from "./User";

@Entity({ name: "orders" })
export class Order extends BaseWithCreatedAndUpdated {
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Column({ type: "varchar" })
  status: "pending" | "paid" | "fulfilled" | "completed";

  @Column({ name: "total_amount", type: "decimal" })
  totalAmount: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items?: OrderItem[];

  constructor(order: BaseWithCreatedAndUpdatedProps<Order>) {
    super();
    if (order) {
      Object.assign(this, order);
    }
  }
}
