import {
  IAdminOrderController,
  IAuthController,
  ICartController,
  ICartItemController,
  ICategoryController,
  ICheckoutController,
  IMetricController,
  IOrderController,
  IProductController,
} from './types'

export * from './auth'
export * from './product'
export * from './cart'
export * from './category'
export * from './cart-item'
export * from './checkout'
export * from './order'
export * from './admin-order'
export * from './metric'

export type TControllers = {
  adminOrderController: IAdminOrderController
  authController: IAuthController
  productController: IProductController
  cartController: ICartController
  categoryController: ICategoryController
  cartItemController: ICartItemController
  checkoutController: ICheckoutController
  orderController: IOrderController
  metricController: IMetricController
}
