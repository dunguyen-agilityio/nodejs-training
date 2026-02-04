import { User } from '#entities'
import { Customer, CustomerCreateParams } from '#types'

export interface IUserService {
  addRoleForUser(userId: string, role: string): Promise<boolean>
  getById(id: string): Promise<User | null>
  save(user: User): Promise<User>
  createStripeCustomer(params: CustomerCreateParams): Promise<Customer>
}
