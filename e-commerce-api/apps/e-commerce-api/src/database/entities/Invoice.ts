import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

import { InvoiceStatus } from '#types'

@Entity()
export class Invoice {
  @PrimaryColumn({ type: 'varchar' })
  id: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string

  @Column({ name: 'cart_id', type: 'int' })
  cartId: number

  @Column({ nullable: true, name: 'payment_intent_id', type: 'varchar' })
  paymentIntentId?: string

  // money
  @Column({ type: 'varchar' })
  currency: string

  @Column({ type: 'int', name: 'total_amount' })
  totalAmount: number // cents

  // state
  @Column({
    default: InvoiceStatus.DRAFT,
    enum: InvoiceStatus,
    type: 'enum',
  })
  status: InvoiceStatus

  // timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ nullable: true, name: 'paid_at', type: 'timestamptz' })
  paidAt?: Date

  constructor(invoice: Invoice) {
    if (invoice) {
      Object.assign(this, invoice)
    }
  }
}
