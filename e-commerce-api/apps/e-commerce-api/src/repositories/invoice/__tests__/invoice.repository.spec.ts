import { describe, expect, it } from 'vitest'

import { InvoiceRepository } from '../index'

describe('InvoiceRepository', () => {
  it('should be defined', () => {
    const repository = new InvoiceRepository({
      target: {} as any,
      manager: {} as any,
    } as any)
    expect(repository).toBeDefined()
    expect(repository).toBeInstanceOf(InvoiceRepository)
  })
})
