import {
  IAuthController,
  ICartController,
  ICartItemController,
  ICategoryController,
  ICheckoutController,
  IMetricController,
  IOrderController,
  IProductController,
  IUserController,
} from "./types";

export * from "./auth";
export * from "./product";
export * from "./user";
export * from "./cart";
export * from "./category";
export * from "./cart-item";
export * from "./checkout";
export * from "./order";
export * from "./metric";

export type Controllers = {
  AuthController: IAuthController;
  ProductController: IProductController;
  UserController: IUserController;
  CartController: ICartController;
  CategoryController: ICategoryController;
  CartItemController: ICartItemController;
  CheckoutController: ICheckoutController;
  OrderController: IOrderController;
  MetricController: IMetricController;
};
