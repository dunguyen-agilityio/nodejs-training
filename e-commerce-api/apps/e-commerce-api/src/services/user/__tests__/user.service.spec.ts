import {
  createMockRepository,
  loggerMock,
  mockPaymentGateway,
} from '#test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { USER_ROLES } from '#types'

import { UserService } from '../index'

describe('UserService', () => {
  let userService: UserService
  let userRepositoryMock: ReturnType<typeof createMockRepository>

  beforeEach(() => {
    vi.clearAllMocks()

    userRepositoryMock = createMockRepository({
      getById: vi.fn(),
      findOneBy: vi.fn(),
    })

    userService = new UserService(
      userRepositoryMock as any,
      mockPaymentGateway as any,
      loggerMock,
    )
  })

  describe('addRoleForUser', () => {
    it('should add role to user if user exists', async () => {
      const userId = 'user-1'
      const role = USER_ROLES.ADMIN
      const mockUser = { id: userId, role: USER_ROLES.USER }
      userRepositoryMock.getById.mockResolvedValue(mockUser)
      userRepositoryMock.save.mockResolvedValue({ ...mockUser, role })

      const result = await userService.addRoleForUser(userId, role)

      expect(result).toBe(true)
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ role }),
      )
      expect(loggerMock.info).toHaveBeenCalledWith(
        { userId, role },
        'Role added to user successfully',
      )
    })

    it('should return false if user not found', async () => {
      const userId = 'user-1'
      const role = USER_ROLES.ADMIN
      userRepositoryMock.getById.mockResolvedValue(null)

      const result = await userService.addRoleForUser(userId, role)

      expect(result).toBe(false)
      expect(userRepositoryMock.save).not.toHaveBeenCalled()
      expect(loggerMock.warn).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('should fetch user by id', async () => {
      const userId = 'user-1'
      const mockUser = { id: userId }
      userRepositoryMock.findOneBy.mockResolvedValue(mockUser)

      const result = await userService.getById(userId)

      expect(result).toEqual(mockUser)
      expect(userRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: userId })
    })
  })

  describe('save', () => {
    it('should save user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' } as any
      userRepositoryMock.save.mockResolvedValue(mockUser)

      const result = await userService.save(mockUser)

      expect(result).toEqual(mockUser)
      expect(userRepositoryMock.save).toHaveBeenCalledWith(mockUser)
    })
  })

  describe('createStripeCustomer', () => {
    it('should create stripe customer', async () => {
      const params = { email: 'test@example.com', name: 'Test' }
      const mockCustomer = { id: 'cus-1', ...params }
      mockPaymentGateway.createCustomer = vi.fn()
      mockPaymentGateway.createCustomer.mockResolvedValue(mockCustomer)

      const result = await userService.createStripeCustomer(params)

      expect(result).toEqual(mockCustomer)
      expect(mockPaymentGateway.createCustomer).toHaveBeenCalledWith(params)
    })
  })
})
