import { describe, expect, it } from 'vitest'

import { InvoiceItemRepository } from '../index'

describe('InvoiceItemRepository', () => {
  it('should be defined', () => {
    const repository = new InvoiceItemRepository({
      target: {} as any,
      manager: {} as any,
    } as any)
    expect(repository).toBeDefined()
    expect(repository).toBeInstanceOf(InvoiceItemRepository)
  })
})
