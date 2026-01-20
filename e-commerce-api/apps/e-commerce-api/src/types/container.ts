import type * as Repositories from "#repositories/types";
import type * as Services from "#services/types";
import type * as Controllers from "#controllers/types";

export type TRepository = {
  userRepository: Repositories.UserRepository;
  cartItemRepository: Repositories.CartItemRepository;
  cartRepository: Repositories.CartRepository;
  categoryRepository: Repositories.CategoryRepository;
  productRepository: Repositories.ProductRepository;
};

export type TService = {
  authService: Services.AuthService;
  cartItemService: Services.CartItemService;
  cartService: Services.CartService;
  categoryService: Services.CategoryService;
  productService: Services.ProductService;
  userService: Services.UserService;
  paymentService: Services.PaymentGateway;
  checkoutService: Services.CheckoutService;
  stripePaymentGatewateService: Services.PaymentGateway;
};

export type TController = {
  cartController: Controllers.CartController;
  cartItemController: Controllers.CartItemController;
  categoryController: Controllers.CategoryController;
  productController: Controllers.ProductController;
  userController: Controllers.UserController;
  authController: Controllers.AuthController;
  checkoutController: Controllers.CheckoutController;
};
