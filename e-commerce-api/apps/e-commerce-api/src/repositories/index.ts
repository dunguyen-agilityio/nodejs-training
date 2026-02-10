import {
  TCartItemRepository,
  TCartRepository,
  TCategoryRepository,
  TInvoiceItemRepository,
  TInvoiceRepository,
  TOrderItemRepository,
  TOrderRepository,
  TProductRepository,
  TStockreservationRepository,
  TUserRepository,
} from './types'

export * from './user'
export * from './product'
export * from './cart'
export * from './category'
export * from './cart-item'
export * from './order'
export * from './order-item'
export * from './invoice'
export * from './invoice-item'
export * from './stock-reservation'

export * from './types'

export type TRepositories = {
  productRepository: TProductRepository
  userRepository: TUserRepository
  cartRepository: TCartRepository
  cartItemRepository: TCartItemRepository
  categoryRepository: TCategoryRepository
  orderRepository: TOrderRepository
  orderItemRepository: TOrderItemRepository
  invoiceRepository: TInvoiceRepository
  invoiceItemRepository: TInvoiceItemRepository
  stockReservationRepository: TStockreservationRepository
}
