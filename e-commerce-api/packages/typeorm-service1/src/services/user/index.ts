import { User } from '../../entity'
import { AbstractUserRepository } from '../../repositories/types'
import { AbstractUserService } from './type'

export class UserService implements AbstractUserService {
  constructor(private repository: AbstractUserRepository) {}
  async checkUserExistsByPhoneOrEmail({
    email,
    phone,
  }: {
    phone?: string
    email?: string
  }): Promise<boolean> {
    if (!phone && !email) {
      return false
    }
    let user = await this.repository.getByUniqueProperty('phone', phone)

    if (user) return !user
    user = await this.repository.getByUniqueProperty('email', email)

    return !user
  }

  async getUserById(id: string): Promise<User> {
    return this.repository.getById(id)
  }
}
