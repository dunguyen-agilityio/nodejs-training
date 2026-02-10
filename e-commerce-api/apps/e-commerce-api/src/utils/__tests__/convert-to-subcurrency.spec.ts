import { describe, expect, it } from 'vitest'

import { convertToSubcurrency } from '../convertToSubcurrency'

describe('convertToSubcurrency', () => {
  it('should convert amount to subcurrency with default factor (100)', () => {
    expect(convertToSubcurrency(10)).toBe(1000)
    expect(convertToSubcurrency(10.5)).toBe(1050)
  })

  it('should convert amount to subcurrency with custom factor', () => {
    expect(convertToSubcurrency(10, 1000)).toBe(10000)
  })

  it('should handle rounding correctly', () => {
    expect(convertToSubcurrency(10.555)).toBe(1056)
  })
})
