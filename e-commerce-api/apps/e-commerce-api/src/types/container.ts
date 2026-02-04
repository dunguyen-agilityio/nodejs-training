import type * as Services from '#services/types'

import type * as Repositories from '#repositories/types'

import type * as Controllers from '#controllers/types'

export type TRepository = {
  userRepository: Repositories.UserRepository
  cartItemRepository: Repositories.CartItemRepository
  cartRepository: Repositories.CartRepository
  categoryRepository: Repositories.CategoryRepository
  productRepository: Repositories.ProductRepository
}

export type TService = {
  authService: Services.IAuthService
  cartItemService: Services.ICartItemService
  cartService: Services.ICartService
  categoryService: Services.ICategoryService
  productService: Services.IProductService
  userService: Services.IUserService
  checkoutService: Services.ICheckoutService
}

export type TController = {
  cartController: Controllers.ICartController
  cartItemController: Controllers.ICartItemController
  categoryController: Controllers.ICategoryController
  productController: Controllers.IProductController
  authController: Controllers.IAuthController
  checkoutController: Controllers.ICheckoutController
}
