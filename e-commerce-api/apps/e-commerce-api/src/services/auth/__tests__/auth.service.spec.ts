import { FastifyBaseLogger } from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import env from '#env'

import { TCartRepository, TUserRepository } from '#repositories'

import { EmailProvider, PaymentGateway, USER_ROLES } from '#types'

import { User } from '#entities'

import { AuthService } from '../index'

describe('AuthService', () => {
  let authService: AuthService
  let userRepositoryMock: ReturnType<typeof vi.mocked<TUserRepository>>
  let cartRepositoryMock: ReturnType<typeof vi.mocked<TCartRepository>>
  let paymentGatewayProviderMock: ReturnType<typeof vi.mocked<PaymentGateway>>
  let mailProviderMock: ReturnType<typeof vi.mocked<EmailProvider>>
  let loggerMock: ReturnType<typeof vi.mocked<FastifyBaseLogger>>
  let identityProviderMock: any

  beforeEach(() => {
    userRepositoryMock = {
      save: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<TUserRepository>>

    cartRepositoryMock = {
      save: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<TCartRepository>>

    paymentGatewayProviderMock = {
      findOrCreateCustomer: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<PaymentGateway>>

    mailProviderMock = {
      sendWithTemplate: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<EmailProvider>>

    loggerMock = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<FastifyBaseLogger>>

    // Mock env variables if necessary, or ensure they are set for tests
    // For simplicity, we'll assume env is properly set up in test environment
    // If env.client.baseUrl or other properties were dynamic, you'd mock env as well.
    Object.assign(env, {
      client: {
        baseUrl: 'http://localhost:3000',
        loginPath: '/login',
      },
      sendgrid: {
        fromEmail: 'no-reply@example.com',
        templates: {
          registerSuccess: 'register-success-template-id',
        },
        supportEmail: 'support@example.com',
      },
      app: {
        name: 'E-commerce App',
        logoUrl: 'http://localhost:3000/logo.png',
        year: 2026,
      },
    })

    identityProviderMock = {
      login: vi.fn(),
    }

    authService = new AuthService(
      userRepositoryMock,
      cartRepositoryMock,
      paymentGatewayProviderMock,
      mailProviderMock,
      loggerMock,
      identityProviderMock,
    )
  })

  describe('register', () => {
    it('should successfully register a new user and send a confirmation email', async () => {
      // Arrange
      const newUserBody: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'avatar.png',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        phone: '1234567890',
        age: 30,
        role: USER_ROLES.USER,
        stripeId: 'stripe-customer-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'password123', // Assuming password is part of User type but handled by auth
      }

      const mockCustomer = { id: 'stripe-customer-123' } as any
      paymentGatewayProviderMock.findOrCreateCustomer.mockResolvedValue(
        mockCustomer,
      )
      userRepositoryMock.save.mockResolvedValue(newUserBody)
      cartRepositoryMock.save.mockResolvedValue({
        id: 1,
        user: newUserBody,
        status: 'active',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      mailProviderMock.sendWithTemplate.mockResolvedValue(undefined) // sendWithTemplate doesn't return anything specific

      // Act
      const result = await authService.register(newUserBody)

      // Assert
      expect(
        paymentGatewayProviderMock.findOrCreateCustomer,
      ).toHaveBeenCalledWith({
        email: newUserBody.email,
        name: newUserBody.name,
      })
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: newUserBody.email,
          stripeId: mockCustomer.id,
        }),
      )
      expect(cartRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user: newUserBody,
          status: 'active',
          items: [],
        }),
      )
      expect(mailProviderMock.sendWithTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: newUserBody.email,
          templateId: env.mail.templates.registerSuccess,
          dynamicTemplateData: expect.objectContaining({
            name: newUserBody.name,
            email: newUserBody.email,
          }),
        }),
      )
      expect(loggerMock.info).toHaveBeenCalledWith(
        { email: newUserBody.email, name: newUserBody.name },
        'Registering new user',
      )
      expect(loggerMock.debug).toHaveBeenCalledWith(
        { userId: newUserBody.id },
        'Cart created for user',
      )
      expect(loggerMock.info).toHaveBeenCalledWith(
        { userId: newUserBody.id, email: newUserBody.email },
        'User registered successfully, confirmation email sent',
      )
      expect(result).toEqual(newUserBody)
    })
  })
})
