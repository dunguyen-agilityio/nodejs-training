import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import {
  BaseWithCreatedAndUpdated,
  type BaseWithCreatedAndUpdatedProps,
} from "./Base";
import { CartItem } from "./CartItem";
import { OrderItem } from "./OrderItem";
import { Category } from "./Category";

@Entity({ name: "products" })
export class Product extends BaseWithCreatedAndUpdated {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  description: string;

  @Column({ type: "decimal" })
  price: number;

  @Column({ type: "int" })
  stock: number;

  @Column({ type: "simple-array", nullable: true })
  images: string[];

  @OneToMany(() => CartItem, (cartItem: CartItem) => cartItem.product)
  cartItems?: CartItem[];

  @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.product)
  orderItems?: OrderItem[];

  @JoinColumn({ referencedColumnName: "name", name: "category" })
  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  constructor(product: BaseWithCreatedAndUpdatedProps<Product>) {
    super();
    if (product) {
      Object.assign(this, product);
    }
  }
}
