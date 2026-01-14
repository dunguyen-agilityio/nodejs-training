import {
  AbstractCartItemService,
  AbstractProductService,
} from "#services/types";

export type CartPayLoad = {
  productId: number;
  userId: string;
  quantity: number;
};

export type CartDependencies = {
  cartItemService: AbstractCartItemService;
  productService: AbstractProductService;
};
