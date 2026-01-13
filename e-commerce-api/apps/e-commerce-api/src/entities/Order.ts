import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";

import {
  BaseWithCreatedAndUpdated,
  type BaseWithCreatedAndUpdatedProps,
} from "./Base";
import { OrderItem } from "./OrderItem";
import { User } from "./User";

@Entity({ name: "orders" })
export class Order extends BaseWithCreatedAndUpdated {
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  @OneToOne(() => User, (user) => user.orders)
  userId: number;

  @Column({ type: "varchar" })
  status: "pending" | "paid" | "fulfilled" | "completed";

  @Column({ name: "total_amount", type: "decimal" })
  totalAmount: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.orderId)
  items?: OrderItem[];

  constructor(order: BaseWithCreatedAndUpdatedProps<Order>) {
    super();
    if (order) {
      Object.assign(this, order);
    }
  }
}
