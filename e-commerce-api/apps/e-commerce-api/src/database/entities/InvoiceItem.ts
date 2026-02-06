import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Product } from './Product'

@Entity()
export class InvoiceItem {
  @PrimaryColumn({ type: 'varchar' })
  id: string

  @Column({ name: 'invoice_id', type: 'varchar' })
  invoiceId: string

  @ManyToOne(() => Product, (product) => product.invoiceItems)
  @Column({ name: 'product_id', type: 'varchar' })
  product: Product

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
