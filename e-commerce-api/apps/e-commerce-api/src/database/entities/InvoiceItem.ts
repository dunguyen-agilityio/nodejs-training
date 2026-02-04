import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class InvoiceItem {
  @PrimaryColumn({ type: 'varchar' })
  id: string

  @Column({ name: 'invoice_id', type: 'varchar' })
  invoiceId: string

  @Column({ name: 'product_id', type: 'varchar' })
  productId: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ name: 'unit_price', type: 'int' })
  unitPrice: number // cents

  @Column('int')
  quantity: number

  @Column('int')
  total: number // unitPrice * quantity

  constructor(invoice: InvoiceItem) {
    if (invoice) {
      Object.assign(this, invoice)
    }
  }
}
