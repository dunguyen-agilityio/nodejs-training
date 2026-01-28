import {
  ICartItemService,
  IOrderService,
  IProductService,
  IUserService,
} from "#services/types";

export type CheckoutDependecies = {
  userService: IUserService;
  productService: IProductService;
  orderService: IOrderService;
  //    orderItemService: IOrderItemService;
  cartItemService: ICartItemService;
};
