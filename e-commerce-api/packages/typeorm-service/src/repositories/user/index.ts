import { User } from '#entity'

import { Repository } from 'typeorm'

import { UserRepository } from '../types'

class UserRepositoryImpl extends UserRepository {
  constructor({ manager }: Repository<User>) {
    super(User, manager)
  }

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

export { UserRepositoryImpl as UserRepository }
