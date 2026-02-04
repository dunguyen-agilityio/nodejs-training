import { BaseRepository } from '#repositories/base'

import { Invoice } from '#entities'

export abstract class AbstractInvoiceRepository extends BaseRepository<Invoice> {}
