import {
  IAuthService,
  ICartService,
  ICategoryService,
  ICheckoutService,
  IInventoryService,
  IMetricService,
  IOrderService,
  IProductService,
  IUserService,
} from './types'

export * from './auth'
export * from './user'
export * from './product'
export * from './category'
export * from './cart'
export * from './checkout'
export * from './order'
export * from './metric'
export * from './inventory/index'

export type TServices = {
  authService: IAuthService
  cartService: ICartService
  categoryService: ICategoryService
  checkoutService: ICheckoutService
  orderService: IOrderService
  productService: IProductService
  userService: IUserService
  adminService: IMetricService
  inventoryService: IInventoryService
}
