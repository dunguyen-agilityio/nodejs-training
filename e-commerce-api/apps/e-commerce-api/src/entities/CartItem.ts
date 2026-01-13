import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

import { Base, type BaseProps } from "./Base";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity({ name: "cart_items" })
export class CartItem extends Base {
  @OneToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ referencedColumnName: "id", name: "cart_id" })
  cartId: number;

  @OneToOne(() => Product, (product) => product.cartItem)
  @Column({ name: "product_id", type: "int" })
  productId: number;

  @Column({ type: "int" })
  quantity: number;

  constructor(cartItem: BaseProps<CartItem>) {
    super();
    if (cartItem) {
      Object.assign(this, cartItem);
    }
  }
}
