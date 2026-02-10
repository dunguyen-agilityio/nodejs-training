import { FastifyReply, FastifyRequest } from 'fastify'

import { createMockReply, createMockRequest } from '#test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ICategoryService } from '#services/types'

import { CategoryController } from '../index'

// Mock dependencies
const mockCategoryService = {
  getAll: vi.fn(),
}

describe('CategoryController', () => {
  let categoryController: CategoryController
  let mockRequest: FastifyRequest
  let mockReply: FastifyReply

  beforeEach(() => {
    vi.clearAllMocks()

    categoryController = new CategoryController(
      mockCategoryService as unknown as ICategoryService,
    )

    mockRequest = createMockRequest()
    mockReply = createMockReply()
  })

  describe('getAll', () => {
    it('should retrieve all categories successfully', async () => {
      const mockCategories = [{ id: 1, name: 'Cat1' }]
      mockCategoryService.getAll.mockResolvedValue(mockCategories)

      await categoryController.getAll(mockRequest, mockReply)

      expect(mockCategoryService.getAll).toHaveBeenCalled()
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: mockCategories,
      })
    })
  })
})
