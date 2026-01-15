import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

import { Base, type BaseProps } from "./Base";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity({ name: "cart_items" })
export class CartItem extends Base {
  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ referencedColumnName: "id", name: "cart_id" })
  cartId: number;

  @OneToOne(() => Product, (product) => product.cartItem)
  @JoinColumn({ name: "product_id" })
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
