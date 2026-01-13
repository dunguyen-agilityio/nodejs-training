import { User } from '#entity'

import { AbstractRepository } from '../base'

export abstract class AbstractUserRepository extends AbstractRepository<User> {
  abstract getById(id: string): Promise<User>

  abstract getByUniqueProperty(
    name: 'phone' | 'email',
    value: string,
  ): Promise<User>
}
