import { User } from '#entity'

import { AbstractUserRepository } from '../types'

export class UserRepository extends AbstractUserRepository {
  async getById(id: string): Promise<User> {
    const user = await this.findOne({ where: { id } })
    if (!user) {
      throw new Error(`User with id ${id} not found`)
    }
    return user
  }

  async getByUniqueProperty(
    name: 'phone' | 'email',
    value: string,
  ): Promise<User> {
    const user = await this.findOne({ where: { [name]: value } })
    if (!user) {
      return null
    }
    return user
  }
}
