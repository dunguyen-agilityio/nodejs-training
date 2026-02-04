import { BaseRepository } from '#repositories/base'

import { InvoiceItem } from '#entities'

export abstract class AbstractInvoiceItemRepository extends BaseRepository<InvoiceItem> {}
