import { Invoice } from '#entities'

import { BaseRepository } from '#repositories/base'

export abstract class AbstractInvoiceRepository extends BaseRepository<Invoice> {}
