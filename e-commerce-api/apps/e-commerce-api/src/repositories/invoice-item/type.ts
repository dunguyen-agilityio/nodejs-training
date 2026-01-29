import { InvoiceItem } from "#entities";
import { BaseRepository } from "#repositories/base";

export abstract class AbstractInvoiceItemRepository extends BaseRepository<InvoiceItem> {}
