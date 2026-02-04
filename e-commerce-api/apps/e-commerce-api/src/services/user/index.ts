import { User } from '#entities'
import {
  Customer,
  CustomerCreateParams,
  PaymentGateway,
  USER_ROLES,
} from '#types'

import type { TUserRepository } from '#repositories'

import { IUserService } from './type'

export class UserService implements IUserService {
  constructor(
    private userRepository: TUserRepository,
    private paymentGateway: PaymentGateway,
  ) {}

  async addRoleForUser(userId: string, role: USER_ROLES): Promise<boolean> {
    const user = await this.userRepository.getById(userId)

    if (!user) {
      return false
    }
    await this.userRepository.save({ ...user, role })
    return true
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id })
  }

  save(user: User): Promise<User> {
    return this.userRepository.save(user)
  }

  async createStripeCustomer(params: CustomerCreateParams): Promise<Customer> {
    return await this.paymentGateway.createCustomer(params)
  }
}
