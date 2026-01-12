import { User } from '#entity'

import { Repository } from 'typeorm'

export abstract class UserRepository extends Repository<User> {
  abstract getById(id: string): Promise<User>

  abstract getByUniqueProperty(
    name: 'phone' | 'email',
    value: string,
  ): Promise<User>
}
