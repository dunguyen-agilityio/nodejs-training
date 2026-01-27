import {
  IAuthService,
  ICartItemService,
  ICartService,
  ICategoryService,
  ICheckoutService,
  IOrderService,
  IProductService,
  IUserService,
} from "./types";

export * from "./auth";
export * from "./user";
export * from "./product";
export * from "./category";
export * from "./cart";
export * from "./cart-item";
export * from "./checkout";
export * from "./order";

export type Services = {
  AuthService: IAuthService;
  CartItemService: ICartItemService;
  CartService: ICartService;
  CategoryService: ICategoryService;
  CheckoutService: ICheckoutService;
  OrderService: IOrderService;
  ProductService: IProductService;
  UserService: IUserService;
};
