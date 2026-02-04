import { OrderItem } from '#entities'

import { BaseRepository } from '#repositories/base'

export abstract class AbstractOrderItemRepository extends BaseRepository<OrderItem> {}
