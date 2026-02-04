import { describe, expect, it } from 'vitest'

import { create, hasProperty } from '../object'

describe('object utils', () => {
  describe('create', () => {
    it('should create key mapping pair', () => {
      const result = create('testKey', {})
      expect(result).toEqual(['testKey', 'testKey'])
    })

    it('should create key mapping with type suffix', () => {
      const result = create('testKey', { type: 'Suffix' })
      expect(result).toEqual(['testKeySuffix', 'testKeySuffix'])
    })

    it('should use nameMapping if provided', () => {
      const result = create('key1', {
        nameMapping: { key1: 'mappedKey' },
      })
      expect(result).toEqual(['key1', 'mappedKey'])
    })
  })

  describe('hasProperty', () => {
    it('should return true if property exists', () => {
      expect(hasProperty('foo', { foo: 'bar' })).toBe(true)
    })

    it('should return false if property does not exist', () => {
      expect(hasProperty('baz', { foo: 'bar' })).toBe(false)
    })
  })
})
